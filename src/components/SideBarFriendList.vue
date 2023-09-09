<template>
  <div class="flex h-full w-full flex-col">
    <div class="flex h-14 items-center justify-between px-4">
      <div class="space-x-3 flex items-center">
        <div @click="store.sideBarState = SideBarState.HOME">
          <ChevronLeftIcon
            class="h-8 w-8 cursor-pointer rounded-full bg-ctp-surface0 p-1.5 text-ctp-subtext0 hover:text-ctp-text transition hover:bg-ctp-surface0/75"
          />
        </div>
        <p class="text-lg font-bold">Friends</p>
      </div>

      <div
        @click="friendAddModal = true"
        class="cursor-pointer rounded-md bg-ctp-accent py-1 px-1.5 text-ctp-base transition hover:bg-ctp-accent/75 flex items-center text-xs space-x-1"
      >
        <UserAddIcon class="h-5 w-5" />
        <p>Add</p>
      </div>
    </div>
    <OverlayScrollbarsComponent
      defer
      class="flex-1"
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

const friendAddModal = ref(false);
const friends = computed(() =>
  [...store.friends]
    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
    .sort((a) => (!a.accepted ? -1 : 1)),
);
</script>
