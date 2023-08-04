<template>
  <div
    class="flex w-96 cursor-pointer items-center justify-between rounded-md border px-2 py-1 transition bg-ctp-crust"
    :class="{
      'border-ctp-surface0/50 hover:border-ctp-surface0': !record,
      'border-ctp-accent hover:border-ctp-accent/50': record,
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

// eslint-disable-next-line vue/no-setup-props-destructure
const formatted = ref(props.modelValue ? formatKeys(props.modelValue.split("+")) : "None");

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
