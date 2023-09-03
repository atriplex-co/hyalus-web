<template>
  <router-link
    class="flex h-12 w-full cursor-pointer items-center space-x-3 rounded-md p-1.5 transition hover:bg-ctp-base"
    :class="{
      'bg-ctp-base': selected,
    }"
    :to="`/channels/${channel.id}`"
  >
    <div class="h-8 w-8">
      <UserAvatar
        v-if="avatar || channel.type === ChannelType.DM"
        :id="channel.type === ChannelType.DM ? channel.members[0].id : undefined"
        :avatar="avatar"
        :allow-status="true"
        :allow-animate="true"
        class="h-full w-full"
      />
      <UserGroupIcon
        v-if="channel.type === ChannelType.Group && !avatar"
        class="h-8 w-8 rounded-full bg-ctp-surface0 p-2"
      />
    </div>
    <div
      class="min-w-0 flex-1 transition"
      :class="{
        'text-ctp-subtext0 hover:text-ctp-text': !selected && !channelState.mentionCount,
        'text-ctp-text': selected || channelState.mentionCount,
      }"
    >
      <p
        class="truncate text-sm"
        :class="{
          'font-medium': !channelState.mentionCount,
          'font-bold': channelState.mentionCount,
        }"
      >
        {{ name }}
      </p>
      <p v-if="description" class="truncate text-xs">
        {{ description }}
      </p>
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import UserAvatar from "./UserAvatar.vue";
import { computed, type PropType } from "vue";
import type { IChannel } from "@/global/types";
import { useRoute } from "vue-router";
import { ChannelType } from "@/../../hyalus-server/src/types";
import { getChannelState, getStatus } from "@/global/helpers";
import { UserGroupIcon } from "@heroicons/vue/20/solid";

const props = defineProps({
  channel: {
    type: Object as PropType<IChannel>,
    default: null,
  },
});

const selected = computed(() => {
  const route = useRoute();
  return route.name === "channel" && route.params.channelId === props.channel.id;
});

const name = computed(() => {
  if (!props.channel) {
    return "Unknown";
  }

  if (props.channel.type === ChannelType.DM && props.channel.members.length) {
    return props.channel.members[0].name;
  }

  return props.channel.name;
});

const avatar = computed(() => {
  if (!props.channel) {
    return "Unknown";
  }

  if (props.channel.type === ChannelType.DM && props.channel.members.length) {
    return props.channel.members[0].avatar;
  }

  return props.channel.avatar;
});

const channelState = computed(() => {
  return getChannelState(props.channel);
});

const description = computed(() => {
  if (props.channel.type === ChannelType.Group) {
    return `${props.channel.members.length + 1} members`;
  }

  if (props.channel.type === ChannelType.DM) {
    return getStatus(props.channel.members[0].id).statusText;
  }

  return "";
});
</script>
