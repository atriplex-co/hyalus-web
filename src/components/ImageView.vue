<template>
  <ModalBase empty @click="$emit('close')">
    <img :src="src" />
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";

defineEmits(["close"]);
defineProps({
  src: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
img {
  max-width: calc(100vw - 4rem);
  max-height: calc(100vh - 4rem);
}
</style>
