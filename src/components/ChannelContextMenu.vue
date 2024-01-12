<template>
  <ContextMenu ref="menu">
    <ContextMenuItem @click="setAvatar" v-if="isOwner">
      <p>Change Icon</p>
    </ContextMenuItem>
    <ContextMenuItem
      @click="
        setNameModal = true;
        menu!.close();
      "
      v-if="isOwner"
    >
      <p>Change Name</p>
    </ContextMenuItem>
    <ContextMenuItem
      @click="
        groupAddModal = true;
        menu!.close();
      "
      v-if="channel.type === ChannelType.Group"
    >
      <p>Invite Members</p>
    </ContextMenuItem>
    <ContextMenuItem
      @click="
        groupLeaveModal = true;
        menu!.close();
      "
      v-if="channel.type === ChannelType.Group"
    >
      <p>Leave Group</p>
    </ContextMenuItem>
    <ContextMenuItem
      @click="
        profileModal = true;
        menu!.close();
      "
      v-if="channel.type === ChannelType.DM"
    >
      <p>Open Profile</p>
    </ContextMenuItem>
    <ContextMenuItem v-if="channel.type === ChannelType.DM && !friend" @click="addFriend">
      <p>Add Friend</p>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="channel.type === ChannelType.DM && friend"
      @click="
        removeFriendModal = true;
        menu!.close();
      "
    >
      <p>Remove Friend</p>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="channel.type === ChannelType.DM"
      @click="
        setAliasModal = true;
        menu!.close();
      "
    >
      <p>Set Nickname</p>
    </ContextMenuItem>
    <ContextMenuItem
      @click="
        groupCreateModal = true;
        menu!.close();
      "
      v-if="canCreateGroup"
    >
      <p>Create Group</p>
    </ContextMenuItem>
    <ContextMenuItem v-if="canCall" @click="call">
      <p>Join Call</p>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="canManage"
      @click="
        spaceChannelManageModal = true;
        menu!.close();
      "
    >
      <p>Manage Channel</p>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="canManage"
      @click="
        spaceChannelDeleteModal = true;
        menu!.close();
      "
    >
      <p>Delete Channel</p>
    </ContextMenuItem>
    <ContextMenuItem v-if="canPin" @click="setPinned(!isPinned)">
      <p v-if="!isPinned">Pin Channel</p>
      <p v-if="isPinned">Unpin Channel</p>
    </ContextMenuItem>
    <ContextMenuItem @click="setMuted(!isMuted)">
      <p v-if="!isMuted">Mute Channel</p>
      <p v-if="isMuted">Unmute Channel</p>
    </ContextMenuItem>
    <ContextMenuItem @click="copyChannelId">
      <p>Copy Channel ID</p>
    </ContextMenuItem>
    <ContextMenuItem @click="copyUserId" v-if="channel.type === ChannelType.DM">
      <p>Copy User ID</p>
    </ContextMenuItem>
  </ContextMenu>
  <UserModal v-if="profileModal" @close="profileModal = false" :id="channel.members[0].id" />
  <FriendRemoveModal
    v-if="removeFriendModal && friend"
    @close="removeFriendModal = false"
    :friend="friend"
  />
  <GroupCreateModal
    v-if="groupCreateModal"
    @close="groupCreateModal = false"
    :selected="channel.members[0].id"
  />
  <GroupAddModal v-if="groupAddModal" @close="groupAddModal = false" :channel="channel" />
  <GroupLeaveModal v-if="groupLeaveModal" @close="groupLeaveModal = false" :channel="channel" />
  <SpaceChannelManage
    v-if="spaceChannelManageModal"
    @close="spaceChannelManageModal = false"
    :channel="channel"
    :space="space!"
  />
  <SpaceChannelDeleteModal
    v-if="spaceChannelDeleteModal"
    @close="spaceChannelDeleteModal = false"
    :channel="channel"
    :space="space!"
  />
  <SetUserAliasModal
    v-if="setAliasModal"
    @close="setAliasModal = false"
    :id="channel.members[0].id"
  />
</template>

<script lang="ts">
import type { IChannel, ISpace } from "@/global/types";
import { defineComponent, type PropType, ref, type Ref } from "vue";
import { CallStreamType, ChannelType, SpacePermission } from "@/../../hyalus-server/src/types";
import { useStore } from "@/global/store";
import ContextMenu from "@/components/ContextMenu.vue";
import ContextMenuItem from "@/components/ContextMenuItem.vue";
import { checkSpacePermissions, postImage } from "@/global/helpers";
import axios from "axios";
import UserModal from "./UserModal.vue";
import FriendRemoveModal from "./FriendRemoveModal.vue";
import GroupCreateModal from "./GroupCreateModal.vue";
import GroupAddModal from "./GroupAddModal.vue";
import GroupLeaveModal from "./GroupLeaveModal.vue";
import SpaceChannelManage from "./SpaceChannelManage.vue";
import SpaceChannelDeleteModal from "./SpaceChannelDeleteModal.vue";
import SetUserAliasModal from "./SetUserAliasModal.vue";
import { router } from "@/router";

const store = useStore();

export default defineComponent({
  setup() {
    return {
      menu: ref(null) as Ref<typeof ContextMenu | null>,
      ChannelType,
    };
  },
  computed: {
    friend() {
      if (this.channel.type === ChannelType.DM) {
        return store.friends.find((friend) => friend.id === this.channel.members[0].id);
      } else {
        return undefined;
      }
    },
    canCall() {
      return (
        this.channel.type === ChannelType.DM ||
        this.channel.type === ChannelType.Group ||
        this.channel.type === ChannelType.SpaceVoice
      );
    },
    canManage() {
      if (!this.space) {
        return false;
      }

      return checkSpacePermissions({
        permissions: SpacePermission.ViewChannels | SpacePermission.ManageChannels,
        spaceId: this.space.id,
        channelId: this.channel.id,
        memberId: store.self!.id,
      });
    },
    canCreateGroup() {
      return this.channel.type === ChannelType.DM && this.friend;
    },
    isOwner() {
      return this.channel.type === ChannelType.Group && this.channel.ownerId === store.self!.id;
    },
    canPin() {
      return this.channel.type === ChannelType.DM || this.channel.type === ChannelType.Group;
    },
    isPinned() {
      return store.self!.userConfig.pinnedChannelIds.includes(this.channel.id);
    },
    isMuted() {
      return store.self!.userConfig.mutedChannelIds.includes(this.channel.id);
    },
  },
  data() {
    return {
      setNameModal: false,
      groupAddModal: false,
      groupCreateModal: false,
      groupLeaveModal: false,
      removeFriendModal: false,
      profileModal: false,
      spaceChannelManageModal: false,
      spaceChannelDeleteModal: false,
      setAliasModal: false,
    };
  },
  methods: {
    open(e: MouseEvent) {
      this.menu!.open(e);
    },
    setAvatar() {
      this.menu!.close();
      postImage(`/api/v1/channels/${this.channel.id}/avatar`);
    },
    copyChannelId() {
      this.menu!.close();
      navigator.clipboard.writeText(this.channel.id);
    },
    copyUserId() {
      this.menu!.close();
      navigator.clipboard.writeText(this.channel.members[0].id);
    },
    async addFriend() {
      this.menu!.close();
      await axios.post(`/api/v1/friends`, {
        username: this.channel.members[0].username,
      });
    },
    async call(e: MouseEvent) {
      this.menu!.close();
      if (store.call && store.call.channelId !== this.channel.id) {
        await store.callReset();
      }

      if (!store.call) {
        await store.callStart(this.channel.id);

        if (!e.shiftKey) {
          await store.callAddLocalStream({
            type: CallStreamType.Audio,
            silent: true,
          });
        }
      }

      await router.push(`/channels/${this.channel.id}`);
    },
    async openChannel() {
      this.menu!.close();
      await this.$router.push(`/channels/${this.channel.id}`);
    },
    async setPinned(pinned: boolean) {
      this.menu!.close();
      if (pinned) {
        store.self!.userConfig.pinnedChannelIds.push(this.channel.id);
      } else {
        store.self!.userConfig.pinnedChannelIds = store.self!.userConfig.pinnedChannelIds.filter(
          (id) => id !== this.channel.id,
        );
      }
      await store.updateUserConfig();
    },
    async setMuted(muted: boolean) {
      this.menu!.close();
      if (muted) {
        store.self!.userConfig.mutedChannelIds.push(this.channel.id);
      } else {
        store.self!.userConfig.mutedChannelIds = store.self!.userConfig.mutedChannelIds.filter(
          (id) => id !== this.channel.id,
        );
      }
      await store.updateUserConfig();
    },
  },
  props: {
    channel: {
      type: Object as PropType<IChannel>,
      required: true,
    },
    space: {
      type: Object as PropType<ISpace>,
      required: false,
    },
  },
  components: {
    ContextMenu,
    ContextMenuItem,
    UserModal,
    FriendRemoveModal,
    GroupCreateModal,
    GroupAddModal,
    GroupLeaveModal,
    SpaceChannelManage,
    SpaceChannelDeleteModal,
    SetUserAliasModal,
  },
});
</script>
