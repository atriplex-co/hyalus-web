<template>
  <div class="flex-1 overflow-auto">
    <div class="flex h-14 items-center px-4 text-lg font-bold">
      <router-link
        v-if="isMobile"
        class="ml-2 mr-4 h-8 w-8 rounded-full bg-gray-600 p-1.5 text-gray-300 transition hover:bg-gray-500"
        to="/settings"
      >
        <ArrowLeftIcon />
      </router-link>
      <p>Updates &amp; Changelog</p>
    </div>
    <div
      class="dark:divide-dark-800 dark:border-dark-800 divide-y divide-gray-100 border-t border-b border-gray-100"
    >
      <p>yeah so about that...</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ArrowLeftIcon from "../icons/ArrowLeftIcon.vue";
import { isMobile } from "../global/helpers";
import { useStore } from "../global/store";

const store = useStore();

store.sideBarOpen = false;
document.title = "Hyalus \u2022 Updates & Changelog";
</script>
