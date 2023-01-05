<template>
  <div class="w-full">
    <div
      class="dark:bg-primary-600 bg-primary-500 flex h-9 items-center justify-between rounded-sm px-2 text-sm text-white shadow-md"
    >
      <div class="flex items-center space-x-2 px-1">
        <DesktopIcon class="h-5 w-5" />
        <p>Get the desktop app for Windows/macOS/Linux.</p>
        <button
          class="hover:text-primary-500 rounded-md border border-white px-2 py-0.5 font-bold transition hover:bg-white"
          @click="appDownloadModal = true"
        >
          Download
        </button>
      </div>
      <div
        class="h-6 w-6 cursor-pointer rounded-full bg-black bg-opacity-10 p-1 text-white transition hover:bg-opacity-25 hover:text-white"
        @click="hide"
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
import { useStore } from "../global/store";
import DesktopIcon from "../icons/DesktopIcon.vue";
import { ref } from "vue";
import AppDownloadModal from "./AppDownloadModal.vue";

const store = useStore();
const appDownloadModal = ref(false);

const hide = async () => {
  await store.writeConfig("appDownloadBanner", false);
};
</script>
