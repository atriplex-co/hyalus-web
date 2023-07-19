<template>
  <div
    class="flex h-screen min-h-0 select-none flex-col"
    :class="{
      dark: store.config.colorMode === ColorMode.Dark,
      'oled dark': store.config.colorMode === ColorMode.DarkOLED,
      'accent-red': store.config.colorTheme === ColorTheme.Red,
      'accent-orange': store.config.colorTheme === ColorTheme.Orange,
      'accent-amber': store.config.colorTheme === ColorTheme.Amber,
      'accent-yellow': store.config.colorTheme === ColorTheme.Yellow,
      'accent-lime': store.config.colorTheme === ColorTheme.Lime,
      'accent-green': store.config.colorTheme === ColorTheme.Green,
      'accent-emerald': store.config.colorTheme === ColorTheme.Emerald,
      'accent-teal': store.config.colorTheme === ColorTheme.Teal,
      'accent-cyan': store.config.colorTheme === ColorTheme.Cyan,
      'accent-sky': store.config.colorTheme === ColorTheme.Sky,
      'accent-blue': store.config.colorTheme === ColorTheme.Blue,
      'accent-indigo': store.config.colorTheme === ColorTheme.Indigo,
      'accent-violet': store.config.colorTheme === ColorTheme.Violet,
      'accent-purple': store.config.colorTheme === ColorTheme.Purple,
      'accent-fuchsia': store.config.colorTheme === ColorTheme.Fuchsia,
      'accent-pink': store.config.colorTheme === ColorTheme.Pink,
      'accent-rose': store.config.colorTheme === ColorTheme.Rose,
      'grayscale filter': store.config.grayscale,
    }"
  >
    <div
      class="dark:bg-dark-700 flex h-full min-h-0 flex-col bg-white text-gray-800 dark:text-white"
    >
      <div id="app-inner"></div>
      <DesktopTitlebar v-if="isDesktop" />
      <router-view v-if="!inApp && !desktopUpdating" />
      <div
        v-if="inApp && store.ready && !desktopUpdating"
        class="flex h-full min-h-0 flex-1 flex-col"
      >
        <EmailVerifyBanner v-if="banner === 'emailVerify'" />
        <AppDownloadBanner v-if="banner === 'appDownload'" />
        <div class="flex min-h-0 flex-1">
          <SideBar v-if="showSideBar" />
          <router-view v-slot="{ Component }">
            <transition
              enter-active-class="transition transform duration-75 ease-out"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              mode="out-in"
            >
              <component :is="Component" :key="$route.path" class="flex-1" />
            </transition>
          </router-view>
        </div>
        <UserInviteModal v-if="!!store.invite" />
        <WelcomeModal v-if="welcomeModal" @close="welcomeModal = false" />
        <SettingsModal v-if="settingsModal" @close="settingsModal = false" />
      </div>
      <LoadingView v-show="(inApp && !store.ready) || desktopUpdating" />
      <UpdateRequiredView v-show="store.updateRequired" />
    </div>
    <!-- DON'T REMOVE THIS! -->
    <!-- this is here to keep some random css classes from being puregd. -->
    <p class="hidden font-bold underline"></p>
  </div>
</template>

<script lang="ts" setup>
import DesktopTitlebar from "./components/DesktopTitlebar.vue";
import LoadingView from "./views/LoadingView.vue";
import UpdateRequiredView from "./views/UpdateRequiredView.vue";
import SideBar from "./components/SideBar.vue";
import { computed, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ColorTheme, ColorMode } from "@/../hyalus-server/src/types";
import UserInviteModal from "./components/UserInviteModal.vue";
import { isDesktop } from "./global/helpers";
import { useStore } from "./global/store";
import AppDownloadBanner from "./components/AppDownloadBanner.vue";
import WelcomeModal from "./components/WelcomeModal.vue";
import EmailVerifyBanner from "./components/EmailVerifyBanner.vue";
import SettingsModal from "./components/SettingsModal.vue";

const store = useStore();
const router = useRouter();

const welcomeModal = ref(false);
const settingsModal = ref(false);
const desktopUpdating = ref(isDesktop);

const inAppRoutes = [
  "app",
  "channel",
  "call",
  "settings",
  "friends",
  "sessions",
  "settingsAccount",
  "settingsSessions",
  "settingsAppearance",
  "settingsKeyboard",
  "settingsMedia",
  "settingsNotifications",
  "settingsUpdate",
  "settingsDesktop",
];

const route = useRoute();

const inApp = computed(() => {
  return inAppRoutes.includes(route.name as string);
});

const showSideBar = computed(() => {
  if (!inAppRoutes.includes(route.name as string)) {
    return false;
  }

  return true;
});

const banner = computed(() => {
  if (store.self && !store.self.emailVerified) {
    return "emailVerify";
  }

  if (!isDesktop && store.config.appDownloadBanner) {
    return "appDownload";
  }

  return "";
});

const fontScaleEl = document.createElement("style");
document.body.appendChild(fontScaleEl);

const updateFontScale = () => {
  fontScaleEl.innerText = `:root{font-size:${
    (store.config.fontScale / 100) * 16
  }px}`;
};

updateFontScale();

watch(
  () => store.config.fontScale,
  () => {
    updateFontScale();
  },
);

watch(
  () => store.self,
  () => {
    if (store.self && !store.self.name) {
      welcomeModal.value = true;
    }
  },
);

onMounted(async () => {
  if (window.HyalusDesktop && window.HyalusDesktop.checkForUpdates) {
    await window.HyalusDesktop.checkForUpdates();
    desktopUpdating.value = false;
  }
});

addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.ctrlKey && e.altKey && e.key === ",") {
    router.push("/settings/account");
    return;
  }

  if (e.ctrlKey && e.key === ",") {
    settingsModal.value = true;
    return;
  }
});
</script>
