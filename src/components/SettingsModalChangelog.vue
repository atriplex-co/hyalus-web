<template>
  <div>
    <p class="text-2xl">Changelog</p>
    <div class="mt-8 changelog" v-html="changelogHtml"></div>
  </div>
</template>

<script lang="ts" setup>
import MarkdownIt from "markdown-it";
import changelog from "../../CHANGELOG.md?raw";

const changelogHtml = new MarkdownIt().render(changelog);
</script>

<style>
.changelog h2 {
  @apply text-lg font-bold mt-4;
}

.changelog ul {
  @apply text-ctp-subtext0 mt-2 pb-4 border-b border-ctp-surface0/50;
}

.changelog li {
  @apply list-disc ml-4;
}
</style>
