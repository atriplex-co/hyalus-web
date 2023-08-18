<template>
  <div
    class="fixed inset-0 flex h-full w-full flex-col items-center justify-center space-y-8 bg-white"
  >
    <div class="flex flex-col items-center space-y-4">
      <RefreshIcon class="h-20 w-20 text-ctp-subtext0" />
      <p class="text-2xl font-bold">Hyalus needs an update</p>
    </div>
    <div
      class="cursor-pointer rounded-md bg-ctp-base px-4 py-2 transition hover:bg-ctp-base"
      @click="submit"
    >
      <p>Reload</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import RefreshIcon from "../icons/RefreshIcon.vue";

const submit = () => {
  if (window.HyalusDesktop) {
    window.HyalusDesktop.restart();
  } else {
    location.reload();
  }
};
</script>
