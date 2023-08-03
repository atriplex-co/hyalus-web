<template>
  <div
    class="flex h-screen min-h-0 select-none flex-col"
    :class="{
      'grayscale filter': store.config.grayscale,
      'hyalus-mode-light': store.config.colorMode === ColorMode.Light,
      'hyalus-mode-dark': store.config.colorMode === ColorMode.Dark,
      'hyalus-mode-oled': store.config.colorMode === ColorMode.DarkOLED,
      'hyalus-accent-dark-rosewater':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Rosewater,
      'hyalus-accent-dark-flamingo':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Flamingo,
      'hyalus-accent-dark-pink':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Pink,
      'hyalus-accent-dark-mauve':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Mauve,
      'hyalus-accent-dark-red':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Red,
      'hyalus-accent-dark-maroon':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Maroon,
      'hyalus-accent-dark-peach':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Peach,
      'hyalus-accent-dark-yellow':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Yellow,
      'hyalus-accent-dark-green':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Green,
      'hyalus-accent-dark-teal':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Teal,
      'hyalus-accent-dark-sky':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Sky,
      'hyalus-accent-dark-sapphire':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Sapphire,
      'hyalus-accent-dark-blue':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Blue,
      'hyalus-accent-dark-lavender':
        (store.config.colorMode === ColorMode.Dark ||
          store.config.colorMode === ColorMode.DarkOLED) &&
        store.config.colorTheme === ColorTheme.Lavender,
      'hyalus-accent-light-rosewater':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Rosewater,
      'hyalus-accent-light-flamingo':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Flamingo,
      'hyalus-accent-light-pink':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Pink,
      'hyalus-accent-light-mauve':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Mauve,
      'hyalus-accent-light-red':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Red,
      'hyalus-accent-light-maroon':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Maroon,
      'hyalus-accent-light-peach':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Peach,
      'hyalus-accent-light-yellow':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Yellow,
      'hyalus-accent-light-green':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Green,
      'hyalus-accent-light-teal':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Teal,
      'hyalus-accent-light-sky':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Sky,
      'hyalus-accent-light-sapphire':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Sapphire,
      'hyalus-accent-light-blue':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Blue,
      'hyalus-accent-light-lavender':
        store.config.colorMode === ColorMode.Light &&
        store.config.colorTheme === ColorTheme.Lavender,
    }"
  >
    <div class="bg-ctp-base flex h-full min-h-0 flex-col text-ctp-text">
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
    <p class="hidden font-medium underline"></p>
  </div>
</template>

<script lang="ts" setup>
import DesktopTitlebar from "./components/DesktopTitlebar.vue";
import LoadingView from "./views/LoadingView.vue";
import UpdateRequiredView from "./views/UpdateRequiredView.vue";
import SideBar from "./components/SideBar.vue";
import { computed, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import UserInviteModal from "./components/UserInviteModal.vue";
import { isDesktop, isMobile } from "./global/helpers";
import { useStore } from "./global/store";
import AppDownloadBanner from "./components/AppDownloadBanner.vue";
import WelcomeModal from "./components/WelcomeModal.vue";
import EmailVerifyBanner from "./components/EmailVerifyBanner.vue";
import SettingsModal from "./components/SettingsModal.vue";
import { ColorMode, ColorTheme } from "hyalus-server/src/types";
// import { ColorTheme, ColorMode } from "@/../hyalus-server/src/types";

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

  if (isMobile && !store.sideBarOpen) {
    return false;
  }

  return true;
});

const banner = computed(() => {
  if (store.self && !store.self.emailVerified) {
    return "emailVerify";
  }

  if (!isDesktop) {
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

<style scoped>
.hyalus-mode-light {
  --ctp-text: 76 79 105;
  --ctp-subtext1: 92 95 119;
  --ctp-subtext0: 108 111 133;
  --ctp-overlay2: 124 127 147;
  --ctp-overlay1: 140 143 161;
  --ctp-overlay0: 156 160 176;
  --ctp-surface2: 172 176 190;
  --ctp-surface1: 188 192 204;
  --ctp-surface0: 204 208 218;
  --ctp-base: 239 241 245;
  --ctp-mantle: 230 233 239;
  --ctp-crust: 220 224 232;
  --ctp-rosewater: 220 138 120;
  --ctp-flamingo: 221 120 120;
  --ctp-pink: 234 118 203;
  --ctp-mauve: 136 57 239;
  --ctp-red: 210 15 57;
  --ctp-maroon: 230 69 83;
  --ctp-peach: 254 100 11;
  --ctp-yellow: 223 142 29;
  --ctp-green: 64 160 43;
  --ctp-teal: 23 146 153;
  --ctp-sky: 4 165 229;
  --ctp-sapphire: 32 159 181;
  --ctp-blue: 30 102 245;
  --ctp-lavender: 114 135 253;
}
.hyalus-mode-dark {
  --ctp-text: 205 214 244;
  --ctp-subtext1: 186 194 222;
  --ctp-subtext0: 166 173 200;
  --ctp-overlay2: 147 153 178;
  --ctp-overlay1: 127 132 156;
  --ctp-overlay0: 108 112 134;
  --ctp-surface2: 88 91 112;
  --ctp-surface1: 69 71 90;
  --ctp-surface0: 49 50 68;
  --ctp-base: 30 30 46;
  --ctp-mantle: 24 24 37;
  --ctp-crust: 17 17 27;
  --ctp-rosewater: 245 224 220;
  --ctp-flamingo: 242 205 205;
  --ctp-pink: 245 194 231;
  --ctp-mauve: 203 166 247;
  --ctp-red: 243 139 168;
  --ctp-maroon: 235 160 172;
  --ctp-peach: 250 179 135;
  --ctp-yellow: 249 226 175;
  --ctp-green: 166 227 161;
  --ctp-teal: 148 226 213;
  --ctp-sky: 137 220 235;
  --ctp-sapphire: 116 199 236;
  --ctp-blue: 137 180 250;
  --ctp-lavender: 180 190 254;
}
.hyalus-mode-oled {
  --ctp-text: 238 238 238;
  --ctp-subtext1: 194 194 194;
  --ctp-subtext0: 200 200 200;
  --ctp-overlay2: 178 178 178;
  --ctp-overlay1: 156 156 156;
  --ctp-overlay0: 134 134 134;
  --ctp-surface2: 90 90 90;
  --ctp-surface1: 47 47 72;
  --ctp-surface0: 24 24 24;
  --ctp-base: 0 0 0;
  --ctp-mantle: 12 12 12;
  --ctp-crust: 18 18 18;
  --ctp-rosewater: 245 224 220;
  --ctp-flamingo: 242 205 205;
  --ctp-pink: 245 194 231;
  --ctp-mauve: 203 166 247;
  --ctp-red: 243 139 168;
  --ctp-maroon: 235 160 172;
  --ctp-peach: 250 179 135;
  --ctp-yellow: 249 226 175;
  --ctp-green: 166 227 161;
  --ctp-teal: 148 226 213;
  --ctp-sky: 137 220 235;
  --ctp-sapphire: 116 199 236;
  --ctp-blue: 137 180 250;
  --ctp-lavender: 180 190 254;
}

.hyalus-accent-dark-rosewater {
  --ctp-accent: 245 224 220;
}
.hyalus-accent-dark-flamingo {
  --ctp-accent: 242 205 205;
}
.hyalus-accent-dark-pink {
  --ctp-accent: 245 194 231;
}
.hyalus-accent-dark-mauve {
  --ctp-accent: 203 166 247;
}
.hyalus-accent-dark-red {
  --ctp-accent: 243 139 168;
}
.hyalus-accent-dark-maroon {
  --ctp-accent: 235 160 172;
}
.hyalus-accent-dark-peach {
  --ctp-accent: 250 179 135;
}
.hyalus-accent-dark-yellow {
  --ctp-accent: 249 226 175;
}
.hyalus-accent-dark-green {
  --ctp-accent: 166 227 161;
}
.hyalus-accent-dark-teal {
  --ctp-accent: 148 226 213;
}
.hyalus-accent-dark-sky {
  --ctp-accent: 137 220 235;
}
.hyalus-accent-dark-sapphire {
  --ctp-accent: 116 199 236;
}
.hyalus-accent-dark-blue {
  --ctp-accent: 137 180 250;
}
.hyalus-accent-dark-lavender {
  --ctp-accent: 180 190 254;
}

.hyalus-accent-light-rosewater {
  --ctp-accent: 220 138 120;
}
.hyalus-accent-light-flamingo {
  --ctp-accent: 221 120 120;
}
.hyalus-accent-light-pink {
  --ctp-accent: 234 118 203;
}
.hyalus-accent-light-mauve {
  --ctp-accent: 136 57 239;
}
.hyalus-accent-light-red {
  --ctp-accent: 210 15 57;
}
.hyalus-accent-light-maroon {
  --ctp-accent: 230 69 83;
}
.hyalus-accent-light-peach {
  --ctp-accent: 254 100 11;
}
.hyalus-accent-light-yellow {
  --ctp-accent: 223 142 29;
}
.hyalus-accent-light-green {
  --ctp-accent: 64 160 43;
}
.hyalus-accent-light-teal {
  --ctp-accent: 23 146 153;
}
.hyalus-accent-light-sky {
  --ctp-accent: 4 165 229;
}
.hyalus-accent-light-sapphire {
  --ctp-accent: 32 159 181;
}
.hyalus-accent-light-blue {
  --ctp-accent: 30 102 245;
}
.hyalus-accent-light-lavender {
  --ctp-accent: 114 135 253;
}
</style>
