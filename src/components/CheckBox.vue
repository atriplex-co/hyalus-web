<template>
  <div
    :class="[
      'rounded-md border border-ctp-surface0 transition duration-100',
      {
        'text-transparent': !modelValue,
      },
      { 'bg-ctp-accent text-ctp-base': modelValue },
    ]"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <CheckIcon class="h-5 w-5 p-1" />
  </div>
</template>

<script lang="ts" setup>
import CheckIcon from "@/icons/CheckIcon.vue";

defineEmits(["update:modelValue"]);

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
</script>
