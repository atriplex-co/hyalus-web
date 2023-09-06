<template>
  <SplitModal @close="$emit('close')">
    <template #left>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': page === SettingsPage.Account,
        }"
        @click="page = SettingsPage.Account"
      >
        <UserIcon class="h-5 w-5" />
        <p>Account</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': page === SettingsPage.Profile,
        }"
        @click="page = SettingsPage.Profile"
      >
        <IdentificationIcon class="h-5 w-5" />
        <p>Profile</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': page === SettingsPage.Sessions,
        }"
        @click="page = SettingsPage.Sessions"
      >
        <ComputerDesktopIcon class="h-5 w-5" />
        <p>Sessions</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': page === SettingsPage.Appearance,
        }"
        @click="page = SettingsPage.Appearance"
      >
        <EyeIcon class="h-5 w-5" />
        <p>Appearance</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': page === SettingsPage.Notifications,
        }"
        @click="page = SettingsPage.Notifications"
      >
        <BellIcon class="h-5 w-5" />
        <p>Notifications</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': page === SettingsPage.AudioVideo,
        }"
        @click="page = SettingsPage.AudioVideo"
      >
        <VideoCameraIcon class="h-5 w-5" />
        <p>Audio &amp; Video</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': page === SettingsPage.Keybinds,
        }"
        @click="page = SettingsPage.Keybinds"
      >
        <KeyboardIcon class="h-5 w-5" />
        <p>Keybinds</p>
      </div>
      <!-- TODO: add screen for creating and managing bots -->
      <!-- <div
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': page === SettingsPage.Development,
        }"
        @click="page = SettingsPage.Development"
      >
        <WrenchScrewdriverIcon class="h-5 w-5" />
        <p>Development</p>
      </div> -->
      <div
        v-if="isDesktop"
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': page === SettingsPage.Desktop,
        }"
        @click="page = SettingsPage.Desktop"
      >
        <CpuChipIcon class="h-5 w-5" />
        <p>Desktop App</p>
      </div>
      <div
        v-if="isDesktop"
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': page === SettingsPage.StreamerMode,
        }"
        @click="page = SettingsPage.StreamerMode"
      >
        <TvIcon class="h-5 w-5" />
        <p>Streamer Mode</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': page === SettingsPage.Experiments,
        }"
        @click="page = SettingsPage.Experiments"
      >
        <BeakerIcon class="h-5 w-5" />
        <p>Experiments</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': page === SettingsPage.Changelog,
        }"
        @click="page = SettingsPage.Changelog"
      >
        <ArrowPathIcon class="h-5 w-5" />
        <p>Changelog</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        @click="logoutModal = true"
      >
        <ArrowLeftOnRectangleIcon class="h-5 w-5" />
        <p>Log Out</p>
      </div>
    </template>
    <template #right>
      <SettingsModalAccount v-if="page === SettingsPage.Account" @activate="page = $event" />
      <SettingsModalSessions v-if="page === SettingsPage.Sessions" />
      <SettingsModalAppearance v-if="page === SettingsPage.Appearance" />
      <SettingsModalNotifications v-if="page === SettingsPage.Notifications" />
      <SettingsModalAudioVideo v-if="page === SettingsPage.AudioVideo" />
      <SettingsModalKeybinds v-if="page === SettingsPage.Keybinds" />
      <SettingsModalChangelog v-if="page === SettingsPage.Changelog" />
      <SettingsModalDesktop v-if="page === SettingsPage.Desktop" />
      <SettingsModalProfile v-if="page === SettingsPage.Profile" />
      <SettingsModalStreamerMode v-if="page === SettingsPage.StreamerMode" />
      <SettingsModalExperiments v-if="page === SettingsPage.Experiments" />
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
  TvIcon,
  UserIcon,
  VideoCameraIcon,
  BeakerIcon,
} from "@heroicons/vue/24/solid";
import { ref, type PropType } from "vue";
import { isDesktop } from "@/global/helpers";
import KeyboardIcon from "@/icons/KeyboardIcon.vue";
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
import SettingsModalStreamerMode from "./SettingsModalStreamerMode.vue";
import SplitModal from "./SplitModal.vue";
import { SettingsPage } from "@/global/types";
import SettingsModalExperiments from "./SettingsModalExperiments.vue";

const logoutModal = ref(false);

defineEmits(["close"]);
const props = defineProps({
  openTo: {
    type: Number as PropType<SettingsPage>,
    default: SettingsPage.Account,
  },
});

// eslint-disable-next-line vue/no-setup-props-destructure
const page = ref(props.openTo);
</script>

<style scoped>
#main::-webkit-scrollbar {
  display: none;
}
</style>
