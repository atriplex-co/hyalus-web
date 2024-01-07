<template>
  <router-link
    class="flex h-12 w-full cursor-pointer items-center space-x-3 rounded-md p-1.5 transition hover:bg-ctp-base"
    :class="{
      'bg-ctp-base': selected,
    }"
    :to="`/channels/${channel.id}`"
    @contextmenu="menu!.open($event)"
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
      <div class="flex items-center space-x-1.5">
        <p
          class="truncate text-sm"
          :class="{
            'font-medium': !channelState.mentionCount,
            'font-bold': channelState.mentionCount,
          }"
        >
          {{ name }}
        </p>
        <PinIcon v-if="isPinned" class="w-[14px] text-ctp-overlay0" />
      </div>
      <p v-if="description" class="truncate text-xs">
        {{ description }}
      </p>
    </div>
  </router-link>
  <ChannelContextMenu ref="menu" :channel="channel" />
</template>

<script lang="ts" setup>
import UserAvatar from "./UserAvatar.vue";
import { computed, type PropType, ref, type Ref } from "vue";
import type { IChannel } from "@/global/types";
import { useRoute } from "vue-router";
import { ChannelType } from "@/../../hyalus-server/src/types";
import { getChannelState, getStatus } from "@/global/helpers";
import { UserGroupIcon } from "@heroicons/vue/20/solid";
import ChannelContextMenu from "./ChannelContextMenu.vue";
import { useStore } from "@/global/store";
import PinIcon from "../icons/PinIcon.vue";

const store = useStore();
const route = useRoute();
const props = defineProps({
  channel: {
    type: Object as PropType<IChannel>,
    default: null,
  },
});

const selected = computed(() => {
  return route.name === "channel" && route.params.channelId === props.channel.id;
});

const name = computed(() => {
  if (!props.channel) {
    return "Unknown";
  }

  if (props.channel.type === ChannelType.DM && props.channel.members.length) {
    const nickname = store.self!.userConfig.userAliases[props.channel.members[0]!.id];
    if (nickname) {
      return nickname;
    }
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

const menu: Ref<typeof ChannelContextMenu | null> = ref(null);

const isPinned = computed(() => {
  return store.self!.userConfig.pinnedChannelIds.includes(props.channel.id);
});
</script>
