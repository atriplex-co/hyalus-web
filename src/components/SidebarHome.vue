<template>
  <div class="flex h-full w-full flex-col">
    <div class="flex h-14 items-center space-x-2 p-2">
      <div
        class="dark:bg-dark-900 flex h-8 w-full items-center space-x-3 overflow-hidden rounded-md bg-gray-200 px-3 dark:text-gray-400"
      >
        <input
          type="text"
          placeholder="Search"
          class="w-full bg-transparent text-sm placeholder:text-gray-500"
        />
        <SearchIcon class="mt-0.5 h-5 w-5 text-gray-500" />
      </div>
      <div
        to="/friends"
        class="dark:bg-dark-900 relative flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-gray-200 text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        @click="store.sideBarState = SideBarState.FRIENDS"
      >
        <FriendsIcon class="h-4 w-4" />
        <div
          v-if="acceptableFriendsCount"
          class="bg-primary-500 dark:bg-primary-600 absolute -top-1 -right-1 rounded-full px-1 text-center text-xs font-bold text-white"
        >
          {{ acceptableFriendsCount }}
        </div>
      </div>
      <div
        class="dark:bg-dark-900 flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-gray-200 text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        to="/settings/account"
        @click="
          if ($event.shiftKey) {
            router.push(`/settings/account`);
          } else {
            settingsModal = true;
          }
        "
      >
        <SettingsIcon class="h-4 w-4" />
      </div>
    </div>
    <div v-if="channels.length" class="flex-1 space-y-0.5 overflow-auto px-2">
      <SideBarChannel
        v-for="channel in channels"
        :key="channel.id"
        :channel="channel"
      />
    </div>
    <div
      v-if="!channels.length"
      class="flex flex-1 flex-col items-center justify-center space-y-4 text-sm text-gray-500"
    >
      <SparklesIcon class="bg-dark-600 h-12 w-12 rounded-full p-2" />
      <p>Welcome to Hyalus!</p>
      <button
        class="bg-dark-600 text-primary-400 hover:bg-primary-300 rounded-md p-1.5 transition hover:bg-opacity-5"
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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { isMobile } from "../global/helpers";
import { useStore } from "../global/store";
import SearchIcon from "../icons/SearchIcon.vue";
import FriendsIcon from "../icons/FriendsIcon.vue";
import SettingsIcon from "../icons/SettingsIcon.vue";
import { SideBarState } from "../global/types";
import { ChannelType } from "@/../hyalus-server/src/types";
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
  const channel = store.channels.find(
    (channel) => channel.id === route.params.channelId,
  );

  if (
    !isMobile &&
    (!channel ||
      channel.type === ChannelType.SpaceText ||
      channel.type === ChannelType.SpaceVoice)
  ) {
    const openChannel =
      store.channels.find(
        (channel) => channel.id === store.config["lastOpenChannelId:home"],
      ) || channels.value[0];

    if (openChannel) {
      router.push(`/channels/${openChannel.id}`);
    } else {
      router.push("/app");
    }
  }
});
</script>
