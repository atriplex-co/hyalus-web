<template>
  <div>
    <p class="text-2xl">Members</p>
    <div class="mt-8 space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold text-ctp-subtext0">
          {{ space.members.length }} Member{{ space.members.length === 1 ? "" : "s" }}
        </p>
        <input
          type="text"
          class="ring-ctp-accent w-[50%] resize-none rounded-md border bg-ctp-crust border-ctp-base px-2 py-1 text-ctp-subtext0 shadow-sm transition placeholder:text-ctp-overlay0 focus:outline-none focus:ring-2"
          placeholder="Search Members"
        />
      </div>
      <div
        class="divide-ctp-surface0/50 border-ctp-surface0/50 divide-y border-t"
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
import type { PropType } from "vue";
import type { ISpace } from "../global/types";
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
