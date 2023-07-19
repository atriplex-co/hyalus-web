<template>
  <div v-if="store.self">
    <p class="text-2xl">Sessions</p>
    <div class="mt-8 space-y-6">
      <div class="space-y-4">
        <p class="text-sm font-semibold text-gray-400">This Device</p>
        <SessionItem :session="sessions[0]" />
      </div>
      <div class="space-y-4">
        <p class="text-sm font-semibold text-gray-400">Other Devices</p>
        <SessionItem
          v-for="session in sessions.slice(1)"
          :key="session.id"
          :session="session"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useStore } from "../global/store";
import SessionItem from "./SessionItem.vue";

const store = useStore();

const sessions = computed(() =>
  [...store.sessions].sort((a, b) =>
    a.id === store.self?.currentSessionId
      ? -1
      : a.updatedAt < b.updatedAt
      ? 1
      : -1,
  ),
);
</script>
