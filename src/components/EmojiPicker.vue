<template>
  <div
    class="flex h-80 w-full max-w-xs space-x-1.5 rounded-md bg-ctp-mantle p-2 shadow-md"
    @mouseup.stop
  >
    <div class="flex flex-shrink-0 flex-col gap-0.5 overflow-auto px-0.5" style="">
      <div
        v-for="group in groups"
        :key="group.name"
        class="h-8 w-8 cursor-pointer rounded-md p-1.5 transition hover:bg-ctp-surface0/50"
        :class="{
          'bg-ctp-surface0': selectedCategoryId === `group:${group.name}`,
        }"
        @click="
          selectedCategoryId = `group:${group.name}`;
          selectedCategoryName = group.name;
          selectedEmojis = emojis.filter((emoji) => emoji.group === group.name);
        "
      >
        <EmojiItem :id="group.emoji"></EmojiItem>
      </div>
      <div
        v-for="space in store.spaces.filter((space) => space.allowEmojiUse && space.emojis.length)"
        :key="space.id"
        class="h-8 w-8 cursor-pointer rounded-md p-1.5 transition hover:bg-ctp-surface0/50"
        :class="{
          'bg-ctp-surface0': selectedCategoryId === `space:${space.id}`,
        }"
        @click="
          selectedCategoryId = `space:${space.id}`;
          selectedCategoryName = space.name;
          selectedEmojis = space.emojis;
        "
      >
        <UserAvatar v-if="space.avatar" :avatar="space.avatar" />
        <EmptyAvatar v-else :name="space.name" class="text-sm" />
      </div>
    </div>
    <div class="border-l border-ctp-surface0"></div>
    <div class="space-y-0.5 overflow-auto">
      <p class="h-8 p-1.5 text-sm text-ctp-subtext0">{{ selectedCategoryName }}</p>
      <div class="flex flex-wrap gap-0.5" ref="emojiList">
        <div
          v-for="emoji in selectedEmojis"
          :key="emoji.id"
          :title="emoji.name"
          class="h-8 w-8 cursor-pointer rounded-md p-1.5 transition hover:bg-ctp-surface0/50"
          @click="$emit('append', `:${uuidToB32(emoji.id).toLowerCase()}: `)"
        >
          <EmojiItem :id="emoji.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { emojis as _emojis } from "hyalus-fluentui-emoji/dist/metadata.json";
import { onUnmounted, ref } from "vue";
import EmojiItem from "./EmojiItem.vue";
import { useStore } from "@/global/store";
import UserAvatar from "./UserAvatar.vue";
import EmptyAvatar from "./EmptyAvatar.vue";
import { uuidToB32 } from "@/global/helpers";

const emojis = Array.from(_emojis).sort((a, b) => (a.glyph < b.glyph ? 1 : -1));

const groups = [
  { name: "Smileys & Emotion", emoji: "grinning_face" },
  { name: "Animals & Nature", emoji: "deciduous_tree" },
  { name: "People & Body", emoji: "person" },
  { name: "Activities", emoji: "balloon" },
  { name: "Objects", emoji: "hot_beverage" },
  { name: "Food & Drink", emoji: "watermelon" },
  { name: "Travel & Places", emoji: "automobile" },
  { name: "Symbols", emoji: "red_heart" },
  { name: "Flags", emoji: "white_flag" },
];
const selectedCategoryId = ref("");
const selectedCategoryName = ref(groups[0].name);
const selectedEmojis = ref<{ id: string; name: string }[]>(
  emojis.filter((emoji) => emoji.group === groups[0].name),
);
const emojiList = ref<HTMLDivElement | null>(null);
const emit = defineEmits(["append", "close"]);
const store = useStore();

const close = () => emit("close");
addEventListener("mouseup", close);
onUnmounted(() => {
  removeEventListener("mouseup", close);
});
</script>
