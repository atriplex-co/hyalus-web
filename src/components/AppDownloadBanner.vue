<template>
  <div v-if="!hide" class="w-full">
    <div
      class="bg-ctp-accent text-ctp-base flex h-9 items-center justify-between rounded-sm px-2 text-sm shadow-md"
    >
      <div class="flex items-center space-x-2 px-1">
        <DesktopIcon class="h-5 w-5" />
        <p>Get the desktop app for Windows/macOS/Linux.</p>
        <button
          class="rounded-md border border-ctp-base px-2 py-0.5 font-bold transition hover:bg-ctp-base hover:text-ctp-accent"
          @click="appDownloadModal = true"
        >
          Download
        </button>
      </div>
      <div
        class="h-6 w-6 cursor-pointer rounded-full bg-ctp-base/10 p-1 transition hover:bg-opacity-25"
        @click="hide = true"
      >
        <CloseIcon />
      </div>
    </div>
    <AppDownloadModal
      v-if="appDownloadModal"
      @close="appDownloadModal = false"
    />
  </div>
</template>

<script lang="ts" setup>
import CloseIcon from "../icons/CloseIcon.vue";
import DesktopIcon from "../icons/DesktopIcon.vue";
import { ref } from "vue";
import AppDownloadModal from "./AppDownloadModal.vue";

const appDownloadModal = ref(false);
const hide = ref(false);
</script>
