<template>
  <div>
    <p class="text-2xl">Members</p>
    <div class="mt-8 space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold text-gray-400">
          {{ space.members.length }} Member{{
            space.members.length === 1 ? "" : "s"
          }}
        </p>
        <input
          type="text"
          class="ring-primary-500 dark:border-dark-500 w-[50%] resize-none rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-gray-600 shadow-sm transition placeholder:text-gray-600 focus:outline-none focus:ring dark:bg-gray-900 dark:text-gray-400"
          placeholder="Search Members"
        />
      </div>
      <div
        class="divide-dark-500 border-dark-500 divide-y border-t"
        :class="{
          'border-b': space.members.length,
        }"
      >
        <SpaceMemberManageItem
          v-for="member in space.members"
          :key="member.id"
          :space="space"
          :member="member"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from "vue";
import { ISpace } from "../global/types";
import SpaceMemberManageItem from "./SpaceMemberManageItem.vue";

defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
</script>
