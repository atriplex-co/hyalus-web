<template>
  <div
    :class="[
      'rounded-md border transition duration-100',
      {
        'dark:bg-dark-800 dark:border-dark-600 border-gray-200 bg-white text-transparent shadow-sm':
          !modelValue,
      },
      { 'bg-primary-500 border-primary-500 text-white': modelValue },
    ]"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <CheckIcon class="h-6 w-6 p-1" />
  </div>
</template>

<script lang="ts" setup>
import CheckIcon from "../icons/CheckIcon.vue";

defineEmits(["update:modelValue"]);

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
</script>
