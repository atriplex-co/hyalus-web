<template>
  <div class="flex-1 overflow-auto">
    <div class="flex h-14 items-center px-4 text-lg font-bold">
      <router-link
        v-if="isMobile"
        class="ml-2 mr-4 h-8 w-8 rounded-full bg-gray-600 p-1.5 text-gray-300 transition hover:bg-gray-500"
        to="/settings"
      >
        <ArrowLeftIcon />
      </router-link>
      <p>Desktop Integration</p>
    </div>
    <div
      class="dark:divide-dark-800 dark:border-dark-800 divide-y divide-gray-100 border-t border-b border-gray-100"
    >
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">Open at Login</p>
        <InputBoolean v-model="startupEnabled" />
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">Open Minimized</p>
        <InputBoolean v-model="startupMinimized" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InputBoolean from "../components/InputBoolean.vue";
import { ref, onMounted, watch } from "vue";
import ArrowLeftIcon from "../icons/ArrowLeftIcon.vue";
import { isMobile } from "../global/helpers";
import { useStore } from "../global/store";

const store = useStore();
const startupEnabled = ref(false);
const startupMinimized = ref(false);

document.title = "Hyalus \u2022 Desktop Integration";

onMounted(async () => {
  if (!window.HyalusDesktop) {
    return;
  }

  const startupSettings = await window.HyalusDesktop.getStartupSettings();

  startupEnabled.value = startupSettings.enabled;
  startupMinimized.value = startupSettings.minimized;
});

store.sideBarOpen = false;

watch(
  () => [startupEnabled.value, startupMinimized.value],
  async () => {
    await window.HyalusDesktop?.setStartupSettings({
      enabled: startupEnabled.value,
      minimized: startupMinimized.value,
    });
  },
);
</script>
