<template>
  <div class="relative h-2.5 min-w-0 rounded-md bg-ctp-surface0 shadow-sm">
    <div
      id="val"
      class="absolute -top-10 z-10 flex w-10 items-center justify-center rounded-md border border-ctp-surface0 bg-ctp-base px-2 py-1 text-sm shadow-sm transition"
      :class="{
        'opacity-0': !valueShow,
      }"
    >
      {{ value }}
    </div>
    <input
      ref="input"
      v-model="value"
      type="range"
      :min="min"
      :max="max"
      class="absolute w-full appearance-none bg-transparent"
      @mouseenter="valueShow = true"
      @mouseleave="valueShow = false"
    />
    <div id="bar" class="absolute h-full rounded-l-md bg-ctp-accent" />
  </div>
</template>

<script lang="ts" setup>
import { ref, type Ref, computed, watch } from "vue";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  min: {
    type: String,
    default: "0",
  },
  max: {
    type: String,
    default: "0",
  },
  modelValue: {
    type: Number,
    default: 0,
  },
});

const input: Ref<HTMLInputElement | null> = ref(null);
// eslint-disable-next-line vue/no-setup-props-destructure
const value = ref(props.modelValue.toString());
const valueShow = ref(false);

const barWidth = computed(() => {
  if (!input.value) {
    return "";
  }

  return `${(+value.value / +props.max) * (input.value.offsetWidth - 16)}px`;
});

let lastEmitTime = 0;
let emitTimeout = 0;

watch(
  () => value.value,
  () => {
    if (Date.now() - lastEmitTime < 100) {
      clearTimeout(emitTimeout);
      emitTimeout = +setTimeout(() => {
        emit("update:modelValue", +value.value);
      }, 100);

      return;
    }

    lastEmitTime = Date.now();
    emit("update:modelValue", +value.value);
  },
);
</script>

<style scoped>
:root {
  --val-display: none;
}

input {
  pointer-events: none;
}

input::-webkit-slider-thumb {
  pointer-events: auto;
  @apply absolute -top-1 z-10 h-[1.125rem] w-2 cursor-[ew-resize] appearance-none rounded-full bg-ctp-text shadow-sm;
  left: v-bind(barWidth);
}

#bar {
  width: v-bind(barWidth);
}

#val {
  left: calc(v-bind(barWidth) - 1rem);
}
</style>
