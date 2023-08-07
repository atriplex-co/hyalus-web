<template>
  <div
    v-if="store.self"
    class="flex"
    :class="{
      'fixed inset-0 z-40': isMobile,
      'w-[22.5rem]': !isMobile,
      'w-full': isMobile && store.sideBarState !== SideBarState.NONE,
    }"
  >
    <div class="flex min-h-0 w-16 flex-col items-center space-y-2 bg-ctp-crust py-2">
      <div class="relative" @mouseup="userMenu && $event.stopPropagation()">
        <UserAvatar
          :avatar="store.self.avatar"
          class="h-10 w-10 cursor-pointer rounded-full"
          :status="store.self.preferredStatus"
          @click="store.sideBarState = SideBarState.HOME"
          @contextmenu.prevent="userMenu = !userMenu"
        />
        <SideBarUserMenu :show="userMenu" @close="userMenu = false" />
      </div>
      <router-link
        v-for="channel in privateChannels"
        :key="channel.id"
        class="relative flex h-10 w-10 items-center justify-center rounded-full bg-ctp-accent hover:bg-ctp-accent/75 text-ctp-base transition"
        :to="`/channels/${channel.id}`"
      >
        <UserAvatar v-if="channel.type === ChannelType.DM" :avatar="channel.members[0].avatar" />
        <UserAvatar
          v-if="channel.type === ChannelType.Group && channel.avatar"
          :avatar="channel.avatar"
        />
        <p v-if="channel.type === ChannelType.Group && !channel.avatar && channel.name">
          {{ channel.name.slice(0, 1) }}
        </p>
        <p
          class="bg-ctp-accent ring-ctp-crust absolute bottom-0 right-0 h-4 min-w-[1rem] rounded-full px-1 text-center text-xs font-bold text-ctp-base ring-2"
        >
          {{ getChannelState(channel).mentionCount }}
        </p>
      </router-link>
      <div class="w-full px-3">
        <div class="border-ctp-base -mt-px border-t"></div>
      </div>
      <button
        v-for="space in store.spaces"
        :key="space.id"
        class="bg-ctp-base flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition text-ctp-accent hover:bg-ctp-surface0/75"
        :class="{
          'ring-ctp-accent ring-2':
            store.sideBarState === SideBarState.SPACE && selectedSpaceId === space.id,
        }"
        @click="
          store.sideBarState = SideBarState.SPACE;
          selectedSpaceId = space.id;
        "
      >
        <UserAvatar v-if="space.avatar" :avatar="space.avatar" />
        <p v-else>{{ space.name.slice(0, 1) }}</p>
      </button>
      <button
        v-if="isDev"
        class="bg-ctp-base hover:bg-ctp-surface0/75 text-ctp-accent flex h-10 w-10 items-center justify-center rounded-full transition"
        @click="spaceCreateModal = true"
      >
        <PlusIcon class="h-5 w-5" />
      </button>
      <button
        v-if="store.updateAvailable"
        class="bg-ctp-base hover:bg-ctp-surface0/75 text-ctp-accent flex h-10 w-10 items-center justify-center rounded-full transition"
        @click="updateReloadModal = true"
      >
        <RefreshIcon class="h-5 w-5" />
      </button>
    </div>
    <div
      v-if="store.sideBarState !== SideBarState.NONE"
      class="flex min-w-0 flex-1 flex-col bg-ctp-mantle"
    >
      <div class="min-h-0 flex-1">
        <SidebarHome v-if="store.sideBarState == SideBarState.HOME" />
        <SideBarSettings v-if="store.sideBarState === SideBarState.SETTINGS" />
        <SideBarFriendList v-if="store.sideBarState === SideBarState.FRIENDS" />
        <SideBarSpace
          v-if="store.sideBarState === SideBarState.SPACE && selectedSpace"
          :space="selectedSpace"
        />
      </div>
      <SideBarCall />
    </div>
    <UpdateReloadModal v-if="updateReloadModal" @close="updateReloadModal = false" />
    <SpaceCreateModal
      v-if="spaceCreateModal"
      @close="spaceCreateModal = false"
      @join="spaceJoinModal = true"
    />
    <SpaceJoinModal v-if="spaceJoinModal" @close="spaceJoinModal = false" />
  </div>
</template>

<script lang="ts" setup>
import UserAvatar from "./UserAvatar.vue";
import RefreshIcon from "../icons/RefreshIcon.vue";
import SidebarHome from "./SidebarHome.vue";
import SideBarSettings from "./SideBarSettings.vue";
import SideBarFriendList from "./SideBarFriendList.vue";
import SideBarUserMenu from "./SideBarUserMenu.vue";
import UpdateReloadModal from "./UpdateReloadModal.vue";
import { ref, watch, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { SideBarState } from "../global/types";
import { getChannelState, isMobile } from "../global/helpers";
import { useStore } from "../global/store";
import PlusIcon from "../icons/PlusIcon.vue";
import SpaceCreateModal from "./SpaceCreateModal.vue";
import SideBarCall from "./SideBarCall.vue";
import SideBarSpace from "./SideBarSpace.vue";
import { ChannelType } from "@/../../hyalus-server/src/types";
import SpaceJoinModal from "./SpaceJoinModal.vue";

const store = useStore();
const route = useRoute();
const userMenu = ref(false);
const updateReloadModal = ref(false);
const spaceCreateModal = ref(false);
const spaceJoinModal = ref(false);
const isDev = !!import.meta.env.DEV;
const selectedSpaceId = ref("");
const selectedSpace = computed(() => {
  return store.spaces.find((space) => space.id === selectedSpaceId.value);
});
const privateChannels = computed(() => {
  return store.channels
    .filter((channel) => !channel.spaceId && getChannelState(channel).mentionCount)
    .sort((a, b) => (a.activeAt > b.activeAt ? -1 : 1));
});

const updateRoute = () => {
  if (route.name === "channel") {
    const channel = store.channels.find((channel) => channel.id === route.params.channelId);

    if (!channel) {
      return;
    }

    if (channel.spaceId) {
      selectedSpaceId.value = channel.spaceId;
      store.sideBarState = SideBarState.SPACE;
    } else {
      store.sideBarState = SideBarState.HOME;
    }
  }

  if (String(route.name).startsWith("settings")) {
    store.sideBarState = SideBarState.SETTINGS;
  }
};

updateRoute();
onMounted(updateRoute);
watch(route, updateRoute);
watch(selectedSpace, () => {
  if (!selectedSpace.value && store.sideBarState === SideBarState.SPACE) {
    selectedSpaceId.value = "";
    store.sideBarState = SideBarState.HOME;
  }
});

if (store.sideBarState === SideBarState.NONE) {
  store.sideBarState = SideBarState.HOME;
}
</script>
