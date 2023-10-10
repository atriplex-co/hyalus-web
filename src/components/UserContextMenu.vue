<template>
  <ContextMenu ref="menu">
    <ContextMenuItem
      @click="
        userModal = true;
        menu!.close();
      "
    >
      <p>Open Profile</p>
    </ContextMenuItem>
    <ContextMenuItem v-if="!isSelf && !friend" @click="addFriend">
      <p>Add Friend</p>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="friend"
      @click="
        removeFriendModal = true;
        menu!.close();
      "
    >
      <p>Remove Friend</p>
    </ContextMenuItem>
    <ContextMenuItem v-if="friend" @click="call">
      <p>Join Call</p>
    </ContextMenuItem>
    <ContextMenuItem v-if="!isSelf && space && canBanMember" @click="spaceMemberKickModal = true">
      <p>Kick Member</p>
    </ContextMenuItem>
    <ContextMenuItem v-if="!isSelf && space && canKickMember" @click="spaceMemberBanModal = true">
      <p>Ban Member</p>
    </ContextMenuItem>
    <ContextMenuItem @click="copyId">
      <p>Copy User ID</p>
    </ContextMenuItem>
  </ContextMenu>
  <UserModal v-if="userModal" @close="userModal = false" :id="user.id" />
  <FriendRemoveModal
    v-if="removeFriendModal && friend"
    @close="removeFriendModal = false"
    :friend="friend"
  />
  <SpaceMemberKickModal
    v-if="spaceMemberKickModal && space"
    @close="spaceMemberKickModal = false"
    :space="space"
    :member="spaceMember"
  />
  <SpaceMemberBanModal
    v-if="spaceMemberBanModal && space"
    @close="spaceMemberBanModal = false"
    :space="space"
    :member="spaceMember"
  />
</template>

<script lang="ts">
import { defineComponent, type Ref, ref, type PropType } from "vue";
import type { IChannel, IChannelMember, ISelf, ISpace, ISpaceMember } from "@/global/types";
import UserModal from "./UserModal.vue";
import { useStore } from "@/global/store";
import FriendRemoveModal from "./FriendRemoveModal.vue";
import axios from "axios";
import { CallStreamType, ChannelType, SpacePermission } from "../../../hyalus-server/src/types";
import { router } from "@/router";
import SpaceMemberKickModal from "./SpaceMemberKickModal.vue";
import SpaceMemberBanModal from "./SpaceMemberBanModal.vue";
import { checkSpacePermissions } from "@/global/helpers";
import ContextMenu from "./ContextMenu.vue";
import ContextMenuItem from "./ContextMenuItem.vue";

const store = useStore();

export default defineComponent({
  setup() {
    return {
      menu: ref(null) as Ref<typeof ContextMenu | null>,
    };
  },
  data() {
    return {
      userModal: false,
      removeFriendModal: false,
      spaceMemberKickModal: false,
      spaceMemberBanModal: false,
    };
  },
  computed: {
    isSelf() {
      return store.self!.id === this.user.id;
    },
    friend() {
      return store.friends.find((friend) => friend.id === this.user.id);
    },
    spaceMember() {
      return this.user as ISpaceMember;
    },
    canKickMember() {
      return (
        this.space &&
        checkSpacePermissions({
          spaceId: this.space.id,
          memberId: store.self!.id,
          permissions: SpacePermission.KickMember,
        })
      );
    },
    canBanMember() {
      return (
        this.space &&
        checkSpacePermissions({
          spaceId: this.space.id,
          memberId: store.self!.id,
          permissions: SpacePermission.BanMember,
        })
      );
    },
  },
  props: {
    user: {
      type: Object as PropType<ISelf | IChannelMember | ISpaceMember>,
      required: true,
    },
    channel: {
      type: Object as PropType<IChannel>,
      required: false,
    },
    space: {
      type: Object as PropType<ISpace>,
      required: false,
    },
  },
  methods: {
    open(e: MouseEvent) {
      this.menu!.open(e);
    },
    async addFriend() {
      await axios.post("/api/v1/friends", {
        username: this.user.username,
      });
      this.menu!.close();
    },
    async call(e: MouseEvent) {
      this.menu!.close();
      const channel = store.channels.find(
        (channel) =>
          channel.type === ChannelType.DM &&
          channel.members[0] &&
          channel.members[0].id === this.user.id,
      );
      if (!channel) {
        return;
      }

      if (store.call && store.call.channelId !== channel.id) {
        await store.callReset();
      }

      if (!store.call) {
        await store.callStart(channel.id);

        if (!e.shiftKey) {
          await store.callAddLocalStream({
            type: CallStreamType.Audio,
            silent: true,
          });
        }
      }

      await router.push(`/channels/${channel.id}`);
    },
    copyId() {
      this.menu!.close();
      navigator.clipboard.writeText(this.user.id);
    },
  },
  components: {
    UserModal,
    FriendRemoveModal,
    SpaceMemberKickModal,
    SpaceMemberBanModal,
    ContextMenu,
    ContextMenuItem,
  },
});
</script>
