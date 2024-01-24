<template>
  <div
    class="rounded-md p-1 cursor-pointer"
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
  if (e.key === "Enter" && props.selected) {
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
