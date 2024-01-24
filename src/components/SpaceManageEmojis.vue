<template>
  <div>
    <p class="text-2xl">Emojis</p>
    <div class="mt-8 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <p class="text-sm font-semibold text-ctp-subtext0">
            {{ space.emojis.length }}/{{ MaxEmojisPerSpace }} Emoji{{
              space.emojis.length === 1 ? "" : "s"
            }}
          </p>
          <button
            class="flex h-7 items-center space-x-1.5 rounded-md bg-ctp-accent p-1.5 text-xs text-ctp-crust transition hover:bg-ctp-accent/75"
            @click="upload"
          >
            <ArrowUpTrayIcon class="h-4 w-4" />
            <p>Upload</p>
          </button>
        </div>
        <input
          type="text"
          class="w-[50%] resize-none rounded-md border border-ctp-base bg-ctp-crust px-2 py-1 text-ctp-subtext0 shadow-sm ring-ctp-accent transition placeholder:text-ctp-overlay0 focus:outline-none focus:ring-2"
          placeholder="Search Emojis"
        />
      </div>
      <div class="flex h-8 items-center justify-between">
        <p>Allow External Use</p>
        <InputBoolean v-model="allowEmojiUse" />
      </div>
      <table
        class="w-full table-auto divide-y divide-ctp-surface0/50 border-b border-t border-ctp-surface0/50 text-sm"
      >
        <thead>
          <tr>
            <th class="w-24 text-start">Image</th>
            <th class="text-start">Name</th>
            <th class="text-start">Uploader</th>
            <td class="w-16"></td>
          </tr>
        </thead>
        <tbody class="divide-y divide-ctp-surface0/50">
          <SpaceEmojiManageItem
            v-for="emoji in space.emojis"
            :key="emoji.id"
            :space="space"
            :emoji="emoji"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { computed, type PropType } from "vue";
import type { ISpace } from "@/global/types";
import { ArrowUpTrayIcon } from "@heroicons/vue/20/solid";
import SpaceEmojiManageItem from "./SpaceEmojiManageItem.vue";
import InputBoolean from "./InputBoolean.vue";
import { MaxEmojisPerSpace } from "../../../hyalus-server/src/types";

const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});

const upload = () => {
  const el = document.createElement("input");

  el.addEventListener("input", async () => {
    if (!el.files) {
      return;
    }

    for (const file of Array.from(el.files)) {
      const form = new FormData();
      form.append("emoji", file);

      await axios.post(`/api/v1/spaces/${props.space.id}/emojis`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
  });

  el.type = "file";
  el.multiple = true;
  el.click();
};

const allowEmojiUse = computed({
  get() {
    return props.space.allowEmojiUse;
  },
  async set(val: boolean) {
    await axios.patch(`/api/v1/spaces/${props.space.id}`, {
      allowEmojiUse: val,
    });
  },
});
</script>

<style scoped>
th,
td {
  @apply h-12;
}
</style>
