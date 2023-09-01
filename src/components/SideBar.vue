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
          :id="store.self.id"
          :avatar="store.self.avatar"
          :allow-status="true"
          :allow-animate="false"
          class="h-10 w-10 cursor-pointer rounded-full"
          @click="store.sideBarState = SideBarState.HOME"
          @contextmenu.prevent="userMenu = !userMenu"
        />
        <SideBarUserMenu :show="userMenu" @close="userMenu = false" />
      </div>
      <TransitionGroup
        enter-from-class="opacity-0 scale-0 h-0"
        enter-to-class="opacity-100 scale-100 h-10"
        enter-active-class="transition-all duration-100 transform ease-in-out overflow-hidden"
        leave-from-class="opacity-100 scale-100 h-10"
        leave-to-class="opacity-0 scale-0 h-0"
        leave-active-class="transition-all duration-100 transform ease-in-out overflow-hidden"
      >
        <div v-for="channel in privateChannels" :key="channel.id">
          <router-link
            class="relative flex h-10 w-10 items-center justify-center rounded-full bg-ctp-accent text-ctp-base transition hover:bg-ctp-accent/75"
            :to="`/channels/${channel.id}`"
          >
            <UserAvatar
              v-if="channel.type === ChannelType.DM"
              :avatar="channel.members[0].avatar"
            />
            <UserAvatar
              v-if="channel.type === ChannelType.Group && channel.avatar"
              :avatar="channel.avatar"
            />
            <p v-if="channel.type === ChannelType.Group && !channel.avatar && channel.name">
              {{ channel.name.slice(0, 1) }}
            </p>
            <p
              class="absolute bottom-0 right-0 h-4 min-w-[1rem] rounded-full bg-ctp-accent px-1 text-center text-xs font-bold text-ctp-base ring-2 ring-ctp-crust"
            >
              {{ getChannelState(channel).mentionCount }}
            </p>
          </router-link>
        </div>
      </TransitionGroup>
      <div class="w-full px-3">
        <div class="-mt-px border-t border-ctp-surface0/50"></div>
      </div>
      <button
        v-for="space in store.spaces"
        :key="space.id"
        class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-ctp-base text-ctp-accent transition hover:bg-ctp-surface0/75"
        :class="{
          'ring-2 ring-ctp-accent':
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
        class="flex h-10 w-10 items-center justify-center rounded-full bg-ctp-base text-ctp-accent transition hover:bg-ctp-surface0/75"
        @click="spaceCreateModal = true"
      >
        <PlusIcon class="h-5 w-5" />
      </button>
      <button
        v-if="store.updateAvailable"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-ctp-base text-ctp-accent transition hover:bg-ctp-surface0/75"
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
