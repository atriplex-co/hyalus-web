<template>
  <div>
    <p class="text-2xl">Overview</p>
    <div class="mt-8 space-y-4">
      <div class="flex space-x-8">
        <div class="space-y-2.5">
          <p class="text-sm font-semibold">Avatar</p>
          <div
          class="ring-ctp-accent transition-gray-400 relative h-32 w-32 cursor-pointer overflow-hidden rounded-full bg-ctp-crust shadow-sm transition"
            @click="setAvatar"
          >
            <UserAvatar
              v-if="space.avatar"
              :avatar="space.avatar"
              class="h-full w-full cursor-pointer rounded-full"
            />
            <div
            class="absolute inset-0 flex items-center justify-center transition text-ctp-overlay0 hover:text-ctp-text"
              :class="{
                'opacity-0 hover:opacity-100 hover:bg-ctp-crust/50': space.avatar,
              }"
            >
              <ArrowUpOnSquareIcon class="h-5 w-5" />
            </div>
          </div>
          <button
            v-if="space.avatar"
            class="text-ctp-accent hover:text-ctp-accent mx-auto block text-xs transition"
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
          class="ring-ctp-accent w-full resize-none rounded-md bg-ctp-crust border border-ctp-base px-3 py-2 text-ctp-subtext0 shadow-sm transition focus:outline-none focus:ring-2"
        />
      </div>
      <button
      class="bg-ctp-surface0/50 hover:bg-ctp-base rounded-md py-2 px-6 text-sm transition"
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
import type { ISpace } from "../global/types";
import UserAvatar from "./UserAvatar.vue";

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

const setAvatar = async () => {
  const el = document.createElement("input");

  el.addEventListener("input", async () => {
    if (!el.files) {
      return;
    }

    const form = new FormData();
    form.append("avatar", el.files[0]);

    await axios.post(`/api/v1/spaces/${props.space.id}/avatar`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  });

  el.type = "file";
  el.click();
};

const deleteAvatar = async () => {
  await axios.delete(`/api/v1/spaces/${props.space.id}/avatar`);
};

const save = async () => {
  await axios.patch(`/api/v1/spaces/${props.space.id}`, {
    name: name.value,
  });
};
</script>
