<template>
  <router-link
    class="hover:bg-ctp-base flex h-12 w-full cursor-pointer items-center space-x-3 rounded-md p-1.5 transition"
    :class="{
      'bg-ctp-base': selected,
    }"
    :to="`/channels/${channel.id}`"
  >
    <div class="h-8 w-8">
      <UserAvatar
        v-if="avatar || channel.type === ChannelType.DM"
        :avatar="avatar"
        :status="status"
        class="h-full w-full"
      />
      <EmptyAvatar v-else :name="name" class="h-full w-full" />
    </div>
    <div
      class="min-w-0 flex-1 transition"
      :class="{
        'text-ctp-subtext0 hover:text-ctp-text':
          !selected && !channelState.mentionCount,
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
      <p v-if="description" class="text-xs">
        {{ description }}
      </p>
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import UserAvatar from "./UserAvatar.vue";
import EmptyAvatar from "./EmptyAvatar.vue";
import { computed, PropType } from "vue";
import { IChannel } from "../global/types";
import { useRoute } from "vue-router";
import { ChannelType, Status } from "@/../hyalus-server/src/types";
import { useStore } from "../global/store";
import { getChannelState } from "../global/helpers";

const store = useStore();
const props = defineProps({
  channel: {
    type: Object as PropType<IChannel>,
    default: null,
  },
});

const selected = computed(() => {
  const route = useRoute();
  return (
    route.name === "channel" && route.params.channelId === props.channel.id
  );
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

const status = computed(() => {
  if (props.channel.type === ChannelType.DM && props.channel.members.length) {
    const friend = store.friends.find(
      (friend) => friend.id === props.channel.members[0].id,
    );

    if (friend) {
      return friend.status;
    } else {
      return Status.Offline;
    }
  }

  return undefined;
});

const channelState = computed(() => {
  return getChannelState(props.channel);
});

const description = computed(() => {
  if (props.channel.type === ChannelType.Group) {
    return `${props.channel.members.length} member${
      props.channel.members.length > 1 ? "s" : ""
    }`;
  }

  return "";
});
</script>
