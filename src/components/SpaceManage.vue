<template>
  <SplitModal @close="$emit('close')">
    <template #left>
      <div
        v-if="allowManageSpace"
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
            active === 'roles',
        }"
        @click="active = 'roles'"
      >
        <TagIcon class="h-5 w-5" />
        <p>Roles</p>
      </div>
      <div
        v-if="allowManageRoles"
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'members',
        }"
        @click="active = 'members'"
      >
        <UsersIcon class="h-5 w-5" />
        <p>Members</p>
      </div>
      <div
        v-if="allowBanMember"
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'bans',
        }"
        @click="active = 'bans'"
      >
        <ShieldExclamationIcon class="h-5 w-5" />
        <p>Bans</p>
      </div>
      <div
        v-if="allowManageSpace"
        class="dark:hover:bg-dark-600 flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-800 dark:hover:text-white"
        :class="{
          'dark:bg-dark-600 bg-gray-200 text-gray-800 dark:text-white':
            active === 'invites',
        }"
        @click="active = 'invites'"
      >
        <EnvelopeIcon class="h-5 w-5" />
        <p>Invites</p>
      </div>
      <div class="py-2 px-3">
        <div class="border-dark-600 border-t"></div>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md py-1.5 px-3 transition hover:bg-red-500 hover:text-white"
        @click="deleteModal = true"
      >
        <TrashIcon class="h-5 w-5" />
        <p>Delete Space</p>
      </div>
      <div class="py-2 px-3">
        <div class="border-dark-600 border-t"></div>
      </div>
      <div class="text-primary-500 px-3 py-1.5 text-sm">
        WARNING: Spaces are currently experimental and may be wiped during
        development!
      </div>
    </template>
    <template #right>
      <SpaceManageOverview v-if="active === 'overview'" :space="space" />
      <SpaceManageRoles v-if="active === 'roles'" :space="space" />
      <SpaceManageMembers v-if="active === 'members'" :space="space" />
      <SpaceManageInvites v-if="active === 'invites'" :space="space" />
      <SpaceManageBans v-if="active === 'bans'" :space="space" />
    </template>
  </SplitModal>
  <SpaceDeleteModal
    v-if="deleteModal"
    :space="space"
    @close="deleteModal = false"
  />
</template>

<script lang="ts" setup>
import {
  EnvelopeIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
  TagIcon,
  TrashIcon,
  UsersIcon,
} from "@heroicons/vue/24/solid";
import { computed, PropType, ref } from "vue";
import SplitModal from "./SplitModal.vue";
import SpaceManageOverview from "./SpaceManageOverview.vue";
import SpaceManageRoles from "./SpaceManageRoles.vue";
import SpaceManageMembers from "./SpaceManageMembers.vue";
import SpaceManageInvites from "./SpaceManageInvites.vue";
import SpaceManageBans from "./SpaceManageBans.vue";
import { ISpace } from "../global/types";
import SpaceDeleteModal from "./SpaceDeleteModal.vue";
import { checkSpacePermissions } from "../global/helpers";
import { SpacePermission } from "@/../hyalus-server/src/types";

defineEmits(["close"]);

const active = ref("");
const deleteModal = ref(false);
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});

// Sections:
// -> Overview
// -> Roles
// -> Members
// -> Invites
// -> Bans
// -> Emotes (TODO)
// -> Logs (TODO)

const allowManageSpace = computed(() => {
  return checkSpacePermissions({
    permissions: SpacePermission.ManageSpace,
    spaceId: props.space.id,
  });
});

const allowManageRoles = computed(() => {
  return checkSpacePermissions({
    permissions: SpacePermission.ManageRoles,
    spaceId: props.space.id,
  });
});

const allowBanMember = computed(() => {
  return checkSpacePermissions({
    permissions: SpacePermission.BanMember,
    spaceId: props.space.id,
  });
});

if (!active.value && allowManageSpace.value) {
  active.value = "overview";
}

if (!active.value && allowManageRoles.value) {
  active.value = "roles";
}

if (!active.value && allowBanMember.value) {
  active.value = "bans";
}
</script>
