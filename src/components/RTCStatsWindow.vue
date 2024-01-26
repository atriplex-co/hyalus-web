<template>
  <div
    v-if="store.call"
    ref="root"
    class="fixed flex flex-col z-[1000] resize bg-ctp-mantle border border-ctp-surface0/50 overflow-hidden rounded-md shadow-lg shadow-black/25 text-ctp-text"
    style="left: 100px; top: 100px; width: 800px; height: 600px"
  >
    <div
      class="h-8 bg-ctp-crust flex items-center justify-between pl-2 flex-shrink-0 shadow-md text-sm"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
    >
      <div class="space-x-2 flex items-center">
        <ChartBarIcon class="w-4 h-4" />
        <p>RTC Debug Menu</p>
      </div>
      <button
        class="h-full px-2 flex items-center transition hover:text-ctp-text text-ctp-overlay0"
        @click="$emit('close')"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
    <div class="p-2 overflow-auto flex-1 divide-y divide-ctp-surface0/50 text-sm">
      <div class="p-1">
        <p>
          <span class="font-bold">State</span>:
          <span
            :class="{
              'text-ctp-green': store.call.pc.connectionState === 'connected',
              'text-ctp-yellow': store.call.pc.connectionState === 'disconnected',
              'text-ctp-red': store.call.pc.connectionState === 'failed',
            }"
            >{{ store.call.pc.connectionState }}</span
          >
        </p>
        <p><span class="font-bold">Bytes Sent</span>: {{ bytesSent }}</p>
        <p><span class="font-bold">Bytes Recv</span>: {{ bytesRecv }}</p>
        <p><span class="font-bold">Packets Sent</span>: {{ packetsSent }}</p>
        <p><span class="font-bold">Packets Recv</span>: {{ packetsRecv }}</p>
        <p>
          <span class="font-bold">Send NACK Count</span>: {{ sendNackCount }} ({{
            Math.round((sendNackCount / (packetsSent || 1)) * 100 * 100) / 100
          }}%)
        </p>
        <p>
          <span class="font-bold">Recv NACK Count</span>: {{ recvNackCount }} ({{
            Math.round((recvNackCount / (packetsRecv || 1)) * 100 * 100) / 100
          }}%)
        </p>
        <p><span class="font-bold">Send PLI Count</span>: {{ sendPliCount }}</p>
        <p><span class="font-bold">Recv PLI Count</span>: {{ recvPliCount }}</p>
        <p><span class="font-bold">RTT</span>: {{ Math.round(rtt * 1000 * 100) / 100 }}ms</p>
      </div>
      <RTCStatsItem v-for="stat in stats" :key="stat.id" :data="stat" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "@/global/store";
import { XMarkIcon } from "@heroicons/vue/20/solid";
import { computed, onUnmounted, ref, type Ref } from "vue";
import RTCStatsItem from "./RTCStatsItem.vue";
import { ChartBarIcon } from "@heroicons/vue/16/solid";

const store = useStore();
let x = 100;
let y = 100;
let ox = 0;
let oy = 0;
let updateInterval = 0;
const root = ref<HTMLElement | null>(null);
const stats: Ref<any[]> = ref([]);
defineEmits(["close"]);

const onMouseMove = (e: MouseEvent) => {
  x = e.clientX - ox;
  y = e.clientY - oy;
  root.value!.style.left = `${x}px`;
  root.value!.style.top = `${y}px`;
};

const onMouseDown = (e: MouseEvent) => {
  addEventListener("mousemove", onMouseMove);
  addEventListener("keydown", onMouseUp);
  ox = e.clientX - x;
  oy = e.clientY - y;
};

const onMouseUp = () => {
  removeEventListener("mousemove", onMouseMove);
  removeEventListener("keydown", onMouseUp);
};

const update = async () => {
  if (!store.call) {
    return;
  }
  const newStats: any[] = [];
  (await store.call.pc.getStats()).forEach((v) => {
    newStats.push(v);
  });
  stats.value = newStats;
};

updateInterval = +setInterval(update, 1000);
update();

onUnmounted(() => {
  removeEventListener("mousemove", onMouseMove);
  clearInterval(updateInterval);
});

const sendNackCount = computed(() => {
  let ret = 0;
  for (const stat of stats.value) {
    if (stat.type === "outbound-rtp" && stat.nackCount) {
      ret += stat.nackCount;
    }
  }
  return ret;
});

const recvNackCount = computed(() => {
  let ret = 0;
  for (const stat of stats.value) {
    if (stat.type === "inbound-rtp" && stat.nackCount) {
      ret += stat.nackCount;
    }
  }
  return ret;
});

const sendPliCount = computed(() => {
  let ret = 0;
  for (const stat of stats.value) {
    if (stat.type === "outbound-rtp" && stat.pliCount) {
      ret += stat.pliCount;
    }
  }
  return ret;
});

const recvPliCount = computed(() => {
  let ret = 0;
  for (const stat of stats.value) {
    if (stat.type === "inbound-rtp" && stat.pliCount) {
      ret += stat.pliCount;
    }
  }
  return ret;
});

const packetsSent = computed(() => {
  let ret = 0;
  for (const stat of stats.value) {
    if (stat.type === "outbound-rtp" && stat.packetsSent) {
      ret += stat.packetsSent;
    }
  }
  return ret;
});

const packetsRecv = computed(() => {
  let ret = 0;
  for (const stat of stats.value) {
    if (stat.type === "inbound-rtp" && stat.packetsReceived) {
      ret += stat.packetsReceived;
    }
  }
  return ret;
});

const bytesSent = computed(() => {
  let ret = 0;
  for (const stat of stats.value) {
    if (stat.type === "outbound-rtp" && stat.bytesSent) {
      ret += stat.bytesSent;
    }
  }
  return ret;
});

const bytesRecv = computed(() => {
  let ret = 0;
  for (const stat of stats.value) {
    if (stat.type === "inbound-rtp" && stat.bytesReceived) {
      ret += stat.bytesReceived;
    }
  }
  return ret;
});

const rtt = computed(() => {
  for (const stat of stats.value) {
    if (stat.type === "candidate-pair" && stat.nominated) {
      return stat.totalRoundTripTime / stat.responsesReceived;
    }
  }
  return 0;
});
</script>
