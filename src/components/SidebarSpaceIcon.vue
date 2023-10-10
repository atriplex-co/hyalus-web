<template>
  <button
    class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-ctp-base text-ctp-accent transition hover:bg-ctp-surface0/75"
    :class="{
      'ring-2 ring-ctp-accent': selected,
    }"
    @click="$emit('select')"
    @contextmenu="menu!.open($event)"
  >
    <UserAvatar v-if="space.avatar" :avatar="space.avatar" />
    <p v-else>{{ space.name.slice(0, 1) }}</p>
  </button>
  <SpaceContextMenu ref="menu" :space="space" />
</template>

<script setup lang="ts">
import { type ISpace } from "@/global/types";
import { type PropType, type Ref, ref } from "vue";
import SpaceContextMenu from "./SpaceContextMenu.vue";
import UserAvatar from "./UserAvatar.vue";

const menu: Ref<typeof SpaceContextMenu | null> = ref(null);

defineProps({
  space: {
    type: Object as PropType<ISpace>,
    required: true,
  },
  selected: {
    type: Boolean,
    required: true,
  },
});
defineEmits(["select"]);
</script>
