<template>
  <div class="space-y-1">
    <p class="px-1.5 text-xs font-semibold uppercase text-gray-400">
      {{ name }} - {{ members.length }}
    </p>
    <div>
      <ChannelMember
        v-for="member in members"
        :key="member.id"
        :channel="channel"
        :member="member"
        :space="space"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import {
  IChannelMember,
  ISpaceMember,
  ISelf,
  IChannel,
  ISpace,
} from "../global/types";
import ChannelMember from "./ChannelMember.vue";

defineProps({
  name: {
    type: String,
    default: "",
  },
  members: {
    type: Array as PropType<(ISelf | IChannelMember | ISpaceMember)[]>,
    default() {
      //
    },
  },
  channel: {
    type: Object as PropType<IChannel>,
    default() {
      //
    },
  },
  space: {
    type: Object as PropType<ISpace | undefined>,
    default() {
      //
    },
  },
});
</script>
