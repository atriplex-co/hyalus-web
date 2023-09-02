<template>
  <ModalBase title="Share Screen" submit-text="Share" @submit="submit" @close="$emit('close')">
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
            class="flex min-w-0 cursor-pointer flex-col items-center space-y-3 rounded-md px-3 py-2 text-ctp-subtext0 hover:bg-ctp-mantle/50"
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
      </div>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
/* eslint-disable no-undef */

import ModalBase from "./ModalBase.vue";
import DisplayIcon from "@/icons/DisplayIcon.vue";
import InputBoolean from "./InputBoolean.vue";
import { onMounted, onUnmounted, ref, type Ref } from "vue";
import { CallStreamType } from "@/../../hyalus-server/src/types";
import { useStore } from "@/global/store";
import LoadingIcon from "@/icons/LoadingIcon.vue";

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
    540: 960,
    720: 1280,
    900: 1600,
    1080: 1920,
  }[videoHeight] || 720;
const videoFps = +store.config.videoMode.split("p")[1] || 60;
const debugEnabled = ref(false);

const getNormalStream = async (sourceId: string, audio: boolean): Promise<MediaStream> => {
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
      type: track.kind === "video" ? CallStreamType.DisplayVideo : CallStreamType.DisplayAudio,
      track,
      silent: track.kind !== "video",
    });
  }
};

const startWin32AudioCapture = async () => {
  if (!window.HyalusDesktop?.win32) {
    return;
  }

  const generator = new MediaStreamTrackGenerator({
    kind: "audio",
  });
  const writer = generator.writable.getWriter();

  await store.callAddLocalStream({
    type: CallStreamType.DisplayAudio,
    track: generator,
    silent: true,
  });

  window.HyalusDesktop.win32.startCapture(
    {
      id: selectedSourceId.value,
      video: false, // TODO: completely remove old HME encoder.
      videoWidth: 0,
      videoHeight: 0,
      videoFps: 0,
      videoBitrate: 0,
      audio: true,
    },
    async (data) => {
      if (!data) {
        await store.callRemoveLocalStream({
          type: CallStreamType.DisplayAudio,
          silent: true,
        });
        return;
      }

      if (data.t === "audio") {
        await writer.write(
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

  if (window.HyalusDesktop!.win32) {
    await startNormalCapture(false);
    if (selectedAudio.value) {
      await startWin32AudioCapture();
    }

    emit("close");
    return;
  }

  try {
    await startNormalCapture(selectedAudio.value);
  } catch {
    await startNormalCapture(false);
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
