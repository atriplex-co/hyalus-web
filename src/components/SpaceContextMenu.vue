<!-- TODO: implement -->
<template>
  <ContextMenu ref="menu">
    <ContextMenuItem
      v-if="canManage"
      @click="
        manageModal = true;
        menu!.close();
      "
    >
      <p>Manage Space</p>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="canCreateInvite"
      @click="
        createInviteModal = true;
        menu!.close();
      "
    >
      <p>Create Invite</p>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="canManageChannels"
      @click="
        createCategoryModal = true;
        menu!.close();
      "
    >
      <p>Create Category</p>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="canManageChannels"
      @click="
        createChannelModal = true;
        menu!.close();
      "
    >
      <p>Create Channel</p>
    </ContextMenuItem>
    <!-- <ContextMenuItem>
      <p>Change Nickname</p>
    </ContextMenuItem> -->
    <!-- <ContextMenuItem>
      <p>Privacy Settings</p>
    </ContextMenuItem> -->
    <!-- <ContextMenuItem>
      <p>Notification Settings</p>
    </ContextMenuItem> -->
    <ContextMenuItem
      v-if="!isOwner"
      @click="
        leaveModal = true;
        menu!.close();
      "
    >
      <p>Leave Space</p>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="isOwner"
      @click="
        deleteModal = true;
        menu!.close();
      "
    >
      <p>Delete Space</p>
    </ContextMenuItem>
    <ContextMenuItem @click="copyId">
      <p>Copy Space ID</p>
    </ContextMenuItem>
  </ContextMenu>
  <SpaceManage v-if="manageModal" @close="manageModal = false" :space="space" />
  <SpaceInviteCreateModal
    v-if="createInviteModal"
    @close="createInviteModal = false"
    :space="space"
  />
  <SpaceCategoryCreateModal
    v-if="createCategoryModal"
    @close="createCategoryModal = false"
    :space="space"
  />
  <SpaceChannelCreateModal
    v-if="createChannelModal"
    @close="createChannelModal = false"
    :space="space"
  />
  <SpaceLeaveModal v-if="leaveModal" @close="leaveModal = false" :space="space" />
  <SpaceDeleteModal v-if="deleteModal" @close="deleteModal = false" :space="space" />
</template>

<script lang="ts">
import ContextMenu from "./ContextMenu.vue";
import { defineComponent, ref, type Ref, type PropType } from "vue";
import ContextMenuItem from "./ContextMenuItem.vue";
import type { ISpace } from "@/global/types";
import { checkSpacePermissions } from "@/global/helpers";
import { SpacePermission } from "../../../hyalus-server/src/types";
import { useStore } from "@/global/store";
import SpaceManage from "./SpaceManage.vue";
import SpaceInviteCreateModal from "./SpaceInviteCreateModal.vue";
import SpaceChannelCreateModal from "./SpaceChannelCreateModal.vue";
import SpaceCategoryCreateModal from "./SpaceCategoryCreateModal.vue";
import SpaceLeaveModal from "./SpaceLeaveModal.vue";
import SpaceDeleteModal from "./SpaceDeleteModal.vue";

const store = useStore();

export default defineComponent({
  setup() {
    return {
      menu: ref(null) as Ref<typeof ContextMenu | null>,
    };
  },
  data() {
    return {
      manageModal: false,
      createInviteModal: false,
      createCategoryModal: false,
      createChannelModal: false,
      leaveModal: false,
      deleteModal: false,
    };
  },
  props: {
    space: {
      type: Object as PropType<ISpace>,
      required: true,
    },
  },
  computed: {
    canManage() {
      return checkSpacePermissions({
        permissions: SpacePermission.ManageSpace,
        spaceId: this.space.id,
        memberId: store.self!.id,
      });
    },
    canCreateInvite() {
      return checkSpacePermissions({
        permissions: SpacePermission.CreateInvite,
        spaceId: this.space.id,
        memberId: store.self!.id,
      });
    },
    canManageChannels() {
      return checkSpacePermissions({
        permissions: SpacePermission.ManageChannels,
        spaceId: this.space.id,
        memberId: store.self!.id,
      });
    },
    isOwner() {
      return this.space.ownerId === store.self!.id;
    },
  },
  methods: {
    open(e: MouseEvent) {
      this.menu!.open(e);
    },
    copyId() {
      navigator.clipboard.writeText(this.space.id);
      this.menu!.close();
    },
  },
  components: {
    ContextMenu,
    ContextMenuItem,
    SpaceManage,
    SpaceInviteCreateModal,
    SpaceCategoryCreateModal,
    SpaceChannelCreateModal,
    SpaceLeaveModal,
    SpaceDeleteModal,
  },
});
</script>
