<template>
  <div
    ref="main"
    class="group absolute flex h-full w-full items-center justify-center overflow-hidden rounded-md transition"
    :class="{
      'cursor-none': !controls,
      'ring ring-ctp-accent ring-opacity-75': speaking,
      'bg-black':
        isFullscreen ||
        (stream && [CallStreamType.Video, CallStreamType.DisplayVideo].includes(stream?.type)),
      'bg-ctp-mantle':
        !stream || ![CallStreamType.Video, CallStreamType.DisplayVideo].includes(stream?.type),
    }"
    @mousemove="resetControlsTimeout"
    @fullscreenchange="updateIsFullscreen"
    @contextmenu.prevent="
      menuX = $event.x;
      menuY = $event.y;
      menuShow = true;
    "
    @dblclick="expand"
  >
    <video
      v-if="stream && [CallStreamType.Video, CallStreamType.DisplayVideo].includes(stream.type)"
      ref="video"
      class="h-full w-full"
      autoplay
      muted
    ></video>
    <UserAvatar v-else :avatar="tile.user.avatar" class="h-24 w-24 rounded-full shadow-lg" />
    <div v-if="controls" class="absolute bottom-0 flex h-8 w-full items-end justify-between">
      <div
        class="m-2 flex h-full items-center space-x-2 overflow-hidden rounded-md bg-black bg-opacity-25 px-2 backdrop-blur"
      >
        <p class="truncate text-sm">{{ tile.user.name }}</p>
        <MicOffIcon
          v-if="
            (flags & VoiceStateFlags.Muted) === VoiceStateFlags.Muted &&
            !((flags & VoiceStateFlags.Deaf) === VoiceStateFlags.Deaf)
          "
          class="h-4 w-4 flex-shrink-0"
        />
        <SpeakerXMarkIcon
          v-if="(flags & VoiceStateFlags.Deaf) === VoiceStateFlags.Deaf"
          class="h-4 w-4 flex-shrink-0"
        />
        <ComputerDesktopIcon
          v-if="stream?.type === CallStreamType.DisplayVideo"
          class="h-4 w-4 flex-shrink-0 text-ctp-subtext0"
        />
      </div>
    </div>
    <ChannelCallTileMenu
      :show="menuShow"
      :x="menuX"
      :y="menuY"
      :tile="tile"
      @close="menuShow = false"
    />
  </div>
</template>

<script lang="ts" setup>
import UserAvatar from "./UserAvatar.vue";
import MicOffIcon from "../icons/MicOffIcon.vue";
import { ref, type PropType, type Ref, computed, watch } from "vue";
import type { ICallTile } from "../global/types";
import { CallStreamType, VoiceStateFlags } from "@/../../hyalus-server/src/types";
import ChannelCallTileMenu from "./ChannelCallTileMenu.vue";
import { useStore } from "../global/store";
import { ComputerDesktopIcon, SpeakerXMarkIcon } from "@heroicons/vue/20/solid";

const store = useStore();

const props = defineProps({
  tile: {
    type: Object as PropType<ICallTile>,
    default() {
      //
    },
  },
});

const controls = ref(true);
const isFullscreen = ref(false);
const menuShow = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const main: Ref<HTMLDivElement | null> = ref(null);
const video: Ref<HTMLVideoElement | null> = ref(null);
let controlsTimeout: number | null = null;

const expand = async () => {
  if (!main.value) {
    return;
  }

  try {
    await document.exitFullscreen();
  } catch {
    main.value.requestFullscreen();
  }
};

const resetControlsTimeout = () => {
  controls.value = true;

  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }

  if (isFullscreen.value) {
    controlsTimeout = +setTimeout(() => {
      controls.value = false;
    }, 500);
  }
};

const updateIsFullscreen = () => {
  isFullscreen.value = !!document.fullscreenElement;
  resetControlsTimeout();
};

const stream = computed(() => {
  return props.tile.localTrack || props.tile.remoteTrack;
});

const flags = computed(() => {
  if (props.tile.user.id === store.self!.id) {
    return store.call!.flags;
  }

  const state = store.voiceStates.find((state) => state.id === props.tile.user.id);
  if (state) {
    return state.flags;
  } else {
    return 0;
  }
});

const speaking = computed(() => {
  if (!stream.value || stream.value.type === CallStreamType.DisplayVideo) {
    return false;
  }

  if (props.tile.localTrack) {
    return store.call!.localStreams.find((track2) => track2.speaking);
  }

  if (props.tile.remoteTrack) {
    return store.call!.remoteStreams.find(
      (stream2) => stream2.userId === props.tile.user.id && stream2.speaking,
    );
  }

  return false;
});

watch(
  () => video.value,
  () => {
    if (video.value && !video.value.srcObject && props.tile.localTrack) {
      video.value.srcObject = new MediaStream([props.tile.localTrack.track]);
    }

    if (video.value && !video.value.srcObject && props.tile.remoteTrack) {
      video.value.srcObject = new MediaStream([props.tile.remoteTrack.track]);
    }
  },
);
</script>
