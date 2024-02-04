<template>
  <div class="flex h-full w-full flex-col">
    <div class="flex h-14 items-center justify-between px-4">
      <div class="flex items-center space-x-3">
        <div @click="store.sideBarState = SideBarState.HOME">
          <ChevronLeftIcon
            class="h-8 w-8 cursor-pointer rounded-full bg-ctp-surface0 p-1.5 text-ctp-subtext0 transition hover:bg-ctp-surface0/75 hover:text-ctp-text"
          />
        </div>
        <p class="text-lg font-bold">Friends</p>
      </div>
      <div
        @click="friendAddModal = true"
        class="flex cursor-pointer items-center space-x-1 rounded-md bg-ctp-accent px-1.5 py-1 text-xs text-ctp-base transition hover:bg-ctp-accent/75"
      >
        <UserAddIcon class="h-5 w-5" />
        <p>Add</p>
      </div>
    </div>
    <div class="bg-ctp-crust rounded-md p-2 mx-2 flex space-x-2 text-sm">
      <div
        class="bg-ctp-mantle rounded-md py-1 px-2 cursor-pointer transition hover:bg-ctp-surface0/50 text-ctp-subtext0 hover:text-ctp-text"
        :class="{
          'ring-2 ring-ctp-accent/50 text-ctp-text': filter === 'all',
        }"
        @click="filter = 'all'"
      >
        All
      </div>
      <div
        class="bg-ctp-mantle rounded-md py-1 px-2 cursor-pointer transition hover:bg-ctp-surface0/50 text-ctp-subtext0 hover:text-ctp-text"
        :class="{
          'ring-2 ring-ctp-accent/50 text-ctp-text': filter === 'online',
        }"
        @click="filter = 'online'"
      >
        Online
      </div>
      <div
        class="bg-ctp-mantle rounded-md py-1 px-2 cursor-pointer transition hover:bg-ctp-surface0/50 text-ctp-subtext0 hover:text-ctp-text"
        :class="{
          'ring-2 ring-ctp-accent/50 text-ctp-text': filter === 'blocked',
        }"
        @click="filter = 'blocked'"
      >
        Blocked
      </div>
    </div>
    <OverlayScrollbarsComponent
      defer
      class="flex-1 pt-2"
      :options="{
        scrollbars: {
          autoHide: 'leave',
          autoHideDelay: 0,
        },
      }"
    >
      <div class="space-y-0.5 px-2">
        <SideBarFriend v-for="friend in friends" :key="friend.id" :friend="friend" />
      </div>
    </OverlayScrollbarsComponent>
  </div>
  <FriendAddModal v-if="friendAddModal" @close="friendAddModal = false" />
</template>

<script lang="ts" setup>
import SideBarFriend from "./SideBarFriend.vue";
import UserAddIcon from "@/icons/UserAddIcon.vue";
import FriendAddModal from "./FriendAddModal.vue";
import { ref, computed } from "vue";
import { useStore } from "@/global/store";
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import { SideBarState } from "@/global/types";
import { ChevronLeftIcon } from "@heroicons/vue/20/solid";

const store = useStore();
const filter = ref("all");

const friendAddModal = ref(false);
const friends = computed(() =>
  [...store.friends]
    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
    .sort((a) => (!a.accepted ? -1 : 1)),
);
</script>
