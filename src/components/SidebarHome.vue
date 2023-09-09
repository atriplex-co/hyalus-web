<template>
  <div class="flex h-full w-full flex-col">
    <div class="flex h-14 items-center space-x-2 p-2">
      <button
        class="flex h-8 w-full cursor-pointer items-center space-x-3 overflow-hidden rounded-md bg-ctp-crust px-3"
        @click="store.quickSwitcherOpen = true"
      >
        <p class="flex-1 bg-transparent text-start text-sm text-ctp-overlay0">Search</p>
        <MagnifyingGlassIcon class="h-4 w-4 text-ctp-overlay0" />
      </button>
      <div
        to="/friends"
        class="relative flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-ctp-crust text-ctp-overlay0 transition hover:text-ctp-text"
        @click="store.sideBarState = SideBarState.FRIENDS"
      >
        <UsersIcon class="h-4 w-4" />
        <div
          v-if="acceptableFriendsCount"
          class="absolute -right-1 -top-1 rounded-full bg-ctp-accent px-1 text-center text-xs font-bold text-ctp-base"
        >
          {{ acceptableFriendsCount }}
        </div>
      </div>
      <div
        class="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-ctp-crust text-ctp-overlay0 transition hover:text-ctp-text"
        @click="settingsModal = true"
      >
        <CogIcon class="h-4 w-4" />
      </div>
    </div>
    <OverlayScrollbarsComponent
      defer
      class="min-h-0 h-full flex-1"
      :options="{
        scrollbars: {
          autoHide: 'leave',
          autoHideDelay: 0,
        },
      }"
    >
      <div class="pb-2 px-2 space-y-0.5">
        <SideBarChannel v-for="channel in channels" :key="channel.id" :channel="channel" />
      </div>
    </OverlayScrollbarsComponent>
    <div
      v-if="!channels.length"
      class="flex flex-1 flex-col items-center justify-center space-y-4 text-sm text-ctp-subtext0"
    >
      <SparklesIcon class="h-12 w-12 rounded-full bg-ctp-surface0/75 p-3" />
      <p>Welcome to Hyalus!</p>
      <button
        class="rounded-md bg-ctp-surface0/75 p-1.5 text-ctp-accent transition hover:bg-ctp-surface0/50"
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
import { isMobile } from "@/global/helpers";
import { useStore } from "@/global/store";
import { SideBarState } from "@/global/types";
import { ChannelType } from "@/../../hyalus-server/src/types";
import SettingsModal from "./SettingsModal.vue";
import { SparklesIcon } from "@heroicons/vue/24/solid";
import FriendAddModal from "./FriendAddModal.vue";
import { CogIcon, MagnifyingGlassIcon, UsersIcon } from "@heroicons/vue/20/solid";
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";

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
