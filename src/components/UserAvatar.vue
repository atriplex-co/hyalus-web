<template>
  <div
    class="flex overflow-hidden rounded-full"
    :class="{
      'border-2 p-px': allowStatus && status,
      'border-ctp-green': status && status.status === Status.Online,
      'border-ctp-yellow': status && status.status === Status.Away,
      'border-ctp-red': status && status.status === Status.Busy,
      'border-ctp-surface0': status && status.status === Status.Offline,
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
        loading="lazy"
      />
      <video
        v-if="allowAnimate && animate && avatar.split('+').length > 1"
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
      class="flex w-full items-center justify-center rounded-full bg-ctp-accent text-ctp-base"
    >
      <UserIcon class="h-2/3 w-2/3" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type PropType, ref, computed } from "vue";
import { Status } from "@/../../hyalus-server/src/types";
import { getStatus } from "@/global/helpers";
import { UserIcon } from "@heroicons/vue/20/solid";

const animate = ref(false);
const animateReady = ref(false);

const props = defineProps({
  id: {
    type: String,
  },
  avatar: {
    type: String as PropType<string | null>,
  },
  allowStatus: {
    type: Boolean,
    default: false,
  },
  allowAnimate: {
    type: Boolean,
    default: false,
  },
});

const status = computed(() => {
  if (!props.id) {
    return;
  }
  return getStatus(props.id);
});
</script>
