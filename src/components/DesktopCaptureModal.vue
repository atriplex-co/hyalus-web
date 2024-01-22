<template>
  <ModalBase
    title="Share Screen"
    submit-text="Share"
    @submit="submit"
    @close="$emit('close')"
    main-class="max-w-2xl"
  >
    <template #icon>
      <DisplayIcon />
    </template>
    <template #main>
      <div class="w-full h-[30rem] space-y-2 flex flex-col min-h-0">
        <p class="text-sm">Source</p>
        <div
          class="flex-1 h-full w-full rounded-md border border-ctp-base bg-ctp-crust shadow-sm flex flex-col min-h-0"
        >
          <div class="bg-ctp-mantle/50 border-b border-ctp-base flex shadow-sm space-x-2 p-2">
            <p
              class="p-1.5 rounded-md hover:bg-ctp-base cursor-pointer transition"
              :class="{
                'text-ctp-text bg-ctp-base ring-2 ring-ctp-accent/50': sourceType === 'window',
                'text-ctp-overlay2': sourceType !== 'window',
              }"
              @click="sourceType = 'window'"
            >
              Windows
            </p>
            <p
              class="p-1.5 rounded-md hover:bg-ctp-base cursor-pointer transition"
              :class="{
                'text-ctp-text bg-ctp-base ring-2 ring-ctp-accent/50': sourceType === 'screen',
                'text-ctp-overlay2': sourceType !== 'screen',
              }"
              @click="sourceType = 'screen'"
            >
              Screens
            </p>
          </div>
          <div v-if="!sources.length" class="w-full h-full flex items-center justify-center">
            <LoadingIcon class="h-5 w-5" />
          </div>
          <div v-if="sources.length" class="flex-1 overflow-auto">
            <div class="grid grid-cols-3 items-start gap-3 p-3">
              <div
                v-for="source in sources"
                :key="source.id"
                class="flex min-w-0 cursor-pointer flex-col items-center space-y-2 rounded-md p-2 text-ctp-subtext0 hover:bg-ctp-mantle transition"
                :class="{
                  'bg-ctp-mantle ring-2 ring-ctp-accent/50': selectedSourceId === source.id,
                }"
                @click="selectedSourceId = source.id"
              >
                <img
                  class="aspect-video h-[80px] max-w-[200px] rounded-sm object-contain"
                  :src="source.thumbnail"
                />
                <div class="justify-center flex items-center w-full space-x-2">
                  <img v-if="source.appIcon" :src="source.appIcon" class="w-4 h-4" />
                  <p class="truncate text-xs">
                    {{ source.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #submit>
      <div class="space-y-2">
        <div class="flex items-center space-x-3 px-2 text-ctp-subtext0">
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
import { onMounted, onUnmounted, ref, type Ref, watch } from "vue";
import { CallStreamType } from "@/../../hyalus-server/src/types";
import { useStore } from "@/global/store";
import LoadingIcon from "@/icons/LoadingIcon.vue";

interface ISource {
  id: string;
  name: string;
  thumbnail: string;
  appIcon?: string;
}

const store = useStore();
const emit = defineEmits(["close"]);
const sources: Ref<ISource[]> = ref([]);
const selectedSourceId = ref("");
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
const sourceType = ref("window");

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

const ignoredSourceNames = [
  // windows listed here will be ignored:
  "NVIDIA GeForce Overlay",
];

const updateSources = async () => {
  if (!window.HyalusDesktop) {
    return;
  }

  sources.value = (await window.HyalusDesktop.getSources()).filter(
    (source) =>
      !ignoredSourceNames.includes(source.name) && source.id.split(":")[0] === sourceType.value,
  );
  if (
    !selectedSourceId.value ||
    !sources.value.find((source) => source.id === selectedSourceId.value)
  ) {
    selectedSourceId.value = sources.value[0].id;
  }
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

watch(sourceType, () => {
  sources.value = [];
  updateSources();
});
</script>
