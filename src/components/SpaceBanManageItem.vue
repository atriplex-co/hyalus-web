<template>
  <div
    :class="{
      'bg-dark-800': open,
    }"
  >
    <div
      class="hover:bg-dark-800 flex cursor-pointer items-center justify-between rounded-md p-3 transition"
      @click="open = !open"
    >
      <div class="flex items-center space-x-4">
        <UserAvatar :avatar="ban.user.avatar" class="h-10 w-10 rounded-full" />
        <div>
          <p class="text-sm font-semibold">{{ ban.user.name }}</p>
          <p class="text-sm text-ctp-subtext0">@{{ ban.user.username }}</p>
        </div>
      </div>
      <ChevronDownIcon v-if="!open" class="h-5 w-5 text-gray-500" />
      <ChevronUpIcon v-if="open" class="h-5 w-5 text-gray-500" />
    </div>
    <div v-if="open" class="space-y-3 px-3 pb-3 text-sm">
      <div>
        <p class="font-semibold text-ctp-subtext0">Time</p>
        <p>{{ ban.createdAt.toISOString() }}</p>
      </div>
      <div>
        <p class="font-semibold text-ctp-subtext0">Reason</p>
        <p>{{ ban.reason || "N/A" }}</p>
      </div>
      <button
        class="block rounded-md bg-ctp-red px-3 py-1.5 text-sm text-ctp-base transition hover:bg-ctp-red/75"
        @click="remove"
      >
        Remove
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type PropType, ref } from "vue";
import type { ISpace, ISpaceBan } from "@/global/types";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid";
import UserAvatar from "./UserAvatar.vue";
import axios from "axios";

const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
  ban: {
    type: Object as PropType<ISpaceBan>,
    default() {
      //
    },
  },
});
const emit = defineEmits(["remove"]);
const open = ref(false);

const remove = async () => {
  await axios.delete(`/api/v1/spaces/${props.space.id}/bans/${props.ban.user.id}`);

  emit("remove");
};
</script>
