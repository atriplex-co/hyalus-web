<template>
  <div>
    <p class="text-2xl">Desktop App</p>
    <div class="divide-y divide-ctp-surface0/50 border-t border-b border-ctp-surface0/50 mt-8">
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Open at Login</p>
        <InputBoolean v-model="startupEnabled" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Open Minimized</p>
        <InputBoolean v-model="startupMinimized" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InputBoolean from "../components/InputBoolean.vue";
import { ref, onMounted, watch } from "vue";

const startupEnabled = ref(false);
const startupMinimized = ref(false);

onMounted(async () => {
  if (!window.HyalusDesktop) {
    return;
  }

  const startupSettings = await window.HyalusDesktop.getStartupSettings();

  startupEnabled.value = startupSettings.enabled;
  startupMinimized.value = startupSettings.minimized;
});

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
