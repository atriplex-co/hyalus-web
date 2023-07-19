<template>
  <div class="w-full">
    <div
      class="dark:bg-primary-600 bg-primary-500 flex h-9 items-center justify-between rounded-sm px-2 text-sm text-white"
    >
      <div class="flex items-center space-x-2 px-1">
        <WarningIcon class="h-5 w-5" />
        <p>Hyalus is currently in beta, please report bugs &amp; issues.</p>
      </div>
      <div
        class="h-6 w-6 cursor-pointer rounded-full bg-black bg-opacity-10 p-1 text-white transition hover:bg-opacity-25 hover:text-white"
        @click="hide"
      >
        <CloseIcon />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CloseIcon from "../icons/CloseIcon.vue";
import WarningIcon from "../icons/WarningIcon.vue";
import { useStore } from "../global/store";

const store = useStore();

const hide = async () => {
  await store.writeConfig("betaBanner", false);
};
</script>
