<template>
  <div>
    <p class="text-2xl">Keybinds</p>
    <div class="divide-y divide-ctp-surface0/50 border-t border-b border-ctp-surface0/50 mt-8">
      <div
        v-if="!isDesktop"
        class="dark:bg-dark-800 my-2 flex h-12 items-center justify-between rounded-md bg-ctp-base px-3"
      >
        <div class="flex items-center space-x-3">
          <WarningIcon class="h-6 w-6" />
          <p>Keyboard shortcuts require the desktop app.</p>
        </div>
        <div
          class="dark:bg-dark-500 h-8 w-8 cursor-pointer rounded-full p-1.5 transition bg-ctp-surface0 hover:bg-ctp-surface0/50"
          @click="appDownloadModal = true"
        >
          <DownloadIcon />
        </div>
      </div>
      <div
        v-if="isDesktop"
        class="flex h-12 items-center justify-between rounded-sm bg-gray-900 text-gray-200"
      >
        <div class="flex items-center space-x-3">
          <WarningIcon class="h-6 w-6 text-ctp-subtext0" />
          <p>Keyboard shortcuts are paused on this page.</p>
        </div>
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Search</p>
        <InputKeys v-model="searchKeys" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Open App</p>
        <InputKeys v-model="openAppKeys" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Toggle Mute</p>
        <InputKeys v-model="toggleMuteKeys" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Toggle Deafen</p>
        <InputKeys v-model="toggleDeafenKeys" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Join Call</p>
        <InputKeys v-model="joinCallKeys" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Leave Call</p>
        <InputKeys v-model="leaveCallKeys" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Open Current Call</p>
        <InputKeys v-model="openCurrentCallKeys" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Upload File</p>
        <InputKeys v-model="uploadFileKeys" />
      </div>
    </div>
    <AppDownloadModal v-if="appDownloadModal" @close="appDownloadModal = false" />
  </div>
</template>

<script lang="ts" setup>
import DownloadIcon from "../icons/DownloadIcon.vue";
import { onBeforeUnmount, onMounted, ref } from "vue";
import AppDownloadModal from "../components/AppDownloadModal.vue";
import WarningIcon from "../icons/WarningIcon.vue";
import InputKeys from "../components/InputKeys.vue";
import { configToComputed } from "../global/helpers";
import { isDesktop } from "../global/helpers";
import { useStore } from "../global/store";

const store = useStore();
const appDownloadModal = ref(false);
const searchKeys = configToComputed<string>("searchKeys");
const openAppKeys = configToComputed<string>("openAppKeys");
const toggleMuteKeys = configToComputed<string>("toggleMuteKeys");
const toggleDeafenKeys = configToComputed<string>("toggleDeafenKeys");
const joinCallKeys = configToComputed<string>("joinCallKeys");
const leaveCallKeys = configToComputed<string>("leaveCallKeys");
const openCurrentCallKeys = configToComputed<string>("openCurrentCallKeys");
const uploadFileKeys = configToComputed<string>("uploadFileKeys");

onMounted(() => {
  store.resetKeybinds();
});

onBeforeUnmount(() => {
  store.setKeybinds();
});
</script>
