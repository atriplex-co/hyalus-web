<template>
  <!-- TODO: remove this once the new settings page is stable. -->
  <div class="flex w-full flex-col">
    <div class="flex h-14 items-center px-4 text-lg font-bold">
      <p>Control Panel</p>
    </div>
    <div class="space-y-1 px-2 text-gray-500 dark:text-gray-400">
      <router-link
        class="flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:bg-opacity-50 dark:hover:text-white"
        :class="{
          'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-white':
            active === 'account',
        }"
        to="/settings/account"
        @click="active = 'account'"
      >
        <UserIcon class="h-5 w-5" />
        <p>Account</p>
      </router-link>
      <router-link
        class="flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:bg-opacity-50 dark:hover:text-white"
        :class="{
          'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-white':
            active === 'appearance',
        }"
        to="/settings/appearance"
        @click="active = 'appearance'"
      >
        <EyeIcon class="h-5 w-5" />
        <p>Appearance</p>
      </router-link>
      <router-link
        class="flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:bg-opacity-50 dark:hover:text-white"
        :class="{
          'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-white':
            active === 'notifications',
        }"
        to="/settings/notifications"
        @click="active = 'notifications'"
      >
        <BellIcon class="h-5 w-5" />
        <p>Notifications</p>
      </router-link>
      <router-link
        class="flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:bg-opacity-50 dark:hover:text-white"
        :class="{
          'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-white':
            active === 'media',
        }"
        to="/settings/media"
        @click="active = 'media'"
      >
        <VideoIcon class="h-5 w-5" />
        <p>Audio &amp; Video</p>
      </router-link>
      <router-link
        class="flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:bg-opacity-50 dark:hover:text-white"
        :class="{
          'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-white':
            active === 'keyboard',
        }"
        to="/settings/keyboard"
        @click="active = 'keyboard'"
      >
        <KeyboardIcon class="h-5 w-5" />
        <p>Keyboard Shortcuts</p>
      </router-link>
      <router-link
        v-if="isDesktop"
        class="flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:bg-opacity-50 dark:hover:text-white"
        :class="{
          'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-white':
            active === 'desktop',
        }"
        to="/settings/desktop"
        @click="active = 'desktop'"
      >
        <ChipIcon class="h-5 w-5" />
        <p>Desktop Integration</p>
      </router-link>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-black dark:hover:bg-gray-800 dark:hover:bg-opacity-50 dark:hover:text-white"
        @click="logoutModal = true"
      >
        <LogoutIcon class="h-5 w-5" />
        <p>Log Out</p>
      </div>
    </div>
    <LogoutModal v-if="logoutModal" @close="logoutModal = false" />
  </div>
</template>

<script lang="ts" setup>
import LogoutModal from "./LogoutModal.vue";
import UserIcon from "../icons/UserIcon.vue";
import BellIcon from "../icons/BellIcon.vue";
import VideoIcon from "../icons/VideoIcon.vue";
import LogoutIcon from "../icons/LogoutIcon.vue";
import KeyboardIcon from "../icons/KeyboardIcon.vue";
import EyeIcon from "../icons/EyeIcon.vue";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import ChipIcon from "../icons/ChipIcon.vue";
import { isDesktop, isMobile } from "../global/helpers";
import { useStore } from "../global/store";

const store = useStore();
const router = useRouter();
const active = ref("");
const logoutModal = ref(false);

const update = () => {
  const routeName = String(router.currentRoute.value.name);

  if (routeName.startsWith("settings")) {
    active.value = routeName.replace("settings", "").toLowerCase();
  } else {
    if (!isMobile) {
      router.push("/settings/account");
    }
  }
};

watch(
  () => router.currentRoute.value,
  () => {
    update();
  },
);

update();

store.sideBarOpen = true;
</script>
