<template>
  <div v-if="store.self">
    <p class="text-2xl">Profile</p>
    <div class="mt-8 space-y-4">
      <div class="flex space-x-8">
        <div class="space-y-2.5">
          <p class="text-sm font-semibold">Avatar</p>
          <div
            class="ring-ctp-accent transition-gray-400 relative h-32 w-32 cursor-pointer overflow-hidden rounded-full bg-ctp-crust shadow-sm transition"
            @click="setAvatar('avatar')"
          >
            <UserAvatar
              v-if="store.self.avatar"
              :avatar="store.self.avatar"
              class="h-full w-full cursor-pointer rounded-full"
            />
            <div
              class="absolute inset-0 flex items-center justify-center transition text-ctp-overlay0 hover:text-ctp-text"
              :class="{
                'opacity-0 hover:opacity-100 hover:bg-ctp-crust/50':
                  store.self.avatar,
              }"
            >
              <ArrowUpOnSquareIcon class="h-5 w-5" />
            </div>
          </div>
          <button
            v-if="store.self.avatar"
            class="text-ctp-accent hover:text-ctp-accent mx-auto block text-xs transition"
            @click="deleteAvatar('avatar')"
          >
            Remove
          </button>
        </div>
        <div class="space-y-2.5">
          <p class="text-sm font-semibold">Banner</p>
          <div
            class="ring-ctp-accent transition-gray-400 relative aspect-[3/1] h-32 cursor-pointer overflow-hidden rounded-md bg-ctp-crust shadow-sm transition"
            @click="setAvatar('banner')"
          >
            <img
              v-if="store.self.banner"
              :src="`/api/v1/avatars/${store.self.banner}`"
              class="h-full w-full object-cover object-center"
            />
            <div
              class="absolute inset-0 flex items-center justify-center transition text-ctp-overlay0 hover:text-ctp-text"
              :class="{
                'opacity-0 hover:opacity-100 hover:bg-ctp-crust/50':
                  store.self.banner,
              }"
            >
              <ArrowUpOnSquareIcon class="h-5 w-5" />
            </div>
          </div>
          <button
            v-if="store.self.banner"
            class="text-ctp-accent hover:text-ctp-accent mx-auto block text-xs transition"
            @click="deleteAvatar('banner')"
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
          class="ring-ctp-accent w-full resize-none rounded-md bg-ctp-crust border border-ctp-base px-3 py-2 text-ctp-subtext0 shadow-sm transition focus:outline-none focus:ring"
        />
      </div>
      <div class="space-y-2.5">
        <p class="text-sm font-semibold">Bio</p>
        <textarea
          v-model="bio"
          class="ring-ctp-accent h-64 w-full resize-none rounded-md bg-ctp-crust border border-ctp-base px-3 py-2 text-ctp-subtext0 shadow-sm transition focus:outline-none focus:ring"
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
import { ref } from "vue";
import { useStore } from "../global/store";
import UserAvatar from "./UserAvatar.vue";

const store = useStore();

const name = ref(store.self?.name || "");
const bio = ref(store.self?.bio || "");

const setAvatar = async (type: string) => {
  const el = document.createElement("input");

  el.addEventListener("input", async () => {
    if (!el.files) {
      return;
    }

    const form = new FormData();
    form.append("avatar", el.files[0]);

    await axios.post(`/api/v1/users/me/${type}`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  });

  el.type = "file";
  el.click();
};

const deleteAvatar = async (type: string) => {
  await axios.delete(`/api/v1/users/me/${type}`);
};

const save = async () => {
  await axios.post("/api/v1/users/me", {
    name: name.value,
    bio: bio.value,
  });
};
</script>
