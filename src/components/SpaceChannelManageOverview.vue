<template>
  <div>
    <p class="text-2xl">Overview</p>
    <div class="mt-8 space-y-4">
      <div class="w-full space-y-2.5">
        <p class="text-sm font-semibold text-gray-400">Name</p>
        <input
          v-model="name"
          type="text"
          class="ring-primary-500 dark:border-dark-500 dark:bg-dark-800 w-full resize-none rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm transition focus:outline-none focus:ring dark:text-gray-400"
        />
      </div>
      <button
        class="bg-dark-400 hover:bg-dark-200 rounded-md py-2 px-6 text-sm transition"
        @click="save"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { PropType, ref } from "vue";
import { IChannel, ISpace } from "../global/types";

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
const name = ref(props.channel.name);

const save = async () => {
  await axios.patch(
    `/api/v1/spaces/${props.space.id}/channels.${props.channel.id}`,
    {
      name: name.value,
    },
  );
};
</script>
