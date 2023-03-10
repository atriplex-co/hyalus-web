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
          :avatar="member.avatar"
          :status="member.status"
          class="h-10 w-10 rounded-full"
        />
        <div>
          <p class="text-sm font-semibold">{{ member.name }}</p>
          <p class="text-sm text-gray-400">@{{ member.username }}</p>
        </div>
      </div>
      <ChevronDownIcon v-if="!open" class="h-5 w-5 text-gray-500" />
      <ChevronUpIcon v-if="open" class="h-5 w-5 text-gray-500" />
    </div>
    <div v-if="open" class="space-y-4 px-3 pb-3">
      <div class="space-y-2.5">
        <p class="text-sm font-semibold text-gray-400">Roles</p>
        <div
          v-for="role in space.roles"
          :key="role.id"
          class="flex items-center justify-between text-sm"
        >
          <div class="flex items-center space-x-3">
            <div
              class="h-2.5 w-2.5 rounded-full bg-gray-500"
              :style="
                role.color
                  ? `background: #${role.color.toString(16).padStart(6, '0')};`
                  : ''
              "
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
        <p class="text-sm font-semibold text-gray-400">Actions</p>
        <div class="flex space-x-4">
          <button
            v-if="allowKickMember"
            class="bg-primary-600 hover:bg-primary-700 block rounded-md py-1.5 px-3 text-sm text-white transition"
            @click="kickModal = true"
          >
            Kick Member
          </button>
          <button
            v-if="allowBanMember"
            class="bg-primary-600 hover:bg-primary-700 block rounded-md py-1.5 px-3 text-sm text-white transition"
            @click="banModal = true"
          >
            Ban Member
          </button>
          <button
            v-if="allowManageAliases"
            class="bg-primary-600 hover:bg-primary-700 block rounded-md py-1.5 px-3 text-sm text-white transition"
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
import { computed, PropType, ref } from "vue";
import { ISpace, ISpaceMember } from "../global/types";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid";
import UserAvatar from "./UserAvatar.vue";
import SpaceMemberKickModal from "./SpaceMemberKickModal.vue";
import SpaceMemberBanModal from "./SpaceMemberBanModal.vue";
import InputBoolean from "./InputBoolean.vue";
import axios from "axios";
import {
  checkSpacePermissions,
  getSpaceMemberPosition,
} from "../global/helpers";
import { SpacePermission } from "@/src/global/constants";
import { useStore } from "../global/store";

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

  await axios.patch(
    `/api/v1/spaces/${props.space.id}/members/${props.member.id}`,
    {
      roleIds,
    }
  );
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
