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
        <div class="space-x-0.5 flex">
          <PinIcon v-if="isPinned" class="w-[16px] text-ctp-overlay0" />
          <BellSlashIcon v-if="isMuted" class="w-[16px] text-ctp-overlay0" />
        </div>
      </div>
      <p v-if="description" class="truncate text-xs">
        {{ description }}
      </p>
      <div v-if="status" v-html="status" class="min-w-0 text-xs truncate" id="status"></div>
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
import { statusFormatter } from "@/global/config";
import { BellSlashIcon, UserGroupIcon } from "@heroicons/vue/16/solid";
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

const status = computed(() => {
  if (props.channel.type === ChannelType.DM) {
    const status = getStatus(props.channel.members[0].id).statusText;
    if (!status) {
      return "";
    }
    return statusFormatter.render(status);
  }

  return "";
});

const description = computed(() => {
  if (props.channel.type === ChannelType.Group) {
    return `${props.channel.members.length + 1} members`;
  }

  return "";
});

const menu: Ref<typeof ChannelContextMenu | null> = ref(null);

const isPinned = computed(() => {
  return store.self!.userConfig.pinnedChannelIds.includes(props.channel.id);
});

const isMuted = computed(() => {
  return store.self!.userConfig.mutedChannelIds.includes(props.channel.id);
});
</script>

<style scoped>
#status p {
  @apply truncate;
}
</style>
