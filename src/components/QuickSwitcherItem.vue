<template>
  <div
    class="flex items-center justify-between rounded-md px-2 text-sm"
    :class="{
      'bg-ctp-surface0/50': selected,
    }"
  >
    <div class="flex h-8 items-center space-x-2">
      <UserAvatar
        class="h-5 w-5"
        :avatar="channel.members[0].avatar"
        v-if="channel.type === ChannelType.DM"
      />
      <UserAvatar
        class="h-5 w-5"
        :avatar="channel.members[0].avatar"
        v-if="channel.type !== ChannelType.DM && channel.avatar"
      />
      <div
        v-if="channel.type !== ChannelType.DM && !channel.avatar && channel.name"
        class="flex h-5 w-5 items-center justify-center rounded-full bg-ctp-surface0 text-xs"
      >
        <p>{{ channel.name.slice(0, 1) }}</p>
      </div>
      <div>
        <p v-if="channel.type === ChannelType.DM">
          {{ channel.members[0].name }}
        </p>
        <p v-if="channel.name">{{ channel.name }}</p>
      </div>
    </div>
    <div class="text-ctp-subtext0">
      <p v-if="channel.type === ChannelType.Group">{{ channel.members.length + 1 }} Members</p>
      <p v-if="space">{{ space.name }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IChannel, ISpace } from "@/global/types";
import type { PropType } from "vue";
import { ChannelType } from "@/../../hyalus-server/src/types";
import UserAvatar from "./UserAvatar.vue";

defineProps({
  selected: {
    type: Boolean,
    required: true,
  },
  channel: {
    type: Object as PropType<IChannel>,
    required: true,
  },
  space: {
    type: Object as PropType<ISpace>,
  },
});
</script>
