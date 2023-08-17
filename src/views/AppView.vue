<template>
  <div class="flex flex-1 flex-col items-center justify-center">
    <AppIcon class="h-24 w-24 opacity-10 grayscale filter" />
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "../global/store";
import AppIcon from "../icons/AppIcon.vue";

const store = useStore();

document.title = "Hyalus";
store.sideBarOpen = true;
</script>
