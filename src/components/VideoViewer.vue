<template>
  <div
    class="rounded-md relative overflow-hidden"
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
      class="max-w-md max-h-80"
      :src="src"
      @error="$emit('error')"
      @play="playing = true"
      @pause="playing = false"
      @ended="playing = false"
      @click="play"
      @timeupdate="onTimeUpdate"
    />
    <div
      v-if="!init"
      class="absolute inset-0 flex items-center justify-center cursor-pointer rounded-md"
      @click="play"
    >
      <PlayIcon class="w-12 h-12 p-3 rounded-full bg-ctp-base opacity-75" />
    </div>
    <div
      v-if="init"
      class="absolute bottom-0 h-8 bg-[#1e1e1e] bg-opacity-75 backdrop-blur w-full flex items-center px-2 space-x-2 transform transition duration-100"
      :class="{
        'opacity-100': controls || !playing,
        'opacity-0': !(controls || !playing),
      }"
    >
      <div class="text-[#ccc] hover:text-white w-4 h-4 cursor-pointer transition" @click="play">
        <PlayIcon v-if="!playing" />
        <PauseIcon v-if="playing" />
      </div>
      <div class="flex-1">
        <input
          type="range"
          :value="time"
          class="w-full h-1 mb-3 bg-ctp-surface2 bg-opacity-75 rounded-lg appearance-none cursor-pointer accent-ctp-accent"
          @input="updateTime"
        />
      </div>
      <div
        class="text-[#ccc] hover:text-white w-4 h-4 cursor-pointer transition relative"
        @click="mute"
        @mouseenter="showVolume = true"
      >
        <SpeakerWaveIcon v-if="!muted" />
        <SpeakerXMarkIcon v-if="muted" />
        <div
          v-if="showVolume"
          class="absolute bottom-3 w-full transform scale-75 pt-1.5 rounded-md bg-[#1e1e1e] bg-opacity-75 backdrop-blur"
          @mouseleave="showVolume = false"
          @click.stop
        >
          <input
            type="range"
            :value="volume"
            class="h-24 w-4 rounded-lg appearance-none cursor-pointer accent-ctp-accent range-vertical"
            orient="vertical"
            @input="updateVolume"
          />
        </div>
      </div>
      <ArrowsPointingOutIcon
        class="text-[#ccc] hover:text-white w-4 h-4 cursor-pointer transition"
        @click="expand"
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
import { ref, watch } from "vue";

const props = defineProps({
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
const emit = defineEmits(["error"]);
const init = ref(false);
const playing = ref(false);
const muted = ref(false);
const controls = ref(false);
const showVolume = ref(false);
const volume = ref("50");
const time = ref("0");
const video = ref<HTMLVideoElement | null>(null);
const root = ref<HTMLDivElement | null>(null);

const play = () => {
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

const expand = () => {
  if (!document.fullscreenElement) {
    root.value!.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const onTimeUpdate = (e: Event) => {
  time.value = (video.value!.currentTime / video.value!.duration) * 100 + "";
};

const mute = () => {
  if (!muted.value) {
    video.value!.muted = true;
    muted.value = true;
  } else {
    video.value!.muted = false;
    muted.value = false;
  }
};

const updateTime = (e: Event) => {
  time.value = (e.target! as HTMLInputElement).value!;
  video.value!.currentTime = (+time.value / 100) * video.value!.duration;
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

const updateVolume = (e: Event) => {
  volume.value = (e.target! as HTMLInputElement).value!;
  video.value!.volume = +volume.value / 100;
};
</script>

<style>
.range-vertical {
  appearance: slider-vertical;
}
</style>
