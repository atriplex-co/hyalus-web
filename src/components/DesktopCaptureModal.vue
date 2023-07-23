<template>
  <ModalBase
    title="Share Screen"
    submit-text="Share"
    @submit="submit"
    @close="$emit('close')"
  >
    <template #icon>
      <DisplayIcon />
    </template>
    <template #main>
      <div class="w-full space-y-2">
        <p class="text-sm">Source</p>
        <div
          v-if="!sources.length"
          class="flex h-96 w-full items-center justify-center rounded-md border border-ctp-base bg-ctp-crust p-2 shadow-sm"
        >
          <LoadingIcon class="h-5 w-5" />
        </div>
        <div
          v-if="sources.length"
          class="grid h-96 w-full grid-cols-2 items-start gap-2 overflow-auto rounded-md border border-ctp-base bg-ctp-crust p-2 shadow-sm"
        >
          <div
            v-for="source in sources"
            :key="source.id"
            class="flex min-w-0 cursor-pointer flex-col items-center space-y-3 rounded-md px-3 py-2 hover:bg-ctp-mantle/50 text-ctp-subtext0"
            :class="{
              'bg-ctp-mantle': selectedSourceId === source.id,
            }"
            @click="selectedSourceId = source.id"
          >
            <img
              class="aspect-video h-[72px] w-[128px] rounded-sm object-contain shadow-sm"
              :src="source.thumbnail"
            />
            <p class="w-full flex-1 truncate text-center text-xs font-bold">
              {{ source.name }}
            </p>
          </div>
        </div>
      </div>
    </template>
    <template #submit>
      <div class="space-y-2">
        <div class="flex items-center space-x-3 px-2">
          <InputBoolean v-model="selectedAudio" />
          <p>Share audio</p>
        </div>
        <div v-if="debugEnabled" class="flex items-center space-x-3 px-2">
          <InputBoolean v-model="debugForceLegacy" />
          <p>Use legacy HME</p>
        </div>
      </div>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
/* eslint-disable no-undef */

import ModalBase from "./ModalBase.vue";
import DisplayIcon from "../icons/DisplayIcon.vue";
import InputBoolean from "./InputBoolean.vue";
import { onMounted, onUnmounted, ref, Ref } from "vue";
import { CallStreamType } from "@/../hyalus-server/src/types";
import { ICallLocalStream } from "../global/types";
import { useStore } from "../global/store";
import LoadingIcon from "../icons/LoadingIcon.vue";

interface ISource {
  id: string;
  name: string;
  thumbnail: string;
}

const store = useStore();
const emit = defineEmits(["close"]);
const sources: Ref<ISource[]> = ref([]);
const selectedSourceId = ref("screen:0:0");
const selectedAudio = ref(true);
let updateSourcesInterval = 0;
const videoHeight = +store.config.videoMode.split("p")[0] || 1280;
const videoWidth =
  {
    360: 640,
    480: 854,
    720: 1280,
    1080: 1920,
  }[videoHeight] || 720;
const videoFps = +store.config.videoMode.split("p")[1] || 60;
const videoBitrate =
  {
    ["480p30"]: 3000000,
    ["480p60"]: 3000000,
    ["720p30"]: 3000000,
    ["720p60"]: 4500000,
    ["1080p30"]: 4500000,
    ["1080p60"]: 6000000,
  }[store.config.videoMode] || 4500000;
const debugEnabled = ref(false);
const debugForceLegacy = ref(false);

// const getRenderer = (): string => {
//   const canvas = document.createElement("canvas");
//   const gl = canvas.getContext("webgl");
//   if (!gl) {
//     return "";
//   }
//   const ext = gl.getExtension("WEBGL_debug_renderer_info");
//   if (!ext) {
//     return "";
//   }
//   return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
// };

const getNormalStream = async (
  sourceId: string,
  audio: boolean,
): Promise<MediaStream> => {
  return await navigator.mediaDevices.getUserMedia({
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: sourceId,
        maxWidth: videoWidth,
        maxHeight: videoHeight,
        maxFrameRate: videoFps,
      },
    },
    audio: audio && {
      mandatory: {
        chromeMediaSource: "desktop",
      },
    },
  } as unknown as MediaStreamConstraints);
};

const startNormalCapture = async (audio: boolean) => {
  const stream = await getNormalStream(selectedSourceId.value, audio);

  for (const track of stream.getTracks()) {
    await store.callAddLocalStream({
      type:
        track.kind === "video"
          ? CallStreamType.DisplayVideo
          : CallStreamType.DisplayAudio,
      track,
      silent: track.kind !== "video",
    });
  }
};

const startWin32Capture = async (audio: boolean, video: boolean) => {
  if (!window.HyalusDesktop?.win32) {
    return;
  }

  const sourceId = selectedSourceId.value; // prevent desync when the modal closes.
  let videoStream: ICallLocalStream | undefined;
  let audioStream: ICallLocalStream | undefined;

  if (video) {
    videoStream = await store.callAddLocalStream({
      type: CallStreamType.DisplayVideo,
      async getTrack() {
        return (await getNormalStream(sourceId, false)).getTracks()[0];
      },
      submitOverride: true,
    });
  }

  if (audio) {
    audioStream = await store.callAddLocalStream({
      type: CallStreamType.DisplayAudio,
      procOverride: true,
      silent: true,
    });
  }

  window.HyalusDesktop.win32.startCapture(
    {
      id: selectedSourceId.value,
      video: !!videoStream,
      videoWidth,
      videoHeight,
      videoFps,
      videoBitrate,
      audio: !!audioStream,
    },
    async (data) => {
      if (!window.HyalusDesktop?.win32) {
        return;
      }

      if (!data) {
        if (
          video &&
          store.call?.localStreams.find(
            (stream) => stream.type === CallStreamType.DisplayVideo,
          )
        ) {
          await store.callRemoveLocalStream({
            type: CallStreamType.DisplayVideo,
          });
        }

        if (
          audio &&
          store.call?.localStreams.find(
            (stream) => stream.type === CallStreamType.DisplayAudio,
          )
        ) {
          await store.callRemoveLocalStream({
            type: CallStreamType.DisplayAudio,
            silent: true,
          });
        }

        return;
      }

      if (videoStream && data.t === "video") {
        videoStream.submit(new Uint8Array(data.d.data));

        if (videoStream.requestKeyFrame) {
          videoStream.requestKeyFrame = false;
          window.HyalusDesktop.win32.msgCapture("video_request_key_frame");
        }

        if (videoStream.requestInit) {
          videoStream.requestInit = false;
          const height = +store.config.videoMode.split("p")[0];
          const fps = +store.config.videoMode.split("p")[1];
          const width = {
            360: 640,
            480: 854,
            720: 1280,
            900: 1600,
            1080: 1920,
          }[height];
          const maxBitrate =
            {
              ["480p30"]: 3000000,
              ["480p60"]: 3000000,
              ["720p30"]: 3000000,
              ["720p60"]: 4500000,
              ["1080p30"]: 4500000,
              ["1080p60"]: 6000000,
            }[store.config.videoMode] || 4500000;

          let bitrate = store.config.videoQuality;
          if (
            bitrate &&
            videoStream.peers.filter((peer) => peer.enabled).length &&
            store.call
          ) {
            bitrate /= videoStream.peers.filter((peer) => peer.enabled).length;
            bitrate /= store.call.localStreams.filter((stream) =>
              [CallStreamType.Video, CallStreamType.DisplayVideo].includes(
                stream.type,
              ),
            ).length;
            bitrate = Math.floor(bitrate);
            bitrate = Math.min(bitrate, maxBitrate);
          } else {
            bitrate = maxBitrate;
          }

          window.HyalusDesktop.win32.msgCapture(`video_set_width:${width}`);
          window.HyalusDesktop.win32.msgCapture(`video_set_height:${height}`);
          window.HyalusDesktop.win32.msgCapture(`video_set_fps:${fps}`);
          window.HyalusDesktop.win32.msgCapture(`video_set_bitrate:${bitrate}`);
          window.HyalusDesktop.win32.msgCapture(`video_request_init`);
          window.HyalusDesktop.win32.msgCapture("video_request_key_frame");
        }
      }

      if (audioStream && data.t === "audio") {
        await audioStream.proc(
          new AudioData({
            format: "f32",
            sampleRate: data.d.sampleRate,
            numberOfFrames: data.d.frames,
            numberOfChannels: data.d.channels,
            timestamp: data.d.timestamp,
            data: new Uint8Array(data.d.data),
          }),
        );
      }
    },
  );
};

const submit = async () => {
  if (!selectedSourceId.value) {
    return;
  }

  // const renderer = getRenderer();
  // const win32CaptureSupported =
  //   window.HyalusDesktop &&
  //   window.HyalusDesktop.win32 &&
  //   window.HyalusDesktop.osPlatform === "win32" &&
  //   +window.HyalusDesktop.osRelease.split(".")[0] >= 10 &&
  //   +window.HyalusDesktop.osRelease.split(".")[2] >= 19043 &&
  //   renderer &&
  //   !renderer.includes("SwiftShader") && // prevent users w/ no GPU/drivers from using HME.
  //   import.meta.env.VITE_GIT_BRANCH === "dev"; // TODO: roll out HME to main channel.
  const win32CaptureSupported = false; // TODO: figure out what to do with HMEv3

  if (win32CaptureSupported) {
    if (!debugForceLegacy.value) {
      await startWin32Capture(selectedAudio.value, true);
    } else {
      await startNormalCapture(false);

      if (selectedAudio.value) {
        await startWin32Capture(selectedAudio.value, false);
      }
    }
  } else {
    try {
      await startNormalCapture(selectedAudio.value);
    } catch {
      await startNormalCapture(false);
    }
  }

  emit("close");
};

const updateSources = async () => {
  if (!window.HyalusDesktop) {
    return;
  }

  sources.value = await window.HyalusDesktop.getSources();
};

const keyDownHandler = (e: KeyboardEvent) => {
  if (e.key === "F3") {
    e.preventDefault();
    debugEnabled.value = !debugEnabled.value;
  }
};

onMounted(async () => {
  updateSources();
  updateSourcesInterval = +setInterval(updateSources, 1000);
  addEventListener("keydown", keyDownHandler);
});

onUnmounted(() => {
  clearInterval(updateSourcesInterval);
  removeEventListener("keydown", keyDownHandler);
});
</script>
