<template>
  <div v-if="store.self">
    <div
      class="group flex min-w-0 cursor-pointer items-center justify-between space-x-3 rounded-md p-1.5 hover:bg-gray-900"
      @click="userModal = true"
    >
      <div class="flex min-w-0 items-center space-x-3">
        <UserAvatar
          :id="member.id"
          :avatar="member.avatar"
          :allow-status="true"
          :allow-animate="true"
          class="h-8 w-8 rounded-full"
        />
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
      <TrashIcon
        v-if="channel.ownerId === store.self.id && channel.type === ChannelType.Group"
        class="hidden h-7 w-7 flex-shrink-0 cursor-pointer rounded-full p-1.5 transition group-hover:block bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50"
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
import { ChannelType } from "@/../../hyalus-server/src/types";
import { useStore } from "../global/store";
import UserModal from "./UserModal.vue";
import GroupRemoveModal from "./GroupRemoveModal.vue";
import GroupLeaveModal from "./GroupLeaveModal.vue";
import { TrashIcon } from "@heroicons/vue/20/solid";

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
