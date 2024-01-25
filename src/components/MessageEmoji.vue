<template>
  <div class="relative inline-block" @mouseup="isOpen && $event.stopPropagation()">
    <img :src="url" class="emoji cursor-pointer" @click="onClick" />
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute bottom-0 top-0 z-20 flex items-center text-sm"
        :class="{
          'left-[100%] origin-left': direction === 'right',
          'right-[100%] origin-right': direction === 'left',
        }"
      >
        <div
          v-if="isOpen"
          class="z-20 m-1 flex w-max items-center space-x-3 rounded-md bg-ctp-crust p-3 text-ctp-text shadow-md"
        >
          <img :src="url" class="h-10 w-10" />
          <div class="-space-y-0.5">
            <p class="text-base font-bold">{{ name }}</p>
            <p class="text-ctp-subtext0">{{ alt }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "@/global/store";
import type { ISpace, ISpaceEmoji } from "@/global/types";
import { emojis } from "hyalus-fluentui-emoji/dist/metadata.json";
import { onMounted, onUnmounted, ref } from "vue";

const store = useStore();
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});
const isOpen = ref(false);
const direction = ref("");
const name = ref("");
const alt = ref("");
let url = `/api/v1/emojis/${props.id}`;

if (props.type === "system") {
  const emoji = emojis.find((emoji) => emoji.id === props.id);
  if (emoji) {
    url = `/fluentui-emoji/${emoji.asset}`;
    name.value = `:${emoji.id}:`;
  } else {
    name.value = "Unknown Emoji";
  }
  alt.value = "System Emoji";
}

if (props.type === "user") {
  let space: ISpace | undefined;
  let emoji: ISpaceEmoji | undefined;
  for (const _space of store.spaces) {
    for (const _emoji of _space.emojis) {
      if (_emoji.id === props.id) {
        space = _space;
        emoji = _emoji;
        break;
      }
    }
  }
  if (space && emoji) {
    name.value = emoji.name;
    alt.value = `From ${space.name}`;
  } else {
    name.value = "Unknown Emoji";
    alt.value = "Information not available";
  }
}

const onClick = (e: MouseEvent) => {
  if (e.clientX <= innerWidth / 2) {
    direction.value = "right";
  }
  if (e.clientX >= innerWidth / 2) {
    direction.value = "left";
  }
  isOpen.value = !isOpen.value;
};

const close = () => {
  if (isOpen.value) {
    isOpen.value = false;
  }
};

onMounted(() => {
  addEventListener("mouseup", close);
});

onUnmounted(() => {
  removeEventListener("mouseup", close);
});
</script>

<style scoped>
img.emoji {
  height: 16px;
  width: 16px;
  margin-left: 2px;
  margin-right: 2px;
  margin-top: -2px;
  display: inline-block;
}
</style>
