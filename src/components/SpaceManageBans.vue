<template>
  <div>
    <p class="text-2xl">Bans</p>
    <div class="mt-8 space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold text-ctp-subtext0">
          {{ bans.length }} Ban{{ bans.length === 1 ? "" : "s" }}
        </p>
        <input
          type="text"
          class="ring-ctp-accent w-[50%] resize-none rounded-md border bg-ctp-crust border-ctp-base px-2 py-1 text-ctp-subtext0 shadow-sm transition placeholder:text-ctp-overlay0 focus:outline-none focus:ring-2"
          placeholder="Search Bans"
        />
      </div>
      <div
        class="divide-ctp-surface0/50 border-ctp-surface0/50 divide-y border-t"
        :class="{
          'border-b': bans.length,
        }"
      >
        <SpaceBanManageItem
          v-for="ban in bans"
          :key="ban.user.id"
          :space="space"
          :ban="ban"
          @remove="bans = bans.filter((ban2) => ban2 !== ban)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { onMounted, type PropType, ref } from "vue";
import type { ISpace, ISpaceBan } from "../global/types";
import SpaceBanManageItem from "./SpaceBanManageItem.vue";

const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
const bans = ref<ISpaceBan[]>([]);
const ready = ref(false);

onMounted(async () => {
  const { data } = await axios.get(`/api/v1/spaces/${props.space.id}/bans`);

  bans.value = data.map(
    (ban: {
      createdAt: number;
      reason: string;
      user: {
        id: string;
        name: string;
        username: string;
        avatar: string | null;
        flags: number;
      };
    }) => ({
      createdAt: new Date(ban.createdAt),
      reason: ban.reason,
      user: ban.user,
    }),
  );
  ready.value = true;
});
</script>
