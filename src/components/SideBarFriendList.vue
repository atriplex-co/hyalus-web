<template>
  <div class="flex h-full w-full flex-col">
    <div class="flex h-14 items-center justify-between px-4">
      <p class="text-lg font-bold">Friends</p>
      <div @click="friendAddModal = true">
        <UserAddIcon
          class="bg-ctp-accent text-ctp-base hover:bg-ctp-accent/75 h-8 w-8 cursor-pointer rounded-full p-2 transition"
        />
      </div>
    </div>
    <div class="flex-1 space-y-0.5 overflow-auto px-2">
      <SideBarFriend v-for="friend in friends" :key="friend.id" :friend="friend" />
    </div>
    <FriendAddModal v-if="friendAddModal" @close="friendAddModal = false" />
  </div>
</template>

<script lang="ts" setup>
import SideBarFriend from "./SideBarFriend.vue";
import UserAddIcon from "../icons/UserAddIcon.vue";
import FriendAddModal from "./FriendAddModal.vue";
import { ref, computed } from "vue";
import { useStore } from "../global/store";

const store = useStore();

const friendAddModal = ref(false);
const friends = computed(() =>
  [...store.friends]
    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
    .sort((a) => (!a.accepted ? -1 : 1)),
);
</script>
