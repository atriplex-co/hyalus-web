<template>
  <div v-if="channel.type === ChannelType.SpaceCategory" class="space-y-1.5">
    <div class="flex items-center justify-between px-2 text-ctp-subtext0">
      <p class="text-xs font-bold uppercase">
        {{ channel.name }}
      </p>
      <div class="flex items-center space-x-2">
        <PlusIcon
          v-if="allowManageChannels"
          class="h-4 w-4 cursor-pointer transition hover:text-ctp-accent"
          @click="createModal = true"
        />
        <CogIcon
          v-if="allowManageChannels || allowManageRoles"
          class="h-4 w-4 cursor-pointer transition hover:text-ctp-accent"
          @click="manageModal = true"
        />
      </div>
    </div>
    <div class="space-y-0.5">
      <SideBarSpaceChannel
        v-for="child in children"
        :key="child.id"
        :space="space"
        :channel="child"
      />
    </div>
  </div>
  <div
    v-if="channel.type !== ChannelType.SpaceCategory"
    class="group flex cursor-pointer items-center justify-between rounded-md p-1.5 text-sm transition hover:bg-ctp-surface0/75 hover:text-ctp-text"
    :class="{
      'text-ctp-subtext0': route.path !== `/channels/${channel.id}`,
      'bg-ctp-surface0/50': route.path === `/channels/${channel.id}`,
    }"
    @click="click($event)"
  >
    <div class="flex items-center space-x-1.5">
      <div class="h-5 w-5 text-ctp-overlay0">
        <HashtagIcon v-if="channel.type === ChannelType.SpaceText" />
        <SpeakerWaveIcon v-if="channel.type === ChannelType.SpaceVoice" />
      </div>
      <p>{{ channel.name }}</p>
    </div>
    <div class="items-center opacity-0 transition group-hover:opacity-100">
      <CogIcon
        v-if="allowManageChannels || allowManageRoles"
        class="h-4 w-4 cursor-pointer transition hover:text-ctp-accent"
        @click.stop="manageModal = true"
      />
    </div>
  </div>
  <div class="space-y-0.5 pb-1.5 pl-4" v-if="voiceUsers.length">
    <SideBarSpaceVoiceUser
      v-for="voiceUser in voiceUsers"
      :key="voiceUser.member.id"
      :member="voiceUser.member"
      :flags="voiceUser.flags"
      :space="space"
      :channel="channel"
    />
  </div>
  <SpaceChannelManage
    v-if="manageModal"
    :space="space"
    :channel="channel"
    @close="manageModal = false"
  />
  <SpaceChannelCreateModal
    v-if="createModal"
    :space="space"
    :parent-id="channel.id"
    @close="createModal = false"
  />
</template>

<script lang="ts" setup>
import { CogIcon, HashtagIcon, PlusIcon, SpeakerWaveIcon } from "@heroicons/vue/20/solid";
import {
  CallStreamType,
  ChannelType,
  SpacePermission,
  VoiceStateFlags,
} from "@/../../hyalus-server/src/types";
import { computed, type PropType, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { checkSpacePermissions } from "@/global/helpers";
import { useStore } from "@/global/store";
import type { IChannel, ISelf, ISpace, ISpaceMember } from "@/global/types";
import SpaceChannelCreateModal from "./SpaceChannelCreateModal.vue";
import SpaceChannelManage from "./SpaceChannelManage.vue";
import SideBarSpaceVoiceUser from "./SideBarSpaceVoiceUser.vue";

const router = useRouter();
const route = useRoute();
const store = useStore();
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
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
});
const manageModal = ref(false);
const createModal = ref(false);

const children = computed(() => {
  if (props.channel.type !== ChannelType.SpaceCategory) {
    return [];
  }
  return Array.from(store.channels)
    .filter(
      (channel) =>
        channel.spaceId === props.channel.spaceId &&
        channel.parentId === props.channel.id &&
        checkSpacePermissions({
          permissions: SpacePermission.ViewChannels,
          spaceId: props.space.id,
          channelId: channel.id,
        }),
    )
    .sort((a, b) => ((a.position || 0) > (b.position || 0) ? 1 : -1));
});

const allowManageChannels = computed(() =>
  checkSpacePermissions({
    permissions: SpacePermission.ManageChannels,
    spaceId: props.space.id,
    channelId: props.channel.id,
  }),
);

const allowManageRoles = computed(() =>
  checkSpacePermissions({
    permissions: SpacePermission.ManageRoles,
    spaceId: props.space.id,
    channelId: props.channel.id,
  }),
);

const click = async (e: MouseEvent) => {
  if (props.channel.type === ChannelType.SpaceVoice) {
    let join = false;

    if (!store.call) {
      join = true;
    }

    if (store.call && store.call.channelId === props.channel.id) {
      await router.push(`/channels/${props.channel.id}`);
    }

    if (store.call && store.call.channelId !== props.channel.id) {
      if (route.name === "channel" && route.params.channelId === props.channel.id) {
        join = true;
      } else {
        await router.push(`/channels/${props.channel.id}`);
      }
    }

    if (join) {
      await store.callStart(props.channel.id);
    }
    if (join && !e.shiftKey) {
      await store.callAddLocalStream({ type: CallStreamType.Audio, silent: true });
    }

    return;
  }

  router.push(`/channels/${props.channel.id}`);
};

const voiceUsers = computed(() => {
  const states = store.voiceStates.filter((state) => state.channelId === props.channel.id);
  const ret: {
    member: ISelf | ISpaceMember;
    flags: VoiceStateFlags;
  }[] = [];
  for (const state of states) {
    const member = props.space.members.find((member) => member.id === state.id);
    if (!member) {
      console.warn(`missing member for voice state: ${state.id}`);
      continue;
    }
    ret.push({
      member,
      flags: state.flags,
    });
  }
  if (store.call && store.call.channelId === props.channel.id) {
    ret.push({
      member: store.self!,
      flags: store.call.flags,
    });
  }
  ret.sort((a, b) => (a.member.name > b.member.name ? 1 : -1));
  return ret;
});
</script>
