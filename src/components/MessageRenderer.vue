<template>
  <render />
</template>

<script setup lang="ts">
import { h } from "vue";
import MessageEmoji from "./MessageEmoji.vue";

const props = defineProps({
  html: {
    type: String,
    required: true,
  },
});
const render = h({
  template: props.html,
  components: {
    MessageEmoji,
  },
});
</script>
