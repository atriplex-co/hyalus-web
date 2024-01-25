<template>
  <div
    class="cursor-pointer rounded-md p-1"
    :class="{
      'bg-ctp-base': selected,
    }"
    @mouseover="$emit('select')"
    @click="$emit('replace')"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const props = defineProps({
  selected: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(["replace", "select"]);

const keydownHandler = (e: KeyboardEvent) => {
  if ((e.key === "Enter" || e.key === "Tab") && props.selected) {
    e.preventDefault();
    e.stopPropagation();
    emit("replace");
  }
};

onMounted(() => {
  addEventListener("keydown", keydownHandler, true);
});

onUnmounted(() => {
  removeEventListener("keydown", keydownHandler, true);
});
</script>
