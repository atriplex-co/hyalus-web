<template>
  <div class="w-full">
    <div class="bg-ctp-base flex h-9 items-center justify-between rounded-sm px-2 text-sm">
      <div class="flex items-center space-x-2 px-1">
        <WarningIcon class="h-5 w-5" />
        <p>Hyalus is currently in beta, please report bugs &amp; issues.</p>
      </div>
      <div
        class="h-6 w-6 cursor-pointer rounded-full bg-ctp-mantle p-1 text-ctp-subtext0 transition hover:bg-opacity-25 hover:text-white"
        @click="hide"
      >
        <CloseIcon />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "../global/store";
import CloseIcon from "../icons/CloseIcon.vue";
import WarningIcon from "../icons/WarningIcon.vue";

const store = useStore();

const hide = async () => {
  await store.writeConfig("betaBanner", false);
};
</script>
