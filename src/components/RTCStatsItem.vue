<template>
  <div>
    <div
      class="flex items-center justify-between space-x-2 cursor-pointer hover:bg-ctp-base p-1 rounded-md"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center space-x-2 min-w-0">
        <p class="font-bold flex-shrink-0">Type: {{ data.type }}</p>
        <p class="truncate">ID: {{ data.id }}</p>
      </div>
      <p class="transform rotate-90 text-ctp-overlay0">></p>
    </div>
    <ul v-if="isOpen" class="p-1 pt-0 pl-8">
      <li v-for="[k, v] in Object.entries(data)" :key="k" class="flex items-center space-x-2">
        <p>&bull;</p>
        <p class="font-bold">{{ k }}:</p>
        <p>{{ v }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps({
  data: {
    type: Object,
    required: true,
  },
});
const isOpen = ref(false);
</script>
