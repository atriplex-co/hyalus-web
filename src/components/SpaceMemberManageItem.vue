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
        <UserAvatar
          :id="member.id"
          :avatar="member.avatar"
          :allow-status="true"
          :allow-animate="false"
          class="h-10 w-10 rounded-full"
        />
        <div>
          <p class="text-sm font-semibold">{{ member.name }}</p>
          <p class="text-sm text-ctp-subtext0">@{{ member.username }}</p>
        </div>
      </div>
      <ChevronDownIcon v-if="!open" class="h-5 w-5 text-gray-500" />
      <ChevronUpIcon v-if="open" class="h-5 w-5 text-gray-500" />
    </div>
    <div v-if="open" class="space-y-4 px-3 pb-3">
      <div class="space-y-2.5">
        <p class="text-sm font-semibold text-ctp-subtext0">Roles</p>
        <div
          v-for="role in space.roles"
          :key="role.id"
          class="flex items-center justify-between text-sm"
        >
          <div class="flex items-center space-x-3">
            <div
              class="h-2.5 w-2.5 rounded-full bg-gray-500"
              :style="role.color ? `background: #${role.color.toString(16).padStart(6, '0')};` : ''"
            ></div>
            <p>{{ role.name }}</p>
          </div>
          <InputBoolean
            :model-value="member.roleIds.includes(role.id)"
            @update:model-value="updateRole(role.id)"
          />
        </div>
      </div>
      <div v-if="aboveMember" class="space-y-2.5">
        <p class="text-sm font-semibold text-ctp-subtext0">Actions</p>
        <div class="flex space-x-4">
          <button
            v-if="allowKickMember"
            class="block rounded-md bg-ctp-surface0 px-3 py-1.5 text-sm transition hover:bg-ctp-surface0/50"
            @click="kickModal = true"
          >
            Kick Member
          </button>
          <button
            v-if="allowBanMember"
            class="block rounded-md bg-ctp-surface0 px-3 py-1.5 text-sm transition hover:bg-ctp-surface0/50"
            @click="banModal = true"
          >
            Ban Member
          </button>
          <button
            v-if="allowManageAliases"
            class="block rounded-md bg-ctp-surface0 px-3 py-1.5 text-sm transition hover:bg-ctp-surface0/50"
            @click="aliasModal = true"
          >
            Change Nickname
          </button>
        </div>
      </div>
    </div>
    <SpaceMemberKickModal
      v-if="kickModal"
      :space="space"
      :member="member"
      @close="kickModal = false"
    />
    <SpaceMemberBanModal
      v-if="banModal"
      :space="space"
      :member="member"
      @close="banModal = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType, ref } from "vue";
import type { ISpace, ISpaceMember } from "@/global/types";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid";
import UserAvatar from "./UserAvatar.vue";
import SpaceMemberKickModal from "./SpaceMemberKickModal.vue";
import SpaceMemberBanModal from "./SpaceMemberBanModal.vue";
import InputBoolean from "./InputBoolean.vue";
import axios from "axios";
import { checkSpacePermissions, getSpaceMemberPosition } from "@/global/helpers";
import { SpacePermission } from "@/../../hyalus-server/src/types";
import { useStore } from "@/global/store";

const store = useStore();
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
  member: {
    type: Object as PropType<ISpaceMember>,
    default() {
      //
    },
  },
});
const open = ref(false);
const kickModal = ref(false);
const banModal = ref(false);
const aliasModal = ref(false); // TODO: implement setting other member's alias

const updateRole = async (id: string) => {
  let roleIds = Array.from(props.member.roleIds);

  if (roleIds.includes(id)) {
    roleIds = roleIds.filter((id2) => id2 !== id);
  } else {
    roleIds.push(id);
  }

  await axios.patch(`/api/v1/spaces/${props.space.id}/members/${props.member.id}`, {
    roleIds,
  });
};

const aboveMember = computed(() => {
  if (!store.self) {
    return;
  }

  if (props.member.id === store.self.id) {
    return false;
  }

  if (props.space.ownerId === store.self.id) {
    return true;
  }

  return (
    getSpaceMemberPosition({
      spaceId: props.space.id,
      memberId: store.self.id,
    }) <
    getSpaceMemberPosition({
      spaceId: props.space.id,
      memberId: props.member.id,
    })
  );
});

const allowKickMember = computed(() => {
  return (
    aboveMember.value &&
    checkSpacePermissions({
      permissions: SpacePermission.KickMember,
      spaceId: props.space.id,
    })
  );
});

const allowBanMember = computed(() => {
  return (
    aboveMember.value &&
    checkSpacePermissions({
      permissions: SpacePermission.KickMember,
      spaceId: props.space.id,
    })
  );
});

const allowManageAliases = computed(() => {
  return (
    aboveMember.value &&
    checkSpacePermissions({
      permissions: SpacePermission.ManageAliases,
      spaceId: props.space.id,
    })
  );
});
</script>
