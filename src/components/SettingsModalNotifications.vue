<template>
  <div>
    <p class="text-2xl">Notifications</p>
    <div class="mt-8 divide-y divide-ctp-surface0/50 border-b border-t border-ctp-surface0/50">
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Sound Notifications</p>
        <InputBoolean v-model="notifySound" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">System Notifications</p>
        <InputBoolean v-model="notifySystem" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InputBoolean from "../components/InputBoolean.vue";
import { configToComputed } from "../global/helpers";

const notifySound = configToComputed<boolean>("notifySound");
const notifySystem = configToComputed<boolean>("notifySystem");
</script>
