<template>
  <div
    class="dark:hover:border-dark-400 flex w-96 cursor-pointer items-center justify-between rounded-md border bg-gray-100 px-2 py-1 transition hover:border-gray-300 dark:bg-[#1c1c1c]"
    :class="{
      'dark:border-dark-600 border-gray-200': !record,
      'dark:border-dark-400 border-gray-300': record,
    }"
    @click="toggleRecord"
  >
    <p>{{ modelValue || "None" }}</p>
    <StopIcon v-if="record" class="h-4 w-4 text-gray-400" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import StopIcon from "../icons/StopIcon.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default() {
      //
    },
  },
});

const formatKeys = (keys: string[]) => {
  if (!keys.length) {
    return "None";
  }

  return keys.map((k) => `${k[0].toUpperCase()}${k.slice(1)}`).join(" + ");
};

const formatted = ref(
  props.modelValue ? formatKeys(props.modelValue.split("+")) : "None"
);

const emit = defineEmits(["update:modelValue"]);

const record = ref(false);
let recordKeys: string[] = [];

const keyDownHandler = (e: KeyboardEvent) => {
  e.preventDefault();

  if (!recordKeys.includes(e.key)) {
    recordKeys.push(e.key);
  }

  if (e.key === "Escape") {
    recordKeys = [];
  }

  formatted.value = formatKeys(recordKeys);
};

const keyUpHandler = () => {
  removeEventListener("keydown", keyDownHandler);
  removeEventListener("keyup", keyUpHandler);
  emit("update:modelValue", recordKeys.join("+"));
  record.value = false;
};

const toggleRecord = () => {
  record.value = !record.value;

  if (record.value) {
    recordKeys = [];
    addEventListener("keydown", keyDownHandler);
    addEventListener("keyup", keyUpHandler);
  } else {
    keyUpHandler();
  }
};
</script>
