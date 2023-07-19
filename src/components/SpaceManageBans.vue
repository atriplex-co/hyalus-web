<template>
  <div>
    <p class="text-2xl">Bans</p>
    <div class="mt-8 space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold text-gray-400">
          {{ bans.length }} Ban{{ bans.length === 1 ? "" : "s" }}
        </p>
        <input
          type="text"
          class="ring-primary-500 dark:border-dark-500 w-[50%] resize-none rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-gray-600 shadow-sm transition placeholder:text-gray-600 focus:outline-none focus:ring dark:bg-gray-900 dark:text-gray-400"
          placeholder="Search Bans"
        />
      </div>
      <div
        class="divide-dark-500 border-dark-500 divide-y border-t"
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
import { onMounted, PropType, ref } from "vue";
import { ISpace, ISpaceBan } from "../global/types";
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
