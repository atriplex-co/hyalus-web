<template>
  <div class="w-full">
    <div class="flex h-9 items-center justify-between rounded-sm bg-ctp-base px-2 text-sm">
      <div class="flex items-center space-x-2 px-1">
        <ExclamationTriangleIcon class="h-5 w-5" />
        <p>Hyalus is currently in beta, please report bugs &amp; issues.</p>
      </div>
      <div
        class="h-6 w-6 cursor-pointer rounded-full bg-ctp-mantle p-1 text-ctp-subtext0 transition hover:bg-opacity-25 hover:text-white"
        @click="hide"
      >
        <XMarkIcon />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import { useStore } from "../global/store";

const store = useStore();

const hide = async () => {
  await store.writeConfig("betaBanner", false);
};
</script>
