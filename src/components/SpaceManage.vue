<template>
  <SplitModal @close="$emit('close')">
    <template #left>
      <div
        v-if="allowManageSpace"
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': active === 'overview',
        }"
        @click="active = 'overview'"
      >
        <InformationCircleIcon class="h-5 w-5" />
        <p>Overview</p>
      </div>
      <div
        v-if="allowManageRoles"
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': active === 'roles',
        }"
        @click="active = 'roles'"
      >
        <TagIcon class="h-5 w-5" />
        <p>Roles</p>
      </div>
      <div
        v-if="allowManageRoles"
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': active === 'members',
        }"
        @click="active = 'members'"
      >
        <UsersIcon class="h-5 w-5" />
        <p>Members</p>
      </div>
      <div
        v-if="allowBanMember"
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': active === 'bans',
        }"
        @click="active = 'bans'"
      >
        <ShieldExclamationIcon class="h-5 w-5" />
        <p>Bans</p>
      </div>
      <div
        v-if="allowManageSpace"
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': active === 'invites',
        }"
        @click="active = 'invites'"
      >
        <EnvelopeIcon class="h-5 w-5" />
        <p>Invites</p>
      </div>
      <div
        v-if="allowManageEmojis"
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-base/50"
        :class="{
          'bg-ctp-base text-ctp-text': active === 'emojis',
        }"
        @click="active = 'emojis'"
      >
        <FaceSmileIcon class="h-5 w-5" />
        <p>Emojis</p>
      </div>
      <div class="px-3 py-2">
        <div class="border-t border-ctp-surface0/50"></div>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-4 rounded-md px-3 py-1.5 transition hover:bg-ctp-red hover:text-ctp-base"
        @click="deleteModal = true"
      >
        <TrashIcon class="h-5 w-5" />
        <p>Delete Space</p>
      </div>
      <div class="px-3 py-2">
        <div class="border-t border-ctp-surface0/50"></div>
      </div>
    </template>
    <template #right>
      <SpaceManageOverview v-if="active === 'overview'" :space="space" />
      <SpaceManageRoles v-if="active === 'roles'" :space="space" />
      <SpaceManageMembers v-if="active === 'members'" :space="space" />
      <SpaceManageInvites v-if="active === 'invites'" :space="space" />
      <SpaceManageBans v-if="active === 'bans'" :space="space" />
      <SpaceManageEmojis v-if="active === 'emojis'" :space="space" />
    </template>
  </SplitModal>
  <SpaceDeleteModal v-if="deleteModal" :space="space" @close="deleteModal = false" />
</template>

<script lang="ts" setup>
import {
  EnvelopeIcon,
  FaceSmileIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
  TagIcon,
  TrashIcon,
  UsersIcon,
} from "@heroicons/vue/24/solid";
import { computed, type PropType, ref } from "vue";
import SplitModal from "./SplitModal.vue";
import SpaceManageOverview from "./SpaceManageOverview.vue";
import SpaceManageRoles from "./SpaceManageRoles.vue";
import SpaceManageMembers from "./SpaceManageMembers.vue";
import SpaceManageInvites from "./SpaceManageInvites.vue";
import SpaceManageBans from "./SpaceManageBans.vue";
import type { ISpace } from "@/global/types";
import SpaceDeleteModal from "./SpaceDeleteModal.vue";
import { checkSpacePermissions } from "@/global/helpers";
import { SpacePermission } from "@/../../hyalus-server/src/types";
import SpaceManageEmojis from "./SpaceManageEmojis.vue";

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
// -> Emojis
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

const allowManageEmojis = computed(() => {
  return checkSpacePermissions({
    permissions: SpacePermission.ManageEmojis,
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
