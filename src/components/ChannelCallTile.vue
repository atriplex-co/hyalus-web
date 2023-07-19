<template>
  <div
    ref="main"
    class="group absolute flex h-full w-full items-center justify-center overflow-hidden rounded-md transition"
    :class="{
      'cursor-none': !controls,
      'ring-primary-600 ring ring-opacity-75': speaking,
      'bg-black':
        isFullscreen ||
        (stream &&
          [CallStreamType.Video, CallStreamType.DisplayVideo].includes(
            stream?.type,
          )),
      'bg-dark-700 bg-opacity-50':
        !stream ||
        ![CallStreamType.Video, CallStreamType.DisplayVideo].includes(
          stream?.type,
        ),
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
      v-if="
        stream &&
        [CallStreamType.Video, CallStreamType.DisplayVideo].includes(
          stream.type,
        )
      "
      ref="video"
      class="h-full w-full"
      poster="../assets/images/call-video-loading.gif"
      autoplay
      muted
    ></video>
    <UserAvatar
      v-else
      :avatar="tile.user.avatar"
      class="h-24 w-24 rounded-full shadow-lg"
    />
    <div
      v-if="controls"
      class="absolute bottom-0 flex h-8 w-full items-end justify-between"
    >
      <div
        class="m-2 flex h-full items-center space-x-2 overflow-hidden rounded-md bg-black bg-opacity-25 px-2 backdrop-blur"
      >
        <p class="truncate text-sm">{{ tile.user.name }}</p>
        <MicOffIcon v-if="muted" class="h-4 w-4 flex-shrink-0" />
        <DisplayIcon
          v-if="stream?.type === CallStreamType.DisplayVideo"
          class="h-4 w-4 flex-shrink-0 text-gray-300"
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
import DisplayIcon from "../icons/DisplayIcon.vue";
import MicOffIcon from "../icons/MicOffIcon.vue";
import {
  ref,
  PropType,
  Ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { ICallTile } from "../global/types";
import { CallStreamType } from "@/../hyalus-server/src/types";
import ChannelCallTileMenu from "./ChannelCallTileMenu.vue";
import { useStore } from "../global/store";
import JMuxer from "jmuxer";

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
let track: MediaStreamTrack | null = null;
let disableTimeout = 0;

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
  return props.tile.localStream || props.tile.remoteStream;
});

const muted = computed(() => {
  if (!store.call || !stream.value) {
    return true;
  }

  if (stream.value.type === CallStreamType.DisplayVideo) {
    return false;
  }

  if (props.tile.user === store.self) {
    return !store.call.localStreams.find(
      (stream) => stream.type === CallStreamType.Audio,
    );
  } else {
    return !store.call.remoteStreams.find(
      (stream) =>
        stream.userId === props.tile.user.id &&
        stream.type === CallStreamType.Audio,
    );
  }
});

const speaking = computed(() => {
  if (!stream.value || stream.value.type === CallStreamType.DisplayVideo) {
    return false;
  }

  if (props.tile.localStream) {
    return store.call?.localStreams.find((stream2) => stream2.speaking);
  }

  if (props.tile.remoteStream) {
    return store.call?.remoteStreams.find(
      (stream2) => stream2.userId === props.tile.user.id && stream2.speaking,
    );
  }

  return false;
});

const ensureStreamEnabled = async () => {
  if (
    video.value &&
    props.tile.localStream &&
    props.tile.localStream.getTrack
  ) {
    if (!track) {
      track = await props.tile.localStream.getTrack();
    }

    video.value.srcObject = new MediaStream([track]);
  }

  if (
    video.value &&
    props.tile.remoteStream &&
    props.tile.remoteStream.dc &&
    props.tile.remoteStream.dc.readyState === "open"
  ) {
    const remoteStream = props.tile.remoteStream; // lets us modify props without eslint bitching about it.

    if (remoteStream.muxer) {
      remoteStream.muxer.destroy();
      remoteStream.muxer = null;
    }

    if (!remoteStream.muxer) {
      remoteStream.muxer = new JMuxer({
        node: video.value,
        mode: "video",
        fps: 60, // TODO: dynamic FPS metadata.
        flushingTime: 0,
        maxDelay: 100, // unsupported in TS types, but is def a thing.
        debug: false,
        onMissingVideoFrames() {
          if (remoteStream.dc) {
            remoteStream.dc.send("");
          }
        },
        onMissingAudioFrames() {
          if (remoteStream.dc) {
            remoteStream.dc.send("");
          }
        },
        async onReady() {
          for (;;) {
            if (!video.value || video.value.readyState === 4) {
              break;
            }

            if (remoteStream.dc) {
              remoteStream.dc.send("enable");
            }

            await new Promise((resolve) => {
              setTimeout(resolve, 100);
            });
          }
        },
      } as unknown as JMuxer.Options);
    }
  }
};

const ensureStreamDisabled = async () => {
  if (video.value && track) {
    track.stop();
    track = null;
  }

  if (video.value && props.tile.remoteStream) {
    const remoteStream = props.tile.remoteStream; // lets us modify props without eslint bitching about it.

    if (remoteStream.dc && remoteStream.dc.readyState === "open") {
      remoteStream.dc.send("disable");
    }

    if (remoteStream.muxer) {
      remoteStream.muxer.destroy();
      remoteStream.muxer = null;
    }
  }
};

const onVisibilityChange = async () => {
  clearTimeout(disableTimeout);

  if (document.visibilityState === "visible") {
    await ensureStreamEnabled();
  }

  if (document.visibilityState === "hidden") {
    disableTimeout = +setTimeout(ensureStreamDisabled, 2000);
  }
};

onMounted(async () => {
  if (video.value && props.tile.localStream && props.tile.localStream.track) {
    video.value.srcObject = new MediaStream([props.tile.localStream.track]);
  }

  addEventListener("visibilitychange", onVisibilityChange);

  if (document.visibilityState === "visible") {
    await ensureStreamEnabled();
  }
});

onBeforeUnmount(async () => {
  removeEventListener("visibilitychange", onVisibilityChange);
  await ensureStreamDisabled();
});

watch(
  () => props.tile.remoteStream?.dc?.readyState,
  () => {
    onVisibilityChange(); // this is a bit weird but it works great.
  },
);
</script>
