<template>
  <SplitModal @close="emit('close')">
    <template #left>
      <div
        v-if="allowManageChannels"
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'overview',
        }"
        @click="active = 'overview'"
      >
        <InformationCircleIcon class="h-5 w-5" />
        <p>Overview</p>
      </div>
      <div
        v-if="allowManageRoles"
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'permissions',
        }"
        @click="active = 'permissions'"
      >
        <ClipboardDocumentCheckIcon class="h-5 w-5" />
        <p>Permissions</p>
      </div>
      <div class="py-2 px-3">
        <div class="border-dark-600 border-t"></div>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-red-500 hover:text-white"
        @click="deleteModal = true"
      >
        <TrashIcon class="h-5 w-5" />
        <p v-if="channel.type === ChannelType.SpaceCategory">Delete Category</p>
        <p v-else>Delete Channel</p>
      </div>
    </template>
    <template #right>
      <SpaceChannelManageOverview
        v-if="active === 'overview'"
        :space="space"
        :channel="channel"
      />
      <SpaceChannelManagePermissions
        v-if="active === 'permissions'"
        :space="space"
        :channel="channel"
      />
    </template>
  </SplitModal>
  <SpaceChannelDeleteModal
    v-if="deleteModal"
    :space="space"
    :channel="channel"
    @close="deleteModal = false"
  />
</template>

<script setup lang="ts">
import {
  ClipboardDocumentCheckIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/vue/24/solid";
import { ChannelType, SpacePermission } from "@/../hyalus-server/src/types";
import { computed, PropType, ref } from "vue";
import { checkSpacePermissions } from "../global/helpers";
import { IChannel, ISpace } from "../global/types";
import SpaceChannelDeleteModal from "./SpaceChannelDeleteModal.vue";
import SpaceChannelManageOverview from "./SpaceChannelManageOverview.vue";
import SpaceChannelManagePermissions from "./SpaceChannelManagePermissions.vue";
import SplitModal from "./SplitModal.vue";

const emit = defineEmits(["close"]);
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
const active = ref("");
const deleteModal = ref(false);
const allowManageChannels = computed(() =>
  checkSpacePermissions({
    permissions: SpacePermission.ManageChannels,
    spaceId: props.space.id,
    channelId: props.channel.id,
  }),
);
const allowManageRoles = computed(() =>
  checkSpacePermissions({
    permissions: SpacePermission.ManageRoles,
    spaceId: props.space.id,
    channelId: props.channel.id,
  }),
);

if (!active.value && allowManageChannels.value) {
  active.value = "overview";
}

if (!active.value && allowManageRoles.value) {
  active.value = "permissions";
}
</script>
