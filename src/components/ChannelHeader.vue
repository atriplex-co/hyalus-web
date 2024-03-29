<template>
  <div v-if="store.self">
    <div class="flex h-14 w-full justify-between px-3">
      <div
        class="flex min-w-0 items-center space-x-2"
        :class="{
          'cursor-pointer': channel.type === ChannelType.DM,
          'w-full': channel.type === ChannelType.Group && channel.ownerId === store.self.id,
        }"
        @click="if (channel.type === ChannelType.DM) userModal = true;"
      >
        <router-link
          v-if="isMobile"
          class="ml-2 h-8 w-8 rounded-full bg-ctp-surface0 p-1.5 text-ctp-subtext0 transition hover:bg-ctp-surface0/50 hover:text-ctp-text"
          to="/app"
        >
          <ChevronLeftIcon />
        </router-link>
        <div
          class="h-8 w-8 rounded-full bg-ctp-surface0"
          :class="{
            'cursor-pointer':
              channel.type === ChannelType.Group && channel.ownerId === store.self.id,
          }"
          @click="setAvatar"
        >
          <UserAvatar
            v-if="channel.type === ChannelType.DM"
            :id="channel.members[0].id"
            :avatar="channel.members[0].avatar"
            :allow-status="true"
            :allow-animate="true"
            class="h-8 w-8"
          />
          <UserAvatar
            v-if="channel.type === ChannelType.Group && channel.avatar"
            :avatar="channel.avatar"
            :allow-animate="true"
            :allow-status="false"
          />
          <UserGroupIcon
            class="h-8 w-8 p-2"
            v-if="channel.type === ChannelType.Group && !channel.avatar"
          />
          <HashtagIcon class="h-8 w-8 p-2" v-if="channel.type === ChannelType.SpaceText" />
          <SpeakerWaveIcon class="h-8 w-8 p-2" v-if="channel.type === ChannelType.SpaceVoice" />
        </div>
        <div class="min-w-0 flex-1 font-semibold">
          <form
            v-if="channel.type === ChannelType.Group && channel.ownerId === store.self.id"
            @submit.prevent="setNameSubmit"
            @focusout="setNameFocusOut"
          >
            <input
              v-model="name"
              class="-ml-2 w-full max-w-full truncate rounded-lg border border-transparent bg-transparent px-2 py-1 transition hover:border-ctp-surface0/50 focus:border-ctp-surface0 focus:bg-ctp-mantle"
            />
          </form>
          <p v-else class="truncate">
            {{ name }}
          </p>
        </div>
      </div>
      <div class="flex items-center space-x-2 text-ctp-subtext0">
        <template v-if="!inVoice && voiceCapable">
          <div v-if="voiceUsers.length" class="mr-2 flex -space-x-3">
            <UserAvatar
              v-for="user in voiceUsersShown"
              :key="user.id"
              :avatar="user.avatar"
              class="h-7 w-7 rounded-full border border-gray-900"
            />
            <div
              v-if="voiceUsers.length !== voiceUsersShown.length"
              class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-900 bg-ctp-base text-xs font-bold text-white"
            >
              <p>+{{ voiceUsers.length - voiceUsersShown.length }}</p>
            </div>
          </div>
          <div
            class="h-8 w-8 cursor-pointer rounded-full bg-ctp-surface0 p-2 transition hover:text-ctp-text"
            @click="callStart"
          >
            <PhoneIcon />
          </div>
          <div
            class="h-8 w-8 cursor-pointer rounded-full bg-ctp-surface0 p-2 transition hover:text-ctp-text"
            @click="callStartWithVideo"
          >
            <VideoCameraIcon />
          </div>
        </template>
        <template v-if="!inVoice && !space">
          <div
            class="h-8 w-8 cursor-pointer rounded-full bg-ctp-surface0 p-2 transition hover:text-ctp-text"
            @click="inviteModal = true"
          >
            <UserPlusIcon />
          </div>
        </template>
        <div
          v-if="channel.type !== ChannelType.DM && channel.type !== ChannelType.SpaceVoice"
          class="h-8 w-8 cursor-pointer rounded-full bg-ctp-surface0 p-2 transition hover:text-ctp-text"
          @click="store.writeConfig('showChannelMembers', !store.config.showChannelMembers)"
        >
          <UsersIcon />
        </div>
      </div>
    </div>
    <GroupCreateModal
      v-if="inviteModal && channel.type === ChannelType.DM"
      :selected="channel.members[0].id"
      @close="inviteModal = false"
    />
    <GroupAddModal
      v-if="inviteModal && channel.type === ChannelType.Group"
      :channel="channel"
      @close="inviteModal = false"
    />
    <UserModal v-if="userModal" @close="userModal = false" :id="channel.members[0].id" />
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { CallStreamType, ChannelType } from "@/../../hyalus-server/src/types";
import { computed, type PropType, ref } from "vue";
import { isMobile, postImage } from "@/global/helpers";
import { useStore } from "@/global/store";
import type { IChannel, ISpace } from "@/global/types";
import UserAvatar from "./UserAvatar.vue";
import { SpeakerWaveIcon, UserGroupIcon, HashtagIcon } from "@heroicons/vue/24/solid";
import {
  ChevronLeftIcon,
  PhoneIcon,
  UserPlusIcon,
  UsersIcon,
  VideoCameraIcon,
} from "@heroicons/vue/20/solid";
import GroupCreateModal from "./GroupCreateModal.vue";
import GroupAddModal from "./GroupAddModal.vue";
import UserModal from "./UserModal.vue";

const store = useStore();
const props = defineProps({
  space: {
    type: Object as PropType<ISpace | undefined>,
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
const inviteModal = ref(false);
const userModal = ref(false);

const inVoice = computed(() => {
  return store.call && store.call.channelId === props.channel.id;
});

const setAvatar = () => {
  if (
    !store.self ||
    props.channel.type !== ChannelType.Group ||
    props.channel.ownerId !== store.self.id
  ) {
    return;
  }

  postImage(`/api/v1/channels/${props.channel.id}/avatar`);
};

const callStart = async (e: MouseEvent) => {
  if (store.call) {
    await store.callReset();
  }

  await store.callStart(props.channel.id);

  if (!e.shiftKey) {
    await store.callAddLocalStream({
      type: CallStreamType.Audio,
      silent: true,
    });
  }
};

const callStartWithVideo = async (e: MouseEvent) => {
  await callStart(e);

  await store.callAddLocalStream({
    type: CallStreamType.Video,
    silent: true,
  });
};

const voiceUsers = computed(() => {
  return props.channel.members.filter((member) =>
    store.voiceStates.find(
      (state) => state.id === member.id && state.channelId === props.channel.id,
    ),
  );
});

const voiceUsersShown = computed(() =>
  voiceUsers.value.slice(0, voiceUsers.value.length > 4 ? 3 : 4),
);

let newName = props.channel.name ?? "";

const name = computed({
  get(): string {
    if (props.channel.type === ChannelType.DM) {
      return props.channel.members[0].name;
    }

    return props.channel.name || "";
  },
  async set(v: string) {
    newName = v;
  },
});

const setNameSubmit = () => {
  (document.activeElement as unknown as HTMLElement).blur();
};

const setNameFocusOut = async () => {
  if (props.channel.name === newName) {
    return;
  }

  await axios.post(`/api/v1/channels/${props.channel.id}`, {
    name: newName,
  });
};

const voiceCapable = computed(() => {
  return [
    // voice capable channel types:
    ChannelType.DM,
    ChannelType.Group,
    ChannelType.SpaceVoice,
  ].includes(props.channel.type);
});
</script>
