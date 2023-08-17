<template>
  <div class="w-full space-y-2">
    <p class="text-sm">Friends</p>
    <div class="border-ctp-base bg-ctp-crust rounded-md border shadow-sm">
      <input
        v-model="search"
        class="border-ctp-base ring-ctp-accent -mt-px w-full rounded-sm border bg-transparent px-4 py-2 transition focus:outline-none focus:ring-2 placeholder:text-ctp-overlay0 text-ctp-subtext0"
        type="text"
        placeholder="Search for friends"
      />
      <div class="h-48 overflow-auto">
        <div v-if="users.length" class="space-y-3 p-3">
          <div v-for="user in shownUsers" :key="user.id" class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <UserAvatar :avatar="user.avatar" class="h-8 w-8 rounded-full" />
              <div>
                <p class="font-bold">{{ user.name }}</p>
                <p class="text-xs text-ctp-subtext0">@{{ user.username }}</p>
              </div>
            </div>
            <CheckBox v-model="user.selected" />
          </div>
        </div>
        <div
          v-else
          class="flex h-full w-full flex-col items-center justify-center space-y-4 text-ctp-overlay0"
        >
          <GroupIcon class="h-8 w-8" />
          <p>No more friends to add</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CheckBox from "./CheckBox.vue";
import GroupIcon from "../icons/GroupIcon.vue";
import UserAvatar from "./UserAvatar.vue";
import { ref, computed, type PropType } from "vue";
import type { IChannelMember, IFriend } from "../global/types";

const props = defineProps({
  users: {
    type: Array as PropType<
      ((IFriend | IChannelMember) & {
        selected: boolean;
      })[]
    >,
    default() {
      //
    },
  },
});

const search = ref("");
const shownUsers = computed(() =>
  props.users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.value.toLowerCase()) ||
      u.username.toLowerCase().includes(search.value.toLowerCase()),
  ),
);
</script>
