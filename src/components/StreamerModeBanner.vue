<template>
  <div v-if="show" class="w-full">
    <div
      class="flex h-9 items-center justify-between rounded-sm bg-ctp-accent px-2 text-sm text-ctp-base shadow-md"
    >
      <div class="flex items-center space-x-2 px-1">
        <TvIcon class="h-5 w-5" />
        <p>Streamer Mode Enabled</p>
        <p v-if="store.config.streamerModeHideWindow">- "Prevent Screen Capture" is On</p>
        <button
          @click="settingsModal = true"
          class="rounded-md border border-ctp-base px-2 py-0.5 font-bold transition hover:bg-ctp-base hover:text-ctp-accent"
        >
          Settings
        </button>
      </div>
      <div
        class="h-6 w-6 cursor-pointer rounded-full bg-ctp-base/10 p-1 transition hover:bg-opacity-25"
        @click="show = false"
      >
        <CloseIcon />
      </div>
    </div>
  </div>
  <SettingsModal
    v-if="settingsModal"
    :openTo="SettingsPage.StreamerMode"
    @close="settingsModal = false"
  />
</template>

<script lang="ts" setup>
import CloseIcon from "../icons/CloseIcon.vue";
import { ref } from "vue";
import { TvIcon } from "@heroicons/vue/20/solid";
import { useStore } from "@/global/store";
import { SettingsPage } from "@/global/types";
import SettingsModal from "./SettingsModal.vue";

const show = ref(true);
const store = useStore();
const settingsModal = ref(false);
</script>
