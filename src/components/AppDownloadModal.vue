<template>
  <ModalBase empty @close="$emit('close')">
    <div
      class="dark:bg-dark-800 relative w-screen max-w-md rounded-md bg-white p-4"
    >
      <div
        class="absolute top-4 right-4 cursor-pointer"
        @click="$emit('close')"
      >
        <XMarkIcon class="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </div>
      <div
        v-if="defaultDownload"
        class="mt-8 flex w-full flex-col items-center space-y-4"
      >
        <div
          class="dark:bg-dark-600 mb-2 h-20 w-20 rounded-full bg-gray-100 p-4 text-gray-500 dark:text-gray-400"
        >
          <WindowsIcon v-if="defaultDownload.platform === 'win32'" />
          <AppleIcon v-if="defaultDownload.platform === 'osx'" />
          <LinuxIcon v-if="defaultDownload.platform === 'linux'" />
        </div>
        <a
          class="dark:bg-primary-600 bg-primary-500 rounded-md p-2 font-bold text-white shadow-sm"
          :href="defaultDownload.url"
        >
          <p v-if="defaultDownload.platform === 'win32'">
            Download for Windows
          </p>
          <p v-if="defaultDownload.platform === 'osx'">Download for macOS</p>
          <p v-if="defaultDownload.platform === 'linux'">Download for Linux</p>
        </a>
        <div
          class="flex cursor-pointer items-center space-x-1 text-sm text-gray-500 dark:text-gray-400"
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
          'mt-4 h-[8rem] ': showAllDownloads,
        }"
      >
        <div
          class="dark:border-dark-600 dark:bg-dark-900 dark:divide-dark-600 col flex w-full flex-col divide-y rounded-md border border-gray-200 bg-gray-100 text-sm shadow-sm"
        >
          <a
            v-for="download in availableDownloads"
            :key="download.url"
            :href="download.url"
            target="blank"
            rel="noopener noreferrer"
            class="dark:hover:bg-dark-700 flex h-10 space-x-4 items-center px-4 transition hover:bg-gray-200 hover:bg-opacity-50"
          >
            <WindowsIcon
              v-if="download.platform === 'win32'"
              class="h-4 w-4 text-gray-500 dark:text-gray-400"
            />
            <AppleIcon
              v-if="download.platform === 'osx'"
              class="h-4 w-4 text-gray-500 dark:text-gray-400"
            />
            <LinuxIcon
              v-if="download.platform === 'linux'"
              class="h-4 w-4 text-gray-500 dark:text-gray-400"
            />
            <p>{{ download.url.split("/").at(-1) }}</p>
          </a>
        </div>
      </div>
    </div>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import WindowsIcon from "../icons/WindowsIcon.vue";
import AppleIcon from "../icons/AppleIcon.vue";
import LinuxIcon from "../icons/LinuxIcon.vue";
import { ref } from "vue";
import ChevronDownIcon from "@heroicons/vue/20/solid/ChevronDownIcon";
import ChevronUpIcon from "@heroicons/vue/20/solid/ChevronUpIcon";
import XMarkIcon from "@heroicons/vue/20/solid/XMarkIcon";

const downloads = [
  {
    platform: "win32",
    origins: ["hyalus.app"],
    url: "https://github.com/atriplex-co/hyalus-desktop/releases/latest/download/HyalusDesktop-win32.exe",
  },
  {
    platform: "win32",
    origins: ["dev.hyalus.app", "localhost"],
    url: "https://github.com/atriplex-co/hyalus-desktop-dev/releases/latest/download/HyalusDesktopDev-win32.exe",
  },
  {
    platform: "osx",
    origins: ["hyalus.app"],
    url: "https://github.com/atriplex-co/hyalus-desktop/releases/latest/download/HyalusDesktop-osx.zip",
  },
  {
    platform: "osx",
    origins: ["dev.hyalus.app", "localhost"],
    url: "https://github.com/atriplex-co/hyalus-desktop-dev/releases/latest/download/HyalusDesktopDev-osx.zip",
  },
  {
    platform: "linux",
    origins: ["hyalus.app"],
    url: "https://github.com/atriplex-co/hyalus-desktop/releases/latest/download/HyalusDesktop-linux.AppImage",
  },
  {
    platform: "linux",
    origins: ["dev.hyalus.app", "localhost"],
    url: "https://github.com/atriplex-co/hyalus-desktop-dev/releases/latest/download/HyalusDesktopDev-linux.AppImage",
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

const availableDownloads = downloads.filter((download) =>
  download.origins.includes(location.hostname)
);
const defaultDownload = downloads.find(
  (download) =>
    download.platform === platform &&
    download.origins.includes(location.hostname)
);

defineEmits(["close"]);

const showAllDownloads = ref(!availableDownloads);
</script>
