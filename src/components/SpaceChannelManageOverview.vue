<template>
  <div>
    <p class="text-2xl">Overview</p>
    <div class="mt-8 space-y-4">
      <div class="w-full space-y-2.5">
        <p class="text-sm font-semibold text-ctp-subtext0">Name</p>
        <input
          v-model="name"
          type="text"
          class="ring-ctp-accent w-full resize-none rounded-md bg-ctp-crust border border-ctp-base px-3 py-2 text-ctp-subtext0 shadow-sm transition focus:outline-none focus:ring-2"
        />
      </div>
      <button
      class="bg-ctp-surface0/50 hover:bg-ctp-base rounded-md py-2 px-6 text-sm transition"
        @click="save"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { type PropType, ref } from "vue";
import type { IChannel, ISpace } from "../global/types";

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
// eslint-disable-next-line vue/no-setup-props-destructure
const name = ref(props.channel.name);

const save = async () => {
  await axios.patch(`/api/v1/spaces/${props.space.id}/channels.${props.channel.id}`, {
    name: name.value,
  });
};
</script>
