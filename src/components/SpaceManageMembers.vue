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
          class="w-[50%] resize-none rounded-md border border-ctp-base bg-ctp-crust px-2 py-1 text-ctp-subtext0 shadow-sm ring-ctp-accent transition placeholder:text-ctp-overlay0 focus:outline-none focus:ring-2"
          placeholder="Search Members"
          v-model="search"
        />
      </div>
      <div
        class="divide-y divide-ctp-surface0/50 border-t border-ctp-surface0/50"
        :class="{
          'border-b': members.length,
        }"
      >
        <SpaceMemberManageItem
          v-for="member in members"
          :key="member.id"
          :space="space"
          :member="member"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type PropType, ref, computed } from "vue";
import type { ISpace } from "@/global/types";
import SpaceMemberManageItem from "./SpaceMemberManageItem.vue";

const search = ref("");
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});

const members = computed(() => {
  if (search.value) {
    return props.space.members.filter(
      (member) =>
        member.username.toLowerCase().includes(search.value.toLowerCase()) ||
        member.name.toLowerCase().includes(search.value.toLowerCase()),
    );
  }

  return props.space.members;
});
</script>
