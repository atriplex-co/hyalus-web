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
    <div class="rounded-md bg-[#1e1e1e] w-96 p-1">
      <div class="p-2 flex items-center space-x-2">
        <MusicalNoteIcon class="w-8 h-8 p-2 rounded-full bg-ctp-surface0 text-ctp-text" />
        <div class="flex justify-between items-center space-x-2 flex-1">
          <div class="min-w-0 flex-1">
            <p class="truncate">{{ name }}</p>
            <p class="text-xs text-ctp-subtext0">{{ size }}</p>
          </div>
          <ArrowDownTrayIcon
            class="w-5 h-5 hover:text-white text-ctp-subtext0 cursor-pointer"
            @click="$emit('download')"
          />
        </div>
      </div>
      <div class="h-8 w-full flex items-center px-2 space-x-2 transform transition duration-100">
        <div
          class="text-[#ccc] hover:text-white w-5 h-5 cursor-pointer transition"
          @click="togglePlay"
        >
          <PlayIcon v-if="!playing" />
          <PauseIcon v-if="playing" />
        </div>
        <div class="flex-1">
          <input
            type="range"
            :value="time"
            class="w-full h-1 mb-3 bg-ctp-overlay0 bg-opacity-75 rounded-lg cursor-pointer accent-ctp-accent appearance-none"
            @input="updateTime"
          />
        </div>
        <div
          class="text-[#ccc] hover:text-white w-5 h-5 cursor-pointer transition relative"
          @click="toggleMute"
          @mouseenter="showVolume = true"
        >
          <SpeakerWaveIcon v-if="!muted" />
          <SpeakerXMarkIcon v-if="muted" />
          <div
            v-if="showVolume"
            class="absolute bottom-3 w-full transform scale-75 pt-1.5 rounded-lg bg-[#1e1e1e] bg-opacity-75 backdrop-blur"
            @mouseleave="showVolume = false"
            @click.stop
          >
            <input
              type="range"
              :value="volume"
              class="h-24 w-4 rounded-lg appearance-none cursor-pointer accent-ctp-accent range-vertical"
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
