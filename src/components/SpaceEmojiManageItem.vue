<template>
  <tr class="h-16">
    <td>
      <img :src="`/api/v1/emojis/${emoji.id}`" class="h-10 w-10" />
    </td>
    <td>
      <p>{{ emoji.name }}</p>
    </td>
    <td>
      <div class="flex items-center space-x-3">
        <UserAvatar :avatar="emoji.creator.avatar" class="h-8 w-8 rounded-full" />
        <div class="-space-y-0.5">
          <p class="text-sm font-semibold">{{ emoji.creator.name }}</p>
          <p class="text-sm text-ctp-subtext0">@{{ emoji.creator.username }}</p>
        </div>
      </div>
    </td>
    <td>
      <div class="flex space-x-2">
        <button
          class="h-8 w-8 rounded-full bg-ctp-surface0 p-2 text-ctp-subtext0 transition hover:bg-ctp-surface0/50"
          @click="editModal = true"
        >
          <PencilIcon />
        </button>
        <button
          class="h-8 w-8 rounded-full bg-ctp-surface0 p-2 text-ctp-subtext0 transition hover:bg-ctp-surface0/50"
          @click="remove"
        >
          <TrashIcon />
        </button>
      </div>
    </td>
  </tr>
  <SpaceEmojiDeleteModal
    v-if="deleteModal"
    :space="space"
    :emoji="emoji"
    @close="deleteModal = false"
  />
  <SpaceEmojiEditModal v-if="editModal" :space="space" :emoji="emoji" @close="editModal = false" />
</template>

<script setup lang="ts">
import type { ISpace, ISpaceEmoji } from "@/global/types";
import { PencilIcon, TrashIcon } from "@heroicons/vue/20/solid";
import { ref, type PropType } from "vue";
import UserAvatar from "./UserAvatar.vue";
import axios from "axios";
import SpaceEmojiDeleteModal from "./SpaceEmojiDeleteModal.vue";
import SpaceEmojiEditModal from "./SpaceEmojiEditModal.vue";

const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    required: true,
  },
  emoji: {
    type: Object as PropType<ISpaceEmoji>,
    required: true,
  },
});
const deleteModal = ref(false);
const editModal = ref(false);
const remove = async (e: MouseEvent) => {
  if (e.shiftKey) {
    await axios.delete(`/api/v1/spaces/${props.space.id}/emojis/${props.emoji.id}`);
    return;
  }
  deleteModal.value = true;
};
</script>

<style scoped>
th,
td {
  @apply h-12;
}
</style>
