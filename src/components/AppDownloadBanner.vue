<template>
  <div v-if="show" class="w-full">
    <div
      class="bg-ctp-accent text-ctp-base flex h-9 items-center justify-between rounded-sm px-2 text-sm shadow-md"
    >
      <div class="flex items-center space-x-2 px-1">
        <ComputerDesktopIcon class="h-5 w-5" />
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
        @click="hide"
      >
        <XMarkIcon />
      </div>
    </div>
    <AppDownloadModal v-if="appDownloadModal" @close="appDownloadModal = false" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import AppDownloadModal from "./AppDownloadModal.vue";
import { useStore } from "@/global/store";
import { ComputerDesktopIcon, XMarkIcon } from "@heroicons/vue/20/solid";

const store = useStore();
const appDownloadModal = ref(false);
const show = ref(true);

const hide = (e: MouseEvent) => {
  if (e.shiftKey) {
    store.writeConfig("appDownloadBanner", false);
  }

  show.value = false;
};
</script>
