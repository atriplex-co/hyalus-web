<template>
  <div>
    <p class="text-2xl">Invites</p>
    <div v-if="!ready" class="mt-8 flex w-full justify-center">
      <LoadingIcon class="h-5 w-5" />
    </div>
    <div v-if="ready" class="mt-8 space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold text-ctp-subtext0">
          {{ invites.length }} Invite{{ invites.length === 1 ? "" : "s" }}
        </p>
        <input
          type="text"
          class="w-[50%] resize-none rounded-md border border-ctp-base bg-ctp-crust px-2 py-1 text-ctp-subtext0 shadow-sm ring-ctp-accent transition placeholder:text-ctp-overlay0 focus:outline-none focus:ring-2"
          placeholder="Search Invites"
        />
      </div>
      <table
        class="w-full table-auto divide-y divide-ctp-surface0/50 border-b border-t border-ctp-surface0/50 text-sm"
      >
        <thead>
          <tr>
            <th class="text-start">Member</th>
            <th class="text-start">Code</th>
            <th class="text-start">Uses</th>
            <th class="text-start">Expires</th>
            <td class="w-8"></td>
          </tr>
        </thead>
        <tbody class="divide-y divide-ctp-surface0/50">
          <SpaceInviteManageItem
            v-for="invite in invites"
            :key="invite.code"
            :space="space"
            :invite="invite"
            @remove="invites = invites.filter((invite2) => invite2 !== invite)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { onMounted, type PropType, ref } from "vue";
import type { ISpace, ISpaceInvite } from "@/global/types";
import LoadingIcon from "@/icons/LoadingIcon.vue";
import SpaceInviteManageItem from "./SpaceInviteManageItem.vue";

const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
const ready = ref(false);
const invites = ref<ISpaceInvite[]>([]);

onMounted(async () => {
  const { data } = await axios.get(`/api/v1/spaces/${props.space.id}/invites`);

  ready.value = true;
  invites.value = data.map(
    (invite: {
      createdAt: number;
      expiredAt: number | null;
      code: string;
      uses: number;
      user: {
        id: string;
        name: string;
        username: string;
        avatar: string | null;
        flags: number;
      };
    }) => ({
      createdAt: new Date(invite.createdAt),
      expiredAt: invite.expiredAt && new Date(invite.expiredAt),
      code: invite.code,
      uses: invite.uses,
      user: invite.user,
    }),
  );
});
</script>

<style scoped>
th,
td {
  @apply h-12;
}
</style>
