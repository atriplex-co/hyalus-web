<template>
  <div
    class="max-w-xs bg-ctp-mantle w-full h-80 rounded-md p-2 space-x-1.5 flex shadow-md"
    @mouseup.stop
  >
    <div class="overflow-auto flex-shrink-0 flex flex-col gap-0.5 px-0.5" style="">
      <div
        v-for="group in groups"
        :key="group.name"
        class="w-8 h-8 p-1.5 cursor-pointer hover:bg-ctp-surface0/50 rounded-md transition"
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
        class="w-8 h-8 p-1.5 cursor-pointer hover:bg-ctp-surface0/50 rounded-md transition"
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
    <div class="overflow-auto space-y-0.5">
      <p class="text-sm p-1.5 text-ctp-subtext0 h-8">{{ selectedCategoryName }}</p>
      <div class="flex flex-wrap gap-0.5" ref="emojiList">
        <div
          v-for="emoji in selectedEmojis"
          :key="emoji.id"
          :title="emoji.name"
          class="w-8 h-8 p-1.5 hover:bg-ctp-surface0/50 transition rounded-md cursor-pointer"
          @click="$emit('append', `:${emoji.id}: `)"
        >
          <EmojiItem :id="emoji.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { emojis as _emojis } from "@/../build/fluentui-emoji/metadata.json";
import { onUnmounted, ref } from "vue";
import EmojiItem from "./EmojiItem.vue";
import { useStore } from "@/global/store";
import UserAvatar from "./UserAvatar.vue";
import EmptyAvatar from "./EmptyAvatar.vue";

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
