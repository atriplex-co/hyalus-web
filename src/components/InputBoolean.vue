<template>
  <div
    class="flex h-5 w-10 cursor-pointer items-center rounded-full shadow-sm transition"
    :class="{
      'bg-ctp-accent': modelValue,
      'bg-ctp-surface0': !modelValue,
    }"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <div
      class="h-3.5 w-3.5 transform rounded-full shadow-sm transition"
      :class="{
        'translate-x-[22px] bg-ctp-base': modelValue,
        'translate-x-[2px] bg-ctp-text/50': !modelValue,
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
