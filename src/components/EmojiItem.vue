<template>
  <img v-if="asset" :src="asset" :alt="`:${id}:`" loading="lazy" />
</template>

<script setup lang="ts">
import { emojis } from "@/../build/fluentui-emoji/metadata.json";
import { useStore } from "@/global/store";
import { ref } from "vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});
const store = useStore();
const asset = ref("");

const appEmoji = emojis.find((emoji) => emoji.id === props.id);
if (appEmoji) {
  asset.value = `/fluentui-emoji/${appEmoji.asset}`;
}

const spaceEmoji = store.spaces
  .map((space) => space.emojis)
  .reduce((a, b) => a.concat(b), [])
  .find((emoji) => emoji.id === props.id);
if (spaceEmoji) {
  asset.value = `/api/v1/emojis/${props.id}`;
}
</script>
