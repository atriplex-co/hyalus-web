<template>
  <div
    class="z-20 h-full w-64 max-w-xs space-y-4 overflow-y-auto rounded-md bg-ctp-mantle px-2 py-4 text-sm"
  >
    <ChannelMemberListGroup
      v-for="group in groups"
      :key="group.id"
      :name="group.name"
      :members="group.members"
      :channel="channel"
      :space="space"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType } from "vue";
import type { IChannel, IChannelMember, ISelf, ISpace, ISpaceMember } from "../global/types";
import { useStore } from "../global/store";
import ChannelMemberListGroup from "./ChannelMemberListGroup.vue";
import { Status } from "@/../../hyalus-server/src/types";

defineEmits(["close"]);
const store = useStore();
const props = defineProps({
  channel: {
    type: Object as PropType<IChannel>,
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

interface IChannelMemberGroup {
  id: string;
  name: string;
  members: (ISelf | IChannelMember | ISpaceMember)[];
}

const groups = computed<IChannelMemberGroup[]>(() => {
  if (!store.self) {
    return [];
  }

  if (props.space) {
    const groups: IChannelMemberGroup[] = [];

    for (const role of props.space.roles) {
      if (!role.seperate) {
        continue;
      }

      const members = props.space.members.filter(
        (member) =>
          member.roleIds.includes(role.id) &&
          member.status !== Status.Offline &&
          !groups.find((group) => group.members.find((member2) => member2.id === member.id)),
      );

      if (!members.length) {
        continue;
      }

      groups.push({
        id: role.id,
        name: role.name,
        members: members.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)),
      });
    }

    const onlineUsers = props.space.members.filter(
      (member) =>
        member.status !== Status.Offline &&
        !groups.find((group) => group.members.find((member2) => member2.id === member.id)),
    );

    if (onlineUsers.length) {
      groups.push({
        id: "online",
        name: "Online",
        members: onlineUsers.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)),
      });
    }

    const offlineUsers = props.space.members.filter(
      (member) =>
        !groups.find((group) => group.members.find((member2) => member2.id === member.id)),
    );

    if (offlineUsers.length) {
      groups.push({
        id: "offline",
        name: "offline",
        members: offlineUsers.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
        ),
      });
    }

    return groups;
  }

  return [
    {
      id: "members",
      name: "Members",
      members: [store.self, ...props.channel.members].sort((a, b) =>
        a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
      ),
    },
  ];
});
</script>
