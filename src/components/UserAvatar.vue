<template>
  <div
    class="flex overflow-hidden rounded-full"
    :class="{
      'border-2 p-px': status !== undefined,
      'border-ctp-green': status === Status.Online,
      'border-ctp-yellow': status === Status.Away,
      'border-ctp-red': status === Status.Busy,
      'border-ctp-surface0': status === Status.Offline,
    }"
  >
    <div
      v-if="avatar"
      class="h-full w-full"
      @mouseenter="animate = true"
      @mouseleave="
        animate = false;
        animateReady = false;
      "
    >
      <img
        v-show="!animateReady"
        :src="`/api/v1/avatars/${avatar.split('+')[0]}`"
        class="h-full w-full rounded-full object-cover object-center"
      />
      <video
        v-if="animate && avatar.split('+').length > 1"
        :src="`/api/v1/avatars/${avatar.split('+')[1]}`"
        class="h-full w-full rounded-full object-cover object-center"
        :class="{
          'h-0 w-0': !animateReady,
        }"
        autoplay
        muted
        loop
        @timeupdate="animate && (animateReady = true)"
      />
    </div>
    <div
      v-else
      class="bg-ctp-accent flex w-full items-center justify-center rounded-full text-ctp-base"
    >
      <UserIcon class="h-2/3 w-2/3" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import UserIcon from "../icons/UserIcon.vue";
import { PropType, ref } from "vue";
import { Status } from "@/../hyalus-server/src/types";

const animate = ref(false);
const animateReady = ref(false);

defineProps({
  avatar: {
    type: String as PropType<string | null>,
    default() {
      //
    },
  },
  status: {
    type: Number as PropType<Status | null>,
    default() {
      //
    },
  },
});
</script>
