<template>
  <div class="flex h-full w-full flex-col">
    <div class="flex h-14 items-center space-x-2 p-2">
      <div
        class="bg-ctp-crust flex h-8 w-full items-center space-x-3 overflow-hidden rounded-md px-3 dark:text-gray-400"
      >
        <input
          type="text"
          placeholder="Search"
          class="w-full bg-transparent text-sm placeholder:text-ctp-overlay0"
        />
        <SearchIcon class="mt-0.5 h-5 w-5 text-ctp-overlay0" />
      </div>
      <div
        to="/friends"
        class="bg-ctp-crust relative flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-md text-ctp-overlay0 transition hover:text-ctp-text dark:text-gray-400 dark:hover:text-white"
        @click="store.sideBarState = SideBarState.FRIENDS"
      >
        <FriendsIcon class="h-4 w-4" />
        <div
          v-if="acceptableFriendsCount"
          class="bg-ctp-accent absolute -top-1 -right-1 rounded-full px-1 text-center text-xs font-bold text-ctp-base"
        >
          {{ acceptableFriendsCount }}
        </div>
      </div>
      <div
        class="bg-ctp-crust flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-md text-ctp-overlay0 transition hover:text-ctp-text dark:text-gray-400 dark:hover:text-white"
        @click="settingsModal = true"
      >
        <SettingsIcon class="h-4 w-4" />
      </div>
    </div>
    <div v-if="channels.length" class="flex-1 space-y-0.5 overflow-auto px-2 pb-2">
      <SideBarChannel v-for="channel in channels" :key="channel.id" :channel="channel" />
    </div>
    <div
      v-if="!channels.length"
      class="flex flex-1 flex-col items-center justify-center space-y-4 text-sm text-ctp-subtext0"
    >
      <SparklesIcon class="bg-dark-600 h-12 w-12 rounded-full p-2" />
      <p>Welcome to Hyalus!</p>
      <button
        class="bg-ctp-surface0/50 text-ctp-accent hover:bg-ctp-base rounded-md p-1.5 transition"
        @click="friendAddModal = true"
      >
        Add Friend
      </button>
    </div>
  </div>
  <GroupCreateModal v-if="groupCreateModal" @close="groupCreateModal = false" />
  <SettingsModal v-if="settingsModal" @close="settingsModal = false" />
  <FriendAddModal v-if="friendAddModal" @close="friendAddModal = false" />
</template>

<script lang="ts" setup>
import SideBarChannel from "./SideBarChannel.vue";
import GroupCreateModal from "./GroupCreateModal.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { isMobile } from "../global/helpers";
import { useStore } from "../global/store";
import SearchIcon from "../icons/SearchIcon.vue";
import FriendsIcon from "../icons/FriendsIcon.vue";
import SettingsIcon from "../icons/SettingsIcon.vue";
import { SideBarState } from "../global/types";
import { ChannelType } from "@/../../hyalus-server/src/types";
import SettingsModal from "./SettingsModal.vue";
import { SparklesIcon } from "@heroicons/vue/24/solid";
import FriendAddModal from "./FriendAddModal.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();
const groupCreateModal = ref(false);
const settingsModal = ref(false);
const friendAddModal = ref(false);

const acceptableFriendsCount = computed(() => {
  return store.friends.filter((friend) => friend.acceptable).length;
});

const channels = computed(() => {
  return store.channels
    .filter((channel) => !channel.spaceId)
    .sort((a, b) => (a.activeAt < b.activeAt ? 1 : -1));
});

onMounted(() => {
  const channel = store.channels.find((channel) => channel.id === route.params.channelId);

  if (
    !isMobile &&
    (!channel || channel.type === ChannelType.SpaceText || channel.type === ChannelType.SpaceVoice)
  ) {
    const openChannel =
      store.channels.find((channel) => channel.id === store.config["lastOpenChannelId:home"]) ||
      channels.value[0];

    if (openChannel) {
      router.push(`/channels/${openChannel.id}`);
    } else {
      router.push("/app");
    }
  }
});

const keydownHandler = (e: KeyboardEvent) => {
  const channel = channels.value.find((channel) => channel.id === route.params.channelId);
  if (!channel || channels.value.length < 2) {
    return;
  }
  const index = channels.value.indexOf(channel);

  if (e.altKey && e.key == "ArrowDown") {
    if (index < channels.value.length - 1) {
      router.push(`/channels/${channels.value[index + 1].id}`);
    } else {
      router.push(`/channels/${channels.value[0].id}`);
    }
  }

  if (e.altKey && e.key == "ArrowUp") {
    if (index > 0) {
      router.push(`/channels/${channels.value[index - 1].id}`);
    } else {
      router.push(`/channels/${channels.value[channels.value.length - 1].id}`);
    }
  }
};

onMounted(() => {
  addEventListener("keydown", keydownHandler);
});

onUnmounted(() => {
  removeEventListener("keydown", keydownHandler);
});
</script>
