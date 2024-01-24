<template>
  <ModalBase empty @close="$emit('close')">
    <div class="bg-ctp-base">
      <img :src="src" />
      <div class="flex items-center justify-between p-2">
        <div class="flex items-center space-x-2">
          <PhotoIcon class="h-8 w-8 rounded-full bg-ctp-surface0 p-2 text-ctp-subtext0" />
          <div class="-space-y-0.5">
            <p class="font-bold">{{ name }}</p>
            <p class="text-sm text-ctp-subtext0">{{ size }}</p>
          </div>
        </div>
        <div class="space-x-2">
          <button
            class="flex items-center space-x-2 rounded-md bg-ctp-accent p-1.5 text-sm text-ctp-base transition hover:bg-ctp-accent/75"
            @click="save"
          >
            <ArrowDownTrayIcon class="h-4 w-4" />
            <p>Save</p>
          </button>
        </div>
      </div>
    </div>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import { PhotoIcon, ArrowDownTrayIcon } from "@heroicons/vue/20/solid";

defineEmits(["close"]);
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
});

const save = () => {
  const el = document.createElement("a");
  el.href = props.src;
  el.download = props.name;
  el.click();
};
</script>

<style scoped>
img {
  max-width: calc(100vw - 12rem);
  max-height: calc(100vh - 12rem);
}
</style>
