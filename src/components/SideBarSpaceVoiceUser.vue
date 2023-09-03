<template>
  <div
    class="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1 text-sm text-ctp-subtext0 transition hover:bg-ctp-surface0/50 hover:text-ctp-text"
    @click="userModal = true"
  >
    <div class="flex items-center space-x-2">
      <UserAvatar
        :avatar="member.avatar"
        class="duration-50 h-5 w-5 rounded-full transition"
        :class="{
          'ring-2 ring-ctp-accent': speaking,
        }"
      />
      <p>{{ member.name }}</p>
    </div>
    <div class="flex space-x-1.5 text-ctp-subtext0">
      <MicOffIcon
        v-if="(flags & VoiceStateFlags.Muted) === VoiceStateFlags.Muted"
        class="h-4 w-4"
      />
      <SpeakerXMarkIcon
        v-if="(flags & VoiceStateFlags.Deaf) === VoiceStateFlags.Deaf"
        class="h-4 w-4"
      />
      <VideoCameraIcon
        v-if="(flags & VoiceStateFlags.VideoEnabled) === VoiceStateFlags.VideoEnabled"
        class="h-4 w-4"
      />
      <ComputerDesktopIcon
        v-if="(flags & VoiceStateFlags.DisplayEnabled) === VoiceStateFlags.DisplayEnabled"
        class="h-4 w-4"
      />
    </div>
  </div>
  <UserModal :id="member.id" :space="space" v-if="userModal" @close="userModal = false" />
</template>

<script setup lang="ts">
import { ref, type PropType, computed } from "vue";
import { CallStreamType, VoiceStateFlags } from "@/../../hyalus-server/src/types";
import type {
  ICallLocalStream,
  ICallRemoteStream,
  IChannel,
  ISelf,
  ISpace,
  ISpaceMember,
} from "@/global/types";
import UserAvatar from "./UserAvatar.vue";
import UserModal from "./UserModal.vue";
import MicOffIcon from "@/icons/MicOffIcon.vue";
import { ComputerDesktopIcon, SpeakerXMarkIcon, VideoCameraIcon } from "@heroicons/vue/20/solid";
import { useStore } from "@/global/store";

const props = defineProps({
  member: {
    type: Object as PropType<ISpaceMember | ISelf>,
    required: true,
  },
  flags: {
    type: Number as PropType<VoiceStateFlags>,
    required: true,
  },
  space: {
    type: Object as PropType<ISpace>,
    required: true,
  },
  channel: {
    type: Object as PropType<IChannel>,
    required: true,
  },
});
const userModal = ref(false);
const store = useStore();
const speaking = computed(() => {
  if (!store.call) {
    return false;
  }

  let stream: ICallRemoteStream | ICallLocalStream | undefined;

  if (props.member.id === store.self!.id) {
    stream = store.call.localStreams.find((stream) => stream.type === CallStreamType.Audio);
  } else {
    stream = store.call.remoteStreams.find(
      (stream) => stream.userId === props.member.id && stream.type === CallStreamType.Audio,
    );
  }

  if (stream) {
    return stream.speaking;
  } else {
    return false;
  }
});
</script>
