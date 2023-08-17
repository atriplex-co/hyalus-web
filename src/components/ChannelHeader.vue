<template>
  <div v-if="store.self">
    <div class="flex h-14 w-full justify-between px-3">
      <div class="flex w-full min-w-0 items-center space-x-2">
        <router-link
          v-if="isMobile"
          class="ml-2 h-8 w-8 rounded-full bg-ctp-surface0 p-1.5 text-ctp-subtext0 hover:text-ctp-text transition hover:bg-ctp-surface0/50"
          to="/app"
        >
          <ArrowLeftIcon />
        </router-link>
        <div class="bg-ctp-surface0 h-8 w-8 rounded-full p-2">
          <AtSymbolIcon v-if="channel.type === ChannelType.DM" />
          <UserGroupIcon v-if="channel.type === ChannelType.Group" />
          <HashtagIcon v-if="channel.type === ChannelType.SpaceText" />
          <SpeakerWaveIcon v-if="channel.type === ChannelType.SpaceVoice" />
        </div>
        <div class="min-w-0 flex-1 font-semibold">
          <form
            v-if="channel.ownerId === store.self.id"
            @submit.prevent="setNameSubmit"
            @focusout="setNameFocusOut"
          >
            <input
              v-model="name"
              class="hover:border-ctp-surface0/50 focus:border-ctp-surface0 -ml-2 w-full max-w-full truncate rounded-lg border border-transparent bg-transparent py-1 px-2 transition focus:bg-ctp-mantle"
            />
          </form>
          <p v-else class="truncate">
            {{ name }}
          </p>
        </div>
      </div>
      <div class="flex items-center space-x-2 text-ctp-subtext0">
        <template v-if="!inVoice && !space">
          <div v-if="voiceUsers.length" class="mr-2 flex -space-x-3">
            <UserAvatar
              v-for="user in voiceUsersShown"
              :key="user.id"
              :avatar="user.avatar"
              class="h-7 w-7 rounded-full border border-gray-900"
            />
            <div
              v-if="voiceUsers.length !== voiceUsersShown.length"
              class="bg-ctp-base flex h-7 w-7 items-center justify-center rounded-full border border-gray-900 text-xs font-bold text-white"
            >
              <p>+{{ voiceUsers.length - voiceUsersShown.length }}</p>
            </div>
          </div>
          <div
            class="bg-ctp-surface0 h-8 w-8 cursor-pointer rounded-full p-2 transition hover:text-ctp-text"
            @click="callStart"
          >
            <PhoneIcon />
          </div>
          <div
            class="bg-ctp-surface0 h-8 w-8 cursor-pointer rounded-full p-2 transition hover:text-ctp-text"
            @click="callStartWithVideo"
          >
            <VideoIcon />
          </div>
          <div
            class="bg-ctp-surface0 h-8 w-8 cursor-pointer rounded-full p-2 transition hover:text-ctp-text"
            @click="inviteModal = true"
          >
            <UserPlusIcon />
          </div>
        </template>
        <div
          v-if="channel.type !== ChannelType.DM"
          class="bg-ctp-surface0 h-8 w-8 cursor-pointer rounded-full p-2 transition hover:text-ctp-text"
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
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { CallStreamType, ChannelType } from "@/../../hyalus-server/src/types";
import { computed, type PropType, ref } from "vue";
import { isMobile } from "../global/helpers";
import { useStore } from "../global/store";
import type { IChannel, ISpace } from "../global/types";
import ArrowLeftIcon from "../icons/ArrowLeftIcon.vue";
import UserAvatar from "./UserAvatar.vue";
import PhoneIcon from "../icons/PhoneIcon.vue";
import VideoIcon from "../icons/VideoIcon.vue";
import { SpeakerWaveIcon, UserGroupIcon, AtSymbolIcon, HashtagIcon } from "@heroicons/vue/24/solid";
import { UserPlusIcon, UsersIcon } from "@heroicons/vue/20/solid";
import GroupCreateModal from "./GroupCreateModal.vue";
import GroupAddModal from "./GroupAddModal.vue";

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

const inVoice = computed(() => {
  return store.call && store.call.channelId === props.channel.id;
});

// TODO: implement this somehow or something idk fuck this
// const setAvatar = () => {
//   if (!store.self || props.channel.ownerId !== store.self.id) {
//     return;
//   }

//   const el = document.createElement("input");

//   el.addEventListener("input", async () => {
//     if (!el.files) {
//       return;
//     }

//     const form = new FormData();
//     form.append("avatar", el.files[0]);

//     await axios.post(`/api/v1/channels/${props.channel.id}/avatar`, form, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//   });

//   el.type = "file";
//   el.click();
// };

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
</script>
