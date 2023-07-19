<template>
  <SplitModal @close="$emit('close')">
    <template #left>
      <div
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'account',
        }"
        @click="active = 'account'"
      >
        <UserIcon class="h-5 w-5" />
        <p>Account</p>
      </div>
      <div
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'profile',
        }"
        @click="active = 'profile'"
      >
        <IdentificationIcon class="h-5 w-5" />
        <p>Profile</p>
      </div>
      <div
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'sessions',
        }"
        @click="active = 'sessions'"
      >
        <ComputerDesktopIcon class="h-5 w-5" />
        <p>Sessions</p>
      </div>
      <div
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'appearance',
        }"
        @click="active = 'appearance'"
      >
        <EyeIcon class="h-5 w-5" />
        <p>Appearance</p>
      </div>
      <div
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'notifications',
        }"
        @click="active = 'notifications'"
      >
        <BellIcon class="h-5 w-5" />
        <p>Notifications</p>
      </div>
      <div
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'av',
        }"
        @click="active = 'av'"
      >
        <VideoCameraIcon class="h-5 w-5" />
        <p>Audio &amp; Video</p>
      </div>
      <div
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'keybinds',
        }"
        @click="active = 'keybinds'"
      >
        <KeyboardIcon class="h-5 w-5" />
        <p>Keybinds</p>
      </div>
      <div
        v-if="isDesktop"
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'desktop',
        }"
        @click="active = 'desktop'"
      >
        <CpuChipIcon class="h-5 w-5" />
        <p>Desktop App</p>
      </div>
      <div
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'changelog',
        }"
        @click="active = 'changelog'"
      >
        <ArrowPathIcon class="h-5 w-5" />
        <p>Changelog</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-black dark:hover:bg-gray-900 dark:hover:text-white"
        @click="logoutModal = true"
      >
        <ArrowLeftOnRectangleIcon class="h-5 w-5" />
        <p>Log Out</p>
      </div>
    </template>
    <template #right>
      <SettingsModalAccount
        v-if="active === 'account'"
        @activate="active = $event"
      />
      <SettingsModalSessions v-if="active === 'sessions'" />
      <SettingsModalAppearance v-if="active === 'appearance'" />
      <SettingsModalNotifications v-if="active === 'notifications'" />
      <SettingsModalAudioVideo v-if="active === 'av'" />
      <SettingsModalKeybinds v-if="active === 'keybinds'" />
      <SettingsModalChangelog v-if="active === 'changelog'" />
      <SettingsModalDesktop v-if="active === 'desktop'" />
      <SettingsModalProfile v-if="active === 'profile'" />
    </template>
  </SplitModal>
  <LogoutModal v-if="logoutModal" @close="logoutModal = false" />
</template>

<script lang="ts" setup>
import {
  ArrowLeftOnRectangleIcon,
  ArrowPathIcon,
  BellIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  EyeIcon,
  IdentificationIcon,
  UserIcon,
  VideoCameraIcon,
} from "@heroicons/vue/24/solid";
import { ref } from "vue";
import { isDesktop } from "../global/helpers";
import KeyboardIcon from "../icons/KeyboardIcon.vue";
import LogoutModal from "./LogoutModal.vue";
import SettingsModalAccount from "./SettingsModalAccount.vue";
import SettingsModalAppearance from "./SettingsModalAppearance.vue";
import SettingsModalSessions from "./SettingsModalSessions.vue";
import SettingsModalNotifications from "./SettingsModalNotifications.vue";
import SettingsModalAudioVideo from "./SettingsModalAudioVideo.vue";
import SettingsModalChangelog from "./SettingsModalChangelog.vue";
import SettingsModalKeybinds from "./SettingsModalKeybinds.vue";
import SettingsModalDesktop from "./SettingsModalDesktop.vue";
import SettingsModalProfile from "./SettingsModalProfile.vue";
import SplitModal from "./SplitModal.vue";

const active = ref("account");
const logoutModal = ref(false);

defineEmits(["close"]);
</script>

<style scoped>
#main::-webkit-scrollbar {
  display: none;
}
</style>
