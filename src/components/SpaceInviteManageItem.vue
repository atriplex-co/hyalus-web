<template>
  <tr class="h-16">
    <td>
      <div class="flex items-center space-x-3">
        <UserAvatar :avatar="invite.user.avatar" class="h-8 w-8 rounded-full" />
        <div class="-space-y-0.5">
          <p class="text-sm font-semibold">{{ invite.user.name }}</p>
          <p class="text-sm slashed-zero text-ctp-subtext0">@{{ invite.user.username }}</p>
        </div>
      </div>
    </td>
    <td class="select-all font-mono">
      {{ invite.code }}
    </td>
    <td>{{ invite.uses }}</td>
    <td>{{ invite.expiresAt ? invite.expiresAt.toISOString() : "N/A" }}</td>
    <td>
      <button
        class="h-8 w-8 rounded-full bg-ctp-surface0 p-2 text-ctp-subtext0 transition hover:bg-ctp-surface0/50"
        @click="remove"
      >
        <TrashIcon />
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { TrashIcon } from "@heroicons/vue/20/solid";
import axios from "axios";
import type { PropType } from "vue";
import type { ISpace, ISpaceInvite } from "@/global/types";
import UserAvatar from "./UserAvatar.vue";

const emit = defineEmits(["remove"]);
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
  invite: {
    type: Object as PropType<ISpaceInvite>,
    default() {
      //
    },
  },
});

const remove = async () => {
  await axios.delete(`/api/v1/spaces/${props.space.id}/invites/${props.invite.code}`);
  emit("remove");
};
</script>

<style scoped>
th,
td {
  @apply h-16;
}
</style>
