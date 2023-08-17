<template>
  <div class="accent-green flex-1 bg-ctp-crust">
    <div class="bg-dark-900 py-16">
      <div class="mx-auto flex w-full max-w-4xl items-center justify-between">
        <div>
          <img src="../assets/images/icon-standalone-green.png" class="h-12 w-12" />
          <p class="mt-8 text-2xl font-bold">Hyalus</p>
          <p class="mt-2 text-lg text-ctp-subtext0">It's a messaging app.</p>
          <div class="mt-8 flex space-x-4 text-sm">
            <button
              class="bg-ctp-accent text-ctp-base hover:bg-ctp-accent/75 rounded-md py-2.5 px-3.5 transition"
              @click="appDownloadModal = true"
            >
              Download
            </button>
            <router-link
              class="rounded-md py-2.5 px-3.5 text-ctp-subtext0 transition bg-ctp-base hover:bg-ctp-base/75"
              to="/app"
            >
              Open Web App
            </router-link>
          </div>
        </div>
        <img src="../assets/images/Chat-bro.png" class="max-w-md" />
      </div>
    </div>
    <div class="bg-ctp-mantle flex flex-col items-center py-20">
      <p class="text-3xl font-bold">A better chat app</p>
      <p class="mt-4 text-lg text-ctp-subtext0">
        See why Hyalus is the best thing since sliced bread.
      </p>
      <div class="mt-20 space-y-16">
        <div class="flex space-x-12">
          <div
            class="bg-ctp-base flex h-48 w-80 flex-col items-center rounded-md px-8 text-center shadow-md"
          >
            <div class="-mt-6 h-12 w-12 rounded-md bg-ctp-accent text-ctp-surface0 p-3 shadow-sm">
              <LockIcon />
            </div>
            <p class="mt-8 text-2xl font-bold">Secure</p>
            <p class="mt-4 text-ctp-subtext0">
              Messages and calls are end-to-end encrypted by default.
            </p>
          </div>
          <div
            class="bg-ctp-base flex h-48 w-80 flex-col items-center rounded-md px-8 text-center shadow-md"
          >
            <div class="-mt-6 h-12 w-12 rounded-md bg-ctp-accent text-ctp-surface0 p-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"
                />
              </svg>
            </div>
            <p class="mt-8 text-2xl font-bold">Platforms</p>
            <p class="mt-4 text-ctp-subtext0">Desktop app support for Windows, macOS, and Linux.</p>
          </div>
          <div
            class="bg-ctp-base flex h-48 w-80 flex-col items-center rounded-md px-8 text-center shadow-md"
          >
            <div class="-mt-6 h-12 w-12 rounded-md bg-ctp-accent text-ctp-surface0 p-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 7H7v6h6V7z" />
                <path
                  fill-rule="evenodd"
                  d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <p class="mt-8 text-2xl font-bold">Lightweight</p>
            <p class="mt-4 text-ctp-subtext0">
              Because your chat app shouldn't slow down your game.
            </p>
          </div>
        </div>
        <div class="flex space-x-12">
          <div
            class="bg-ctp-base flex h-48 w-80 flex-col items-center rounded-md px-8 text-center shadow-md"
          >
            <div class="-mt-6 h-12 w-12 rounded-md bg-ctp-accent text-ctp-surface0 p-3 shadow-sm">
              <DesktopIcon />
            </div>
            <p class="mt-8 text-2xl font-bold">Screenshare</p>
            <p class="mt-4 text-ctp-subtext0">
              Share your screen with our GPU-accelerated media engine.
            </p>
          </div>
          <div
            class="bg-ctp-base flex h-48 w-80 flex-col items-center rounded-md px-8 text-center shadow-md"
          >
            <div class="-mt-6 h-12 w-12 rounded-md bg-ctp-accent text-ctp-surface0 p-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="mt-8 flex items-center space-x-2">
              <p class="text-2xl font-bold">Servers</p>
              <p class="bg-ctp-surface0 rounded-md py-1 px-2 text-xs text-ctp-subtext0">WIP</p>
            </div>
            <p class="mt-4 text-ctp-subtext0">
              Organized and customizable spaces for clubs & communities.
            </p>
          </div>
          <div
            class="bg-ctp-base flex h-48 w-80 flex-col items-center rounded-md px-8 text-center shadow-md"
          >
            <div class="-mt-6 h-12 w-12 rounded-md bg-ctp-accent text-ctp-surface0 p-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <p class="mt-8 text-2xl font-bold">Tweakable</p>
            <p class="mt-4 text-ctp-subtext0">
              Personalize Hyalus with custom or built-in themes & colors.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="text-ctp-subtext0">
      <div class="mx-auto flex w-full max-w-4xl items-center justify-between py-12">
        <p>&copy; Atriplex 2022</p>
        <div class="flex space-x-4">
          <a href="https://twitter.com/hyalusapp" rel="noopener noreferrer" target="_blank">
            <TwitterIcon class="h-5 w-5" />
          </a>
          <a href="https://youtube.com/channel/hyalusapp" rel="noopener noreferrer" target="_blank">
            <YouTubeIcon class="h-5 w-5" />
          </a>
          <a href="https://github.com/atriplex-co" rel="noopener noreferrer" target="_blank">
            <GitHubIcon class="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
    <AppDownloadModal v-if="appDownloadModal" @close="appDownloadModal = false" />
  </div>
</template>

<script lang="ts" setup>
import AppDownloadModal from "../components/AppDownloadModal.vue";
import { ref } from "vue";
import LockIcon from "../icons/LockIcon.vue";
import DesktopIcon from "../icons/DesktopIcon.vue";
import TwitterIcon from "../icons/TwitterIcon.vue";
import GitHubIcon from "../icons/GitHubIcon.vue";
import YouTubeIcon from "../icons/YouTubeIcon.vue";

const appDownloadModal = ref(false);

document.title = "Hyalus";
</script>
