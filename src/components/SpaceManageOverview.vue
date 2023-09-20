<template>
  <div>
    <p class="text-2xl">Overview</p>
    <div class="mt-8 space-y-4">
      <div class="flex space-x-8">
        <div class="space-y-2.5">
          <p class="text-sm font-semibold">Avatar</p>
          <div
            class="transition-gray-400 relative h-32 w-32 cursor-pointer overflow-hidden rounded-full bg-ctp-crust shadow-sm ring-ctp-accent transition"
            @click="postImage(`/api/v1/spaces/${space.id}/avatar`)"
          >
            <UserAvatar
              v-if="space.avatar"
              :avatar="space.avatar"
              class="h-full w-full cursor-pointer rounded-full"
            />
            <div
              class="absolute inset-0 flex items-center justify-center text-ctp-overlay0 transition hover:text-ctp-text"
              :class="{
                'opacity-0 hover:bg-ctp-crust/50 hover:opacity-100': space.avatar,
              }"
            >
              <ArrowUpOnSquareIcon class="h-5 w-5" />
            </div>
          </div>
          <button
            v-if="space.avatar"
            class="mx-auto block text-xs text-ctp-accent transition hover:text-ctp-accent"
            @click="deleteAvatar"
          >
            Remove
          </button>
        </div>
      </div>
      <div class="w-full space-y-2.5">
        <p class="text-sm font-semibold">Name</p>
        <input
          v-model="name"
          type="text"
          class="w-full resize-none rounded-md border border-ctp-base bg-ctp-crust px-3 py-2 text-ctp-subtext0 shadow-sm ring-ctp-accent transition focus:outline-none focus:ring-2"
        />
      </div>
      <button
        class="rounded-md bg-ctp-surface0/50 px-6 py-2 text-sm transition hover:bg-ctp-base"
        @click="save"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowUpOnSquareIcon } from "@heroicons/vue/24/outline";
import axios from "axios";
import { type PropType, ref } from "vue";
import type { ISpace } from "@/global/types";
import UserAvatar from "./UserAvatar.vue";
import { postImage } from "@/global/helpers";

const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});

// eslint-disable-next-line vue/no-setup-props-destructure
const name = ref(props.space.name);

const deleteAvatar = async () => {
  await axios.delete(`/api/v1/spaces/${props.space.id}/avatar`);
};

const save = async () => {
  await axios.patch(`/api/v1/spaces/${props.space.id}`, {
    name: name.value,
  });
};
</script>
