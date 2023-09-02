<template>
  <ModalBase empty @close="$emit('close')">
    <div class="relative w-screen max-w-md rounded-md bg-ctp-mantle p-4">
      <div class="absolute right-4 top-4 cursor-pointer" @click="$emit('close')">
        <XMarkIcon class="h-5 w-5 text-ctp-overlay0" />
      </div>
      <div v-if="defaultDownload" class="mt-8 flex w-full flex-col items-center space-y-4">
        <div class="mb-2 h-20 w-20 rounded-full bg-ctp-surface0 p-4">
          <WindowsIcon v-if="defaultDownload.platform === 'win32'" />
          <AppleIcon v-if="defaultDownload.platform === 'osx'" />
          <LinuxIcon v-if="defaultDownload.platform === 'linux'" />
        </div>
        <a
          class="rounded-md bg-ctp-accent p-2 font-medium text-ctp-base shadow-sm"
          :href="defaultDownload.url"
        >
          <p v-if="defaultDownload.platform === 'win32'">Download for Windows</p>
          <p v-if="defaultDownload.platform === 'osx'">Download for macOS</p>
          <p v-if="defaultDownload.platform === 'linux'">Download for Linux</p>
        </a>
        <div
          class="flex cursor-pointer items-center space-x-1 text-sm text-ctp-subtext0"
          @click="showAllDownloads = !showAllDownloads"
        >
          <p v-if="!showAllDownloads">Show all downloads</p>
          <p v-if="showAllDownloads">Hide all downloads</p>
          <ChevronDownIcon v-if="!showAllDownloads" class="h-5 w-5" />
          <ChevronUpIcon v-if="showAllDownloads" class="h-5 w-5" />
        </div>
      </div>
      <div
        class="mb-4 flex w-full transform flex-col items-center space-y-4 overflow-hidden transition-all"
        :class="{
          'h-0 ': !showAllDownloads,
          'mt-4 h-[7.75rem] ': showAllDownloads,
        }"
      >
        <div
          class="col flex w-full flex-col divide-y divide-ctp-base rounded-md border border-ctp-base bg-ctp-crust text-sm shadow-sm"
        >
          <a
            v-for="download in downloads"
            :key="download.url"
            :href="download.url"
            target="blank"
            rel="noopener noreferrer"
            class="flex h-10 items-center space-x-4 px-4 transition hover:bg-ctp-mantle/75"
          >
            <WindowsIcon v-if="download.platform === 'win32'" class="h-4 w-4 text-ctp-subtext0" />
            <AppleIcon v-if="download.platform === 'osx'" class="h-4 w-4 text-ctp-subtext0" />
            <LinuxIcon v-if="download.platform === 'linux'" class="h-4 w-4 text-ctp-subtext0" />
            <p>{{ download.url.split("/").at(-1) }}</p>
          </a>
        </div>
      </div>
    </div>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import WindowsIcon from "@/icons/WindowsIcon.vue";
import AppleIcon from "@/icons/AppleIcon.vue";
import LinuxIcon from "@/icons/LinuxIcon.vue";
import { ref } from "vue";
import ChevronDownIcon from "@heroicons/vue/20/solid/ChevronDownIcon";
import ChevronUpIcon from "@heroicons/vue/20/solid/ChevronUpIcon";
import XMarkIcon from "@heroicons/vue/20/solid/XMarkIcon";

const downloads = [
  {
    platform: "win32",
    branch: "main",
    url: "https://github.com/atriplex-co/hyalus-desktop/releases/latest/download/HyalusDesktop-win32.exe",
  },
  {
    platform: "osx",
    branch: "main",
    url: "https://github.com/atriplex-co/hyalus-desktop/releases/latest/download/HyalusDesktop-osx.zip",
  },
  {
    platform: "linux",
    branch: "main",
    url: "https://github.com/atriplex-co/hyalus-desktop/releases/latest/download/HyalusDesktop-linux.AppImage",
  },
];

let platform = "";

if (navigator.userAgent.includes("Windows NT")) {
  platform = "win32";
}

if (navigator.userAgent.includes("Mac OS X")) {
  platform = "osx";
}

if (navigator.userAgent.includes("Linux")) {
  platform = "linux";
}

const defaultDownload = downloads.find((download) => download.platform === platform);

defineEmits(["close"]);

const showAllDownloads = ref(!defaultDownload);
</script>
