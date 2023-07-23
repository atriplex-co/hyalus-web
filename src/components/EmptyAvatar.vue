<template>
  <div
    class="bg-ctp-accent flex items-center justify-center rounded-full font-bold text-ctp-base"
  >
    <p>{{ name ? name.slice(0, 1) : "?" }}</p>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from "vue";

defineProps({
  name: {
    type: String as PropType<string | null>,
    default: "?",
  },
});
</script>
