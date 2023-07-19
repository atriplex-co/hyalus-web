<template>
  <div
    class="flex h-5 w-10 cursor-pointer items-center rounded-full shadow-sm transition"
    :class="{
      'bg-primary-500': modelValue,
      'dark:bg-dark-500 bg-gray-200': !modelValue,
    }"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <div
      class="h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition"
      :class="{
        'translate-x-[22px]': modelValue,
        'translate-x-[2px]': !modelValue,
      }"
    ></div>
  </div>
</template>

<script lang="ts" setup>
defineEmits(["update:modelValue"]);

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
</script>
