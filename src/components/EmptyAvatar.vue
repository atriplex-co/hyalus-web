<template>
  <div class="flex items-center justify-center rounded-full bg-ctp-accent font-bold text-ctp-base">
    <p>{{ name ? name.slice(0, 1) : "?" }}</p>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";

defineProps({
  name: {
    type: String as PropType<string | null>,
    default: "?",
  },
});
</script>
