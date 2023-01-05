<template>
  <div
    v-if="error"
    class="dark:bg-dark-800 dark:border-dark-600 flex w-full items-center space-x-3 rounded-md border border-gray-200 bg-gray-100 p-3 text-sm text-gray-800 shadow-sm dark:text-white"
  >
    <ErrorIcon class="h-6 w-6 text-gray-600 dark:text-gray-400" />
    <p class="flex-1">{{ error }}</p>
  </div>
</template>

<script lang="ts" setup>
import ErrorIcon from "../icons/ErrorIcon.vue";

defineProps({
  error: {
    type: String,
    default: "",
  },
});
</script>
