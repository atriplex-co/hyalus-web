<template>
  <ModalBase empty @close="$emit('close')">
    <div
      class="flex h-96 min-h-0 w-screen max-w-xl flex-col space-y-4 rounded-md bg-ctp-mantle p-4 shadow-md"
    >
      <input
        type="text"
        class="w-full rounded-md border-ctp-base bg-ctp-crust p-4 ring-ctp-accent transition focus:ring-2"
        ref="inputEl"
        @input="onInput"
        @keydown="onKeydown"
        v-model="search"
      />
      <div class="flex min-h-0 flex-1 flex-col space-y-2">
        <p v-if="!search" class="font-semibold">Recent Channels</p>
        <div class="-mx-1 flex-1 overflow-auto">
          <QuickSwitcherItem
            v-for="item in items"
            :key="item.channel.id"
            :channel="item.channel"
            :space="item.space"
            :selected="index === items.indexOf(item)"
          />
        </div>
      </div>
    </div>
  </ModalBase>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref, nextTick, computed } from "vue";
import ModalBase from "./ModalBase.vue";
import { useStore } from "@/global/store";
import type { IChannel, ISpace } from "@/global/types";
import { useRouter } from "vue-router";
import QuickSwitcherItem from "./QuickSwitcherItem.vue";
import { ChannelType } from "@/../../hyalus-server/src/types";

const emit = defineEmits(["close"]);
const store = useStore();
const router = useRouter();
const inputEl: Ref<HTMLInputElement | null> = ref(null);
const search = ref("");
const index = ref(0);

const items = computed(() => {
  const ret: {
    channel: IChannel;
    space?: ISpace;
  }[] = [];
  if (!search.value) {
    for (const id of store.config.recentChannelIds) {
      if (ret.length === 5) {
        break;
      }
      const channel = store.channels.find((channel) => channel.id === id);
      if (!channel) {
        continue;
      }
      if (channel.spaceId) {
        const space = store.spaces.find((space) => space.id === channel.spaceId);
        if (!space) {
          continue;
        }
        ret.push({
          channel,
          space,
        });
        continue;
      }
      ret.push({ channel });
    }
  } else {
    const dmChannels = store.channels
      .filter(
        (channel) =>
          channel.type === ChannelType.DM &&
          (channel.members[0].name.toLowerCase().includes(search.value.toLowerCase()) ||
            channel.members[0].username.toLowerCase().includes(search.value.toLowerCase())),
      )
      .slice(0, 5);
    const groupChannels = store.channels
      .filter(
        (channel) =>
          channel.type === ChannelType.Group &&
          channel.name!.toLowerCase().includes(search.value.toLowerCase()),
      )
      .slice(0, 10);
    const spaceChannels = store.channels
      .filter(
        (channel) =>
          channel.type === ChannelType.SpaceText &&
          channel.name!.toLowerCase().includes(search.value.toLowerCase()),
      )
      .slice(0, 10);
    const channels = [
      ...dmChannels,
      ...[...groupChannels, ...spaceChannels].sort((a, b) => (+a.activeAt > +b.activeAt ? -1 : 1)),
    ];
    for (const channel of channels) {
      if (channel.spaceId) {
        const space = store.spaces.find((space) => space.id === channel.spaceId);
        if (!space) {
          continue;
        }
        ret.push({
          channel,
          space,
        });
        continue;
      }
      ret.push({ channel });
    }
  }
  return ret;
});

const onInput = () => {
  index.value = 0;
  // TODO: calculate search results
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "ArrowUp") {
    if (index.value !== 0) {
      index.value--;
    } else {
      index.value = items.value.length - 1;
    }
  }

  if (e.key === "ArrowDown") {
    if (index.value < items.value.length - 1) {
      index.value++;
    } else {
      index.value = 0;
    }
  }

  if (e.key === "Enter") {
    const recentChannel = items.value[index.value];
    if (!recentChannel) {
      return;
    }
    router.push(`/channels/${recentChannel.channel.id}`);
    emit("close");
  }
};

onMounted(async () => {
  await nextTick();
  await nextTick(); // wait for ModalBase to set up
  inputEl.value!.focus();
});
</script>
