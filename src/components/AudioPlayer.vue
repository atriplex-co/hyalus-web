<template>
  <div>
    <audio
      ref="audio"
      :src="src"
      @error="$emit('error')"
      @play="playing = true"
      @pause="playing = false"
      @ended="playing = false"
      @click="togglePlay"
      @timeupdate="onTimeUpdate"
    />
    <div class="w-96 space-y-2 rounded-md bg-[#1e1e1e] p-2">
      <div class="flex items-center space-x-2">
        <MusicalNoteIcon class="h-8 w-8 rounded-full bg-ctp-surface0 p-2 text-ctp-text" />
        <div class="flex flex-1 items-center justify-between space-x-2">
          <div class="min-w-0 flex-1">
            <p class="truncate">{{ name }}</p>
            <p class="text-xs text-ctp-subtext0">{{ size }}</p>
          </div>
          <ArrowDownTrayIcon
            class="h-5 w-5 cursor-pointer text-ctp-subtext0 hover:text-white"
            @click="$emit('download')"
          />
        </div>
      </div>
      <div
        class="flex w-full transform items-center space-x-2 rounded-md bg-ctp-crust px-2 py-1 transition duration-100"
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MusicalNoteIcon,
  ArrowDownTrayIcon,
} from "@heroicons/vue/20/solid";
import { ref } from "vue";

defineEmits(["error", "download"]);
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
const audio = ref<HTMLAudioElement | null>(null);
const showVolume = ref(false);
const playing = ref(false);
const muted = ref(false);
const time = ref("0");
const volume = ref("50");

const togglePlay = () => {
  if (!playing.value) {
    audio.value!.volume = +volume.value / 100;
    audio.value!.play();
  } else {
    audio.value!.pause();
  }
};

const toggleMute = () => {
  if (!muted.value) {
    audio.value!.muted = true;
    muted.value = true;
  } else {
    audio.value!.muted = false;
    muted.value = false;
  }
};

const onTimeUpdate = () => {
  time.value = (audio.value!.currentTime / audio.value!.duration) * 100 + "";
};

const updateTime = (e: Event) => {
  time.value = (e.target! as HTMLInputElement).value!;
  audio.value!.currentTime = (+time.value / 100) * audio.value!.duration;
};

const updateVolume = (e: Event) => {
  volume.value = (e.target! as HTMLInputElement).value!;
  audio.value!.volume = +volume.value / 100;
};
</script>
