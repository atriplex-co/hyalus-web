<template>
  <div
    v-if="store.call"
    class="top-0 flex flex-col bg-ctp-crust"
    :class="{
      'h-full flex-1': full,
    }"
    :style="!full ? `height: ${resizeHeight}px;` : ''"
    @mouseenter="controls = true"
    @mouseleave="controls = false"
  >
    <ChannelHeader
      :channel="channel"
      class="absolute top-0 z-10 w-full transition"
      :class="{
        'opacity-0': !controls,
        'opacity-100': controls,
      }"
    />
    <div
      ref="tileContainer"
      class="relative flex-1 transition-all"
      :class="{
        'm-16': controls,
      }"
    >
      <ChannelCallTile v-for="tile in tiles" :key="tile.id" :tile="tile" />
    </div>
    <div
      class="absolute bottom-0 flex w-full items-end justify-center space-x-4 py-4 transition"
      :class="{
        'opacity-0': !controls,
        'opacity-100': controls,
      }"
    >
      <div @click="store.callSetMuted(!store.call.muted)">
        <div
          class="h-12 w-12 cursor-pointer rounded-full p-3.5 transition"
          :class="{
            'bg-ctp-text text-ctp-base': store.call.muted,
            'bg-ctp-mantle text-ctp-overlay0 hover:text-ctp-text': !store.call.muted,
          }"
        >
          <MicIcon v-if="!store.call.muted" />
          <MicOffIcon v-else />
        </div>
      </div>
      <div @click="toggleStream(CallStreamType.Video)">
        <div
          class="h-12 w-12 cursor-pointer rounded-full p-3.5 transition"
          :class="{
            'bg-ctp-text text-ctp-base': videoStream,
            'bg-ctp-mantle text-ctp-overlay0 hover:text-ctp-text': !videoStream,
          }"
        >
          <VideoCameraIcon v-if="videoStream" />
          <VideoCameraSlashIcon v-else />
        </div>
      </div>
      <div @click="stop">
        <CallEndIcon
          class="h-12 w-12 cursor-pointer rounded-full bg-ctp-red p-3 text-ctp-base transition hover:bg-ctp-red/75"
        />
      </div>
      <div @click="toggleStream(CallStreamType.DisplayVideo)">
        <ComputerDesktopIcon
          class="h-12 w-12 cursor-pointer rounded-full p-3.5 transition"
          :class="{
            'bg-ctp-text text-ctp-base': displayVideoStream,
            'bg-ctp-mantle text-ctp-overlay0 hover:text-ctp-text': !displayVideoStream,
          }"
        />
      </div>
      <div @click="store.callSetDeaf(!store.call.deaf)">
        <div
          class="h-12 w-12 cursor-pointer rounded-full p-3.5 transition"
          :class="{
            'bg-ctp-text text-ctp-base': store.call.deaf,
            'bg-ctp-mantle text-ctp-overlay0 hover:text-ctp-text': !store.call.deaf,
          }"
        >
          <SpeakerXMarkIcon v-if="store.call.deaf" />
          <SpeakerWaveIcon v-else />
        </div>
      </div>
    </div>
    <div
      class="absolute bottom-0 left-0 h-px w-full cursor-ns-resize"
      @mousedown="resizeMouseDown"
    ></div>
    <DesktopCaptureModal v-if="desktopCaptureModal" @close="desktopCaptureModal = false" />
  </div>
</template>

<script lang="ts" setup>
import DesktopCaptureModal from "./DesktopCaptureModal.vue";
import ChannelCallTile from "./ChannelCallTile.vue";
import CallEndIcon from "@/icons/CallEndIcon.vue";
import MicIcon from "@/icons/MicIcon.vue";
import MicOffIcon from "@/icons/MicOffIcon.vue";
import { ref, computed, onMounted, type Ref, onBeforeUnmount } from "vue";
import { CallStreamType } from "@/../../hyalus-server/src/types";
import { isDesktop } from "@/global/helpers";
import { useStore } from "@/global/store";
import type { ICallTile, IChannelMember, ISpaceMember } from "@/global/types";
import ChannelHeader from "./ChannelHeader.vue";
import {
  ComputerDesktopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
} from "@heroicons/vue/20/solid";

defineProps({
  full: {
    type: Boolean,
    default: false,
  },
});

const store = useStore();

const controls = ref(false);
const desktopCaptureModal = ref(false);
const tileContainer: Ref<HTMLDivElement | null> = ref(null);
const resizeHeight = ref(innerHeight * 0.5);
let resizeY = 0;

const getComputedStream = (type: CallStreamType) => {
  return computed(() => {
    if (!store.call) {
      return undefined;
    }

    return store.call.localStreams.find((track) => track.type === type);
  });
};

const audioStream = getComputedStream(CallStreamType.Audio);
const videoStream = getComputedStream(CallStreamType.Video);
const displayVideoStream = getComputedStream(CallStreamType.DisplayVideo);

const channel = computed(() => {
  return store.channels.find((channel) => channel.id === store.call?.channelId);
});

const tiles = computed(() => {
  if (!store.self || !store.call || !channel.value) {
    return [];
  }
  let members: IChannelMember[] | ISpaceMember[] = channel.value.members;
  if (channel.value.spaceId) {
    const space = store.spaces.find((space) => space.id === channel.value!.spaceId);
    if (!space) {
      return;
    }
    members = space.members;
  }

  const tiles: ICallTile[] = [];

  for (const state of store.voiceStates.filter((state) => state.channelId === channel.value!.id)) {
    const member = members.find((member2) => member2.id === state.id);
    if (!member) {
      continue;
    }

    const userTiles: ICallTile[] = [];
    const streams = store.call.remoteStreams.filter((stream) => stream.userId === member.id);
    const audioStream = streams.find((stream) => stream.type === CallStreamType.Audio);
    const videoStream = streams.find((stream) => stream.type === CallStreamType.Video);
    const displayVideoStream = streams.find(
      (stream) => stream.type === CallStreamType.DisplayVideo,
    );

    if (videoStream) {
      userTiles.push({
        id: "",
        user: member,
        localTrack: null,
        remoteTrack: videoStream,
      });
    }

    if (displayVideoStream) {
      userTiles.push({
        id: "",
        user: member,
        localTrack: null,
        remoteTrack: displayVideoStream,
      });
    }

    if (!videoStream && audioStream) {
      userTiles.push({
        id: "",
        user: member,
        localTrack: null,
        remoteTrack: audioStream,
      });
    }

    if (!videoStream && !audioStream) {
      userTiles.push({
        id: "",
        user: member,
        localTrack: null,
        remoteTrack: null,
      });
    }

    tiles.push(...userTiles);
  }

  const selfTiles: ICallTile[] = [];

  const audioStream = store.call.localStreams.find(
    (stream) => stream.type === CallStreamType.Audio,
  );
  const videoStream = store.call.localStreams.find(
    (stream) => stream.type === CallStreamType.Video,
  );
  const displayVideoStream = store.call.localStreams.find(
    (stream) => stream.type === CallStreamType.DisplayVideo,
  );

  if (videoStream) {
    selfTiles.push({
      id: "",
      user: store.self,
      localTrack: videoStream,
      remoteTrack: null,
    });
  }

  if (displayVideoStream) {
    selfTiles.push({
      id: "",
      user: store.self,
      localTrack: displayVideoStream,
      remoteTrack: null,
    });
  }

  if (!videoStream && audioStream) {
    selfTiles.push({
      id: "",
      user: store.self,
      localTrack: audioStream,
      remoteTrack: null,
    });
  }

  if (!videoStream && !audioStream) {
    selfTiles.push({
      id: "",
      user: store.self,
      localTrack: null,
      remoteTrack: null,
    });
  }

  for (const tile of tiles) {
    tile.id = `${tile.user.id}:${tile.localTrack?.type || tile.remoteTrack?.type || "0"}`;
  }

  tiles.push(...selfTiles);
  tiles.sort((a, b) => (a.user.name > b.user.name ? 1 : -1));

  return tiles;
});

const toggleStream = async (type: CallStreamType) => {
  if (getComputedStream(type).value) {
    await store.callRemoveLocalStream({
      type,
    });
  } else {
    if (type === CallStreamType.DisplayVideo && isDesktop) {
      desktopCaptureModal.value = true;
      return;
    }

    await store.callAddLocalStream({
      type,
    });
  }
};

const updateTileBounds = () => {
  if (!tileContainer.value) {
    return;
  }

  const count = tileContainer.value?.children?.length;

  if (!count) {
    return;
  }

  //no, i can't read this code either. it works though (so don't touch it).
  const gap = 8;
  let opts: number[][] = [];
  for (let i = 0; i < count; i++) {
    opts[i] = [];
    let pos = 0;
    for (let j = 0; j < count; j++) {
      if (pos > i) {
        pos = 0;
      }
      opts[i][pos] = (opts[i][pos] || 0) + 1;
      pos++;
    }
  }
  let bestOpt: number[] | undefined;
  let bestOptAvg = 0;
  let targetRatioWidth = 16;
  let targetRatioHeight = 9;
  for (const opt of opts) {
    let sizes: number[] = [];
    let rowSize = tileContainer.value.offsetHeight / opt.length;
    for (const row of opt) {
      let colSize = tileContainer.value.offsetWidth / row;
      let ratio = colSize / rowSize;
      let usableWidth;
      let usableHeight;
      if (ratio >= targetRatioWidth / targetRatioHeight) {
        usableWidth = (rowSize / targetRatioHeight) * targetRatioWidth;
        usableHeight = rowSize;
      } else {
        usableWidth = colSize;
        usableHeight = (colSize / targetRatioWidth) * targetRatioHeight;
      }
      let usable = usableWidth * usableHeight;
      sizes.push(usable);
    }
    let total = 0;
    for (const size of sizes) {
      total += size;
    }
    let avg = total / sizes.length;
    if (avg > bestOptAvg) {
      bestOpt = opt;
      bestOptAvg = avg;
    }
  }
  if (!bestOpt) {
    return;
  }
  let width = tileContainer.value.offsetWidth - (gap * bestOpt[0] + 1);
  let cellWidth = Math.floor(width / bestOpt[0] - gap / 2);
  let cellHeight = Math.floor((cellWidth / targetRatioWidth) * targetRatioHeight);
  let usedWidth = cellWidth * bestOpt[0] + gap * (bestOpt[0] - 1);
  let usedHeight = cellHeight * bestOpt.length + gap * (bestOpt.length - 1);
  let startX = Math.floor((tileContainer.value.offsetWidth - usedWidth) / 2);
  let startY = Math.floor((tileContainer.value.offsetHeight - usedHeight) / 2);
  if (usedHeight + gap * 2 > tileContainer.value.offsetHeight) {
    let height = tileContainer.value.offsetHeight - (gap * bestOpt.length + 1);
    cellHeight = height / bestOpt.length - gap / 2;
    cellWidth = (cellHeight / targetRatioHeight) * targetRatioWidth;
    cellHeight = Math.floor(cellHeight);
    cellWidth = Math.floor(cellWidth);
    usedWidth = cellWidth * bestOpt[0] + gap * (bestOpt[0] - 1);
    usedHeight = cellHeight * bestOpt.length + gap * (bestOpt.length - 1);
    startX = Math.floor((tileContainer.value.offsetWidth - usedWidth) / 2);
    startY = Math.floor((tileContainer.value.offsetHeight - usedHeight) / 2);
  }
  let pos = 0;
  for (const [_row, cols] of Object.entries(bestOpt)) {
    const row = Number(_row);
    let rowWidth = cols * cellWidth + gap * (cols - 1);
    let rowX = startX + Math.floor((usedWidth - rowWidth) / 2);
    let rowY = startY + row * (cellHeight + gap);
    for (let i = 0; i < cols; i++) {
      const el = tileContainer.value.children[pos] as HTMLDivElement;
      let cellX = rowX + i * (cellWidth + gap);
      el.style.left = `${cellX}px`;
      el.style.top = `${rowY}px`;
      el.style.width = `${cellWidth}px`;
      el.style.height = `${cellHeight}px`;
      pos++;
    }
  }
};

const stop = async () => {
  await store.callReset();
};

const resizeMouseMove = (e: MouseEvent) => {
  const y = Math.min(e.y, innerHeight - 80);
  resizeHeight.value += y - resizeY;
  resizeY = y;
};

const resizeMouseUp = () => {
  removeEventListener("mousemove", resizeMouseMove);
  removeEventListener("mouseup", resizeMouseUp);
};

const resizeMouseDown = (e: MouseEvent) => {
  const y = Math.min(e.y, innerHeight - 80);
  resizeY = y;

  addEventListener("mousemove", resizeMouseMove);
  addEventListener("mouseup", resizeMouseUp);
};

let lastHeight = innerHeight;

const onWindowResize = () => {
  resizeHeight.value *= innerHeight / lastHeight;
  lastHeight = innerHeight;
};

addEventListener("resize", onWindowResize);

onMounted(() => {
  if (!tileContainer.value) {
    return;
  }

  new ResizeObserver(updateTileBounds).observe(tileContainer.value);
  new MutationObserver(updateTileBounds).observe(tileContainer.value, {
    childList: true,
  });

  addEventListener("resize", onWindowResize);
});

onBeforeUnmount(() => {
  removeEventListener("resize", onWindowResize);
});
</script>
