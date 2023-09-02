<template>
  <div v-if="store.self">
    <p class="text-2xl">Sessions</p>
    <div v-if="sessions.length" class="mt-8 space-y-6">
      <div class="space-y-4">
        <p class="text-sm font-semibold">This Device</p>
        <SessionItem :session="sessions[0]" />
      </div>
      <div v-if="sessions.length > 1" class="space-y-4">
        <p class="text-sm font-semibold">Other Devices</p>
        <SessionItem v-for="session in sessions.slice(1)" :key="session.id" :session="session" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useStore } from "@/global/store";
import SessionItem from "./SessionItem.vue";
import type { ISession } from "@/global/types";
import axios from "axios";

const store = useStore();
const sessions = ref<ISession[]>([]);

onMounted(async () => {
  const {
    data,
  }: {
    data: {
      currentSessionId: string;
      sessions: {
        id: string;
        createdAt: number;
        updatedAt: number;
        ip: string;
        userAgent: string;
      }[];
    };
  } = await axios.get("/api/v1/sessions");
  sessions.value = data.sessions.map((session) => ({
    id: session.id,
    createdAt: new Date(session.createdAt),
    updatedAt: new Date(session.updatedAt),
    ip: session.ip,
    userAgent: session.userAgent,
  }));
  sessions.value.sort((a, b) => {
    if (a.id === data.currentSessionId) {
      return -1;
    }
    if (b.id === data.currentSessionId) {
      return 1;
    }
    return +a.updatedAt > +b.updatedAt ? -1 : 1;
  });
});
</script>
