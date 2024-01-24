<template>
  <div
    class="relative overflow-hidden rounded-md"
    ref="root"
    @mouseenter="controls = true"
    @mouseleave="
      controls = false;
      showVolume = false;
    "
    @mousemove="controls = true"
  >
    <video
      ref="video"
      :class="{
        'max-h-80 max-w-md': !isFullscreen,
        'h-full w-full': isFullscreen,
      }"
      :src="src"
      @error="$emit('error')"
      @play="playing = true"
      @pause="playing = false"
      @ended="playing = false"
      @click="togglePlay"
      @timeupdate="onTimeUpdate"
      @dblclick="toggleFullscreen"
    />
    <div
      v-if="!init"
      class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-md"
      @click="togglePlay"
    >
      <PlayIcon class="h-12 w-12 rounded-full bg-ctp-base p-3 opacity-75" />
    </div>
    <div
      v-if="init"
      class="absolute bottom-0 flex h-8 w-full transform items-center space-x-2 bg-[#1e1e1e] bg-opacity-75 px-2 backdrop-blur transition duration-100"
      :class="{
        'opacity-100': controls || !playing,
        'opacity-0': !(controls || !playing),
      }"
    >
      <div
        class="h-5 w-5 cursor-pointer text-[#ccc] transition hover:text-white"
        @click="togglePlay"
      >
        <PlayIcon v-if="!playing" />
        <PauseIcon v-if="playing" />
      </div>
      <div class="flex-1">
        <input
          type="range"
          :value="time"
          class="mb-3 h-1 w-full cursor-pointer appearance-none rounded-lg bg-ctp-overlay0 bg-opacity-75 accent-ctp-accent"
          @input="updateTime"
        />
      </div>
      <div
        class="relative h-5 w-5 cursor-pointer text-[#ccc] transition hover:text-white"
        @click="toggleMute"
        @mouseenter="showVolume = true"
      >
        <SpeakerWaveIcon v-if="!muted" />
        <SpeakerXMarkIcon v-if="muted" />
        <div
          v-if="showVolume"
          class="absolute bottom-3 w-full scale-75 transform rounded-lg bg-[#1e1e1e] bg-opacity-75 pt-1.5 backdrop-blur"
          @mouseleave="showVolume = false"
          @click.stop
        >
          <input
            type="range"
            :value="volume"
            class="range-vertical h-24 w-4 cursor-pointer appearance-none rounded-lg accent-ctp-accent"
            @input="updateVolume"
          />
        </div>
      </div>
      <ArrowsPointingOutIcon
        class="h-4 w-4 cursor-pointer text-[#ccc] transition hover:text-white"
        @click="toggleFullscreen"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PlayIcon,
  PauseIcon,
  ArrowsPointingOutIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/vue/20/solid";
import { ref, watch, onBeforeUnmount } from "vue";

defineProps({
  src: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
});
defineEmits(["error"]);
const init = ref(false);
const playing = ref(false);
const muted = ref(false);
const controls = ref(false);
const showVolume = ref(false);
const volume = ref("50");
const time = ref("0");
const video = ref<HTMLVideoElement | null>(null);
const root = ref<HTMLDivElement | null>(null);
const isFullscreen = ref(false);

const togglePlay = () => {
  if (!init.value) {
    init.value = true;
  }

  if (!playing.value) {
    video.value!.volume = +volume.value / 100;
    video.value!.play();
  } else {
    video.value!.pause();
  }
};

const toggleFullscreen = () => {
  if (!isFullscreen.value) {
    root.value!.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const toggleMute = () => {
  if (!muted.value) {
    video.value!.muted = true;
    muted.value = true;
  } else {
    video.value!.muted = false;
    muted.value = false;
  }
};

const onTimeUpdate = () => {
  time.value = (video.value!.currentTime / video.value!.duration) * 100 + "";
};

const updateTime = (e: Event) => {
  time.value = (e.target! as HTMLInputElement).value!;
  video.value!.currentTime = (+time.value / 100) * video.value!.duration;
};

const updateVolume = (e: Event) => {
  volume.value = (e.target! as HTMLInputElement).value!;
  video.value!.volume = +volume.value / 100;
};

let controlsTimeout = 0;
watch(controls, () => {
  clearTimeout(controlsTimeout);
  if (controls.value) {
    controlsTimeout = +setTimeout(() => {
      controls.value = false;
    }, 1000);
  }
});

const onFullscreenChange = () => {
  isFullscreen.value = document.fullscreenElement === root.value;
};

addEventListener("fullscreenchange", onFullscreenChange);
onBeforeUnmount(() => {
  removeEventListener("fullscreenchange", onFullscreenChange);
});
</script>

<style>
.range-vertical {
  appearance: slider-vertical;
}
</style>
