<template>
  <div
    v-if="store.self && store.call && channel"
    class="group m-2 mt-0 flex flex-col items-center rounded-md bg-ctp-crust p-2.5 drop-shadow-2xl"
  >
    <div class="flex w-full min-w-0 items-center justify-between space-x-2">
      <div class="flex min-w-0 flex-1 items-center space-x-2">
        <div class="h-8 w-8 rounded-md bg-ctp-mantle p-2 text-ctp-accent">
          <PhoneIcon />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-bold text-ctp-accent">
            <p v-if="store.call.pc.connectionState === 'new'">Waiting for Server</p>
            <p v-if="store.call.pc.connectionState === 'connecting'">Call Connecting</p>
            <p v-if="store.call.pc.connectionState === 'connected'">Call Connected</p>
            <p v-if="store.call.pc.connectionState === 'disconnected'">Call Disconnected</p>
            <p v-if="store.call.pc.connectionState === 'failed'">You're Fucked (F5)</p>
          </div>
          <div class="flex min-w-0 space-x-1 text-xs text-ctp-subtext0">
            <router-link :to="`/channels/${channel.id}`" class="block truncate hover:underline">
              {{ name }}
            </router-link>
            <p class="flex-shrink-0">&bull; {{ time }}</p>
          </div>
        </div>
      </div>
      <div class="mr-2 flex flex-shrink-0 -space-x-3">
        <UserAvatar
          :avatar="store.self.avatar"
          class="h-7 w-7 rounded-full border border-ctp-mantle transition"
          :class="{
            'ring-2 ring-ctp-accent': store.call.localStreams.find(
              (stream) => stream.type === CallStreamType.Audio,
            )?.speaking,
          }"
        />
        <UserAvatar
          v-for="user in voiceUsersShown"
          :key="user.id"
          :avatar="user.avatar"
          class="h-7 w-7 rounded-full border border-ctp-mantle transition"
          :class="{
            'ring-2 ring-ctp-accent': store.call.remoteStreams.find(
              (stream) => stream.type === CallStreamType.Audio && stream.userId === user.id,
            )?.speaking,
          }"
        />
        <div
          v-if="voiceUsers.length !== voiceUsersShown.length"
          class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-900 bg-ctp-base text-xs font-bold text-white"
        >
          <p>+{{ voiceUsers.length - voiceUsersShown.length }}</p>
        </div>
      </div>
    </div>
    <div
      class="mt-0 flex h-0 scale-y-0 transform items-center space-x-2.5 opacity-0 transition-all group-hover:mt-2.5 group-hover:h-10 group-hover:scale-y-100 group-hover:opacity-100"
    >
      <div @click="store.callSetMuted(!store.call.muted)">
        <div
          class="h-10 w-10 cursor-pointer rounded-full p-3 transition"
          :class="{
            'bg-ctp-text text-ctp-base': !store.call.muted,
            'bg-ctp-mantle text-ctp-subtext0 hover:text-ctp-text': store.call.muted,
          }"
        >
          <MicIcon v-if="audioStream" />
          <MicOffIcon v-else />
        </div>
      </div>
      <div @click="toggleStream(CallStreamType.Video)">
        <div
          class="h-10 w-10 cursor-pointer rounded-full p-3 transition"
          :class="{
            'bg-ctp-text text-ctp-base': videoStream,
            'bg-ctp-mantle text-ctp-subtext0 hover:text-ctp-text': !videoStream,
          }"
        >
          <VideoIcon v-if="CallStreamType" />
          <VideoOffIcon v-else />
        </div>
      </div>
      <div @click="stop">
        <CallEndIcon
          class="h-10 w-10 cursor-pointer rounded-full bg-ctp-red p-3 text-ctp-base transition hover:bg-ctp-red/75"
        />
      </div>
      <div @click="toggleStream(CallStreamType.DisplayVideo)">
        <DisplayIcon
          class="h-10 w-10 cursor-pointer rounded-full p-3 transition"
          :class="{
            'bg-ctp-text text-ctp-base': displayVideoStream,
            'bg-ctp-mantle text-ctp-subtext0 hover:text-ctp-text': !displayVideoStream,
          }"
        />
      </div>
      <div @click="store.callSetDeaf(!store.call!.deaf)">
        <div
          class="h-10 w-10 cursor-pointer rounded-full p-3 transition"
          :class="{
            'bg-ctp-text text-ctp-base': store.call.deaf,
            'bg-ctp-mantle text-ctp-subtext0 hover:text-ctp-text': !store.call.deaf,
          }"
        >
          <AudioOffIcon v-if="store.call" />
          <AudioIcon v-else />
        </div>
      </div>
    </div>
    <DesktopCaptureModal v-if="desktopCaptureModal" @close="desktopCaptureModal = false" />
  </div>
</template>

<script lang="ts" setup>
import { CallStreamType, ChannelType } from "@/../../hyalus-server/src/types";
import { computed, ref, onUnmounted, watch } from "vue";
import { isDesktop } from "../global/helpers";
import { useStore } from "../global/store";
import PhoneIcon from "../icons/PhoneIcon.vue";
import MicIcon from "../icons/MicIcon.vue";
import MicOffIcon from "../icons/MicOffIcon.vue";
import VideoIcon from "../icons/VideoIcon.vue";
import VideoOffIcon from "../icons/VideoOffIcon.vue";
import CallEndIcon from "../icons/CallEndIcon.vue";
import DisplayIcon from "../icons/DisplayIcon.vue";
import AudioOffIcon from "../icons/AudioOffIcon.vue";
import AudioIcon from "../icons/AudioIcon.vue";
import DesktopCaptureModal from "./DesktopCaptureModal.vue";
import Day from "dayjs";
import UserAvatar from "./UserAvatar.vue";

const store = useStore();
const time = ref("");

const desktopCaptureModal = ref(false);

const channel = computed(() => {
  return store.channels.find((channel) => channel.id === store.call?.channelId);
});

const name = computed(() => {
  if (!channel.value) {
    return "";
  }

  if (channel.value.type === ChannelType.DM) {
    return channel.value.members[0].name;
  }

  return channel.value.name;
});

const getComputedStream = (type: CallStreamType) => {
  return computed(() => {
    if (!store.call) {
      return undefined;
    }

    return store.call.localStreams.find((track) => track.type === type);
  });
};

const audioStream = getComputedStream(CallStreamType.Audio);
const videoStream = getComputedStream(CallStreamType.Video);
const displayVideoStream = getComputedStream(CallStreamType.DisplayVideo);

const toggleStream = async (type: CallStreamType) => {
  if (getComputedStream(type).value) {
    await store.callRemoveLocalStream({
      type,
    });
  } else {
    if (type === CallStreamType.DisplayVideo && isDesktop) {
      desktopCaptureModal.value = true;
      return;
    }

    await store.callAddLocalStream({
      type,
    });
  }
};

const stop = async () => {
  await store.callReset();
};

const updateTime = () => {
  if (!store.call) {
    return;
  }

  const duration = Day.duration(+new Date() - +store.call.start);

  if (duration.asSeconds() < 60 * 60) {
    time.value = duration.format("mm:ss");
    return;
  }

  if (duration.asSeconds() < 60 * 60 * 24) {
    time.value = duration.format("HH:mm:ss");
    return;
  }

  time.value = duration.format("DD:HH:mm:ss");
};

const voiceUsers = computed(() => {
  if (!channel.value) {
    return [];
  }

  return channel.value.members.filter((member) =>
    store.voiceStates.find(
      (state) => state.id === member.id && state.channelId === channel.value?.id,
    ),
  );
});

const voiceUsersShown = computed(() =>
  voiceUsers.value.slice(0, voiceUsers.value.length > 4 ? 3 : 4),
);

let updateTimeInterval = 0;

updateTime();
updateTimeInterval = +setInterval(() => {
  updateTime();
}, 1000);

onUnmounted(() => {
  clearInterval(updateTimeInterval);
});

watch(
  () => store.call,
  () => {
    updateTime();
  },
);
</script>
