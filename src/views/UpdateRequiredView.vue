<template>
  <div
    class="fixed inset-0 z-20 flex h-full w-full flex-col items-center justify-center space-y-6 bg-ctp-crust text-sm"
  >
    <div class="flex flex-col items-center space-y-4">
      <ArrowPathIcon class="h-16 w-16 text-ctp-subtext0" />
      <p class="text-2xl font-bold">Hyalus needs an update</p>
    </div>
    <div
      class="cursor-pointer rounded-md bg-ctp-base px-4 py-2 transition hover:bg-ctp-base/50"
      @click="submit"
    >
      <p>Reload</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowPathIcon } from "@heroicons/vue/24/solid";

const submit = () => {
  if (window.HyalusDesktop) {
    window.HyalusDesktop.restart();
  } else {
    location.reload();
  }
};
</script>
