<template>
  <ModalBase empty @close="$emit('close')">
    <div class="bg-ctp-base">
      <img :src="src" />
      <div class="p-2 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <PhotoIcon class="text-ctp-subtext0 bg-ctp-surface0 rounded-full w-8 h-8 p-2" />
          <div class="-space-y-0.5">
            <p class="font-bold">{{ name }}</p>
            <p class="text-ctp-subtext0 text-sm">{{ size }}</p>
          </div>
        </div>
        <div class="space-x-2">
          <button
            class="bg-ctp-accent text-ctp-base flex items-center rounded-md p-1.5 space-x-2 hover:bg-ctp-accent/75 transition text-sm"
            @click="save"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
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
