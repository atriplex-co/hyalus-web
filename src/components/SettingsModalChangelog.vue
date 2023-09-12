<template>
  <div>
    <p class="text-2xl">Changelog</p>
    <div class="changelog mt-8" v-html="changelogHtml"></div>
  </div>
</template>

<script lang="ts" setup>
import MarkdownIt from "markdown-it";
import changelog from "@/../CHANGELOG.md?raw";

const changelogHtml = new MarkdownIt().render(changelog);
</script>

<style>
.changelog h2 {
  @apply mt-4 text-lg font-bold;
}

.changelog ul {
  @apply mt-2 border-b border-ctp-surface0/50 pb-4 text-ctp-subtext0;
}

.changelog li {
  @apply ml-4 list-disc;
}
</style>
