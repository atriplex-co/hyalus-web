<template>
  <div>
    <p class="text-2xl">Streamer Mode</p>
    <div class="mt-8 divide-y divide-ctp-surface0/50 border-b border-t border-ctp-surface0/50">
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Enable Streamer Mode</p>
        <InputBoolean v-model="streamerModeEnabled" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Enable on OBS/XSplit Detection</p>
        <InputBoolean v-model="streamerModeAuto" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Prevent Screen Capture</p>
        <InputBoolean v-model="streamerModeHideWindow" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Hide Account Info</p>
        <InputBoolean v-model="streamerModeHideAccount" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Hide Invite Links</p>
        <InputBoolean v-model="streamerModeHideInviteLinks" />
      </div>
      <!-- TODO: implement hiding invite links in streamer mode -->
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Disable App Notifications</p>
        <InputBoolean v-model="streamerModeDisableNotifications" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Disable App Sounds</p>
        <InputBoolean v-model="streamerModeDisableSounds" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { configToComputed } from "@/global/helpers";
import InputBoolean from "@/components/InputBoolean.vue";

const streamerModeEnabled = configToComputed<boolean>("streamerModeEnabled");
const streamerModeAuto = configToComputed<boolean>("streamerModeAuto");
const streamerModeHideWindow = configToComputed<boolean>("streamerModeHideWindow");
const streamerModeHideAccount = configToComputed<boolean>("streamerModeHideAccount");
const streamerModeHideInviteLinks = configToComputed<boolean>("streamerModeHideInviteLinks");
const streamerModeDisableNotifications = configToComputed<boolean>(
  "streamerModeDisableNotifications",
);
const streamerModeDisableSounds = configToComputed<boolean>("streamerModeDisableSounds");
</script>
