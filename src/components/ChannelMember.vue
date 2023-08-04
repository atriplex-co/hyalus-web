<template>
  <div v-if="store.self">
    <div
      class="group flex min-w-0 cursor-pointer items-center justify-between space-x-3 rounded-md p-1.5 hover:bg-gray-900"
      @click="userModal = true"
    >
      <div class="flex min-w-0 items-center space-x-3">
        <UserAvatar :avatar="member.avatar" :status="status" class="h-8 w-8 rounded-full" />
        <div class="min-w-0">
          <p
            class="truncate font-semibold"
            :class="{
              'text-ctp-subtext0 transition group-hover:text-ctp-text': !color,
            }"
            :style="color ? `color: ${color};` : ''"
          >
            {{ member.name }}
          </p>
          <p class="truncate text-xs text-ctp-subtext0">@{{ member.username }}</p>
        </div>
      </div>
      <CloseIcon
        v-if="channel.ownerId === store.self.id && channel.type === ChannelType.Group"
        class="dark:bg-dark-500 hidden h-7 w-7 flex-shrink-0 cursor-pointer rounded-full bg-gray-200 p-1.5 text-gray-500 transition hover:text-gray-800 group-hover:block dark:text-gray-400 dark:hover:text-white"
        @click.stop="groupRemoveModal = true"
      />
    </div>
    <UserModal v-if="userModal" :id="member.id" :space="space" @close="userModal = false" />
    <GroupRemoveModal
      v-if="groupRemoveModal && member.id !== store.self.id"
      :channel="channel"
      :member="member"
      @close="groupRemoveModal = false"
    />
    <GroupLeaveModal
      v-if="groupRemoveModal && member.id === store.self.id"
      :channel="channel"
      @close="groupRemoveModal = false"
    />
  </div>
</template>

<script lang="ts" setup>
import UserAvatar from "./UserAvatar.vue";
import { computed, type PropType, ref } from "vue";
import type { IChannel, IChannelMember, ISelf, ISpace, ISpaceMember } from "../global/types";
import { ChannelType, Status } from "@/../../hyalus-server/src/types";
import { useStore } from "../global/store";
import UserModal from "./UserModal.vue";
import CloseIcon from "../icons/CloseIcon.vue";
import GroupRemoveModal from "./GroupRemoveModal.vue";
import GroupLeaveModal from "./GroupLeaveModal.vue";

const store = useStore();
const props = defineProps({
  channel: {
    type: Object as PropType<IChannel>,
    default() {
      //
    },
  },
  member: {
    type: Object as PropType<ISelf | IChannelMember | ISpaceMember>,
    default() {
      //
    },
  },
  space: {
    type: Object as PropType<ISpace | undefined>,
    default() {
      //
    },
  },
});
const userModal = ref(false);
const groupRemoveModal = ref(false);

const status = computed(() => {
  if (store.self && props.member.id === store.self.id) {
    return store.self.preferredStatus;
  }

  const friend = store.friends.find((friend) => friend.id === props.member.id);

  if (friend) {
    return friend.status;
  }

  let spaceMember: ISpaceMember | undefined = undefined;
  for (const space of store.spaces) {
    spaceMember = space.members.find((member) => member.id === props.member.id);
    if (spaceMember) {
      break;
    }
  }

  if (spaceMember) {
    return spaceMember.status;
  }

  return Status.Offline;
});

const color = computed(() => {
  if (!props.space) {
    return null;
  }

  const member = props.member as ISpaceMember;

  const roles = [];
  for (const roleId of member.roleIds) {
    const role = props.space.roles.find((role) => role.id === roleId);

    if (role) {
      roles.push(role);
    }
  }

  if (!roles.length) {
    return;
  }

  roles.sort((a, b) => (a.position > b.position ? 1 : -1));
  if (roles[0].color) {
    return `#${roles[0].color.toString(16)}`;
  }

  return null;
});
</script>
