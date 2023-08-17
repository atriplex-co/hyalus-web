<template>
  <div v-if="store.self" class="flex h-full flex-col">
    <div class="relative">
      <div
        class="relative flex h-14 cursor-pointer items-center justify-between px-4 shadow-ctp-crust/50 shadow-md transition hover:bg-ctp-surface0/50 group"
        @click="menu = !menu"
      >
        <p class="font-semibold">{{ space.name }}</p>
        <ChevronDownIcon v-if="!menu" class="h-4 w-4 text-ctp-subtext0 group-hover:text-ctp-text" />
        <ChevronUpIcon v-if="menu" class="h-4 w-4 text-ctp-subtext0 group-hover:text-ctp-text" />
      </div>
      <Transition
        enter-active-class="transition ease-out duration-100 origin-top"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75 origin-top"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div v-if="menu" class="absolute z-10 w-full p-2">
          <div class="bg-ctp-crust rounded-md p-2 text-sm shadow-lg">
            <div
              v-if="allowManageSpace || allowManageRoles || allowBanMember"
              class="flex cursor-pointer items-center space-x-3 rounded-md p-2 hover:bg-ctp-accent hover:text-ctp-base transition"
              @click="
                manageModal = true;
                menu = false;
              "
            >
              <CogIcon class="h-4 w-4" />
              <p>Manage Space</p>
            </div>
            <div
              v-if="allowCreateInvite"
              class="flex cursor-pointer items-center space-x-3 rounded-md p-2 hover:bg-ctp-accent hover:text-ctp-base transition"
              @click="
                inviteCreateModal = true;
                menu = false;
              "
            >
              <UserPlusIcon class="h-4 w-4" />
              <p>Create Invite</p>
            </div>
            <div
              v-if="allowManageChannels"
              class="flex cursor-pointer items-center space-x-3 rounded-md p-2 hover:bg-ctp-accent hover:text-ctp-base transition"
              @click="
                categoryCreateModal = true;
                menu = false;
              "
            >
              <FolderPlusIcon class="h-4 w-4" />
              <p>Create Category</p>
            </div>
            <div
              v-if="allowManageChannels"
              class="flex cursor-pointer items-center space-x-3 rounded-md p-2 hover:bg-ctp-accent hover:text-ctp-base transition"
              @click="
                channelCreateModal = true;
                menu = false;
              "
            >
              <PlusCircleIcon class="h-4 w-4" />
              <p>Create Channel</p>
            </div>
            <div
              v-if="allowSetAlias"
              class="flex cursor-pointer items-center space-x-3 rounded-md p-2 hover:bg-ctp-accent hover:text-ctp-base transition"
              @click="
                setAliasModal = true;
                menu = false;
              "
            >
              <PencilSquareIcon class="h-4 w-4" />
              <p>Change Nickname</p>
            </div>
            <div
              class="flex cursor-pointer items-center space-x-3 rounded-md p-2 hover:bg-ctp-accent hover:text-ctp-base transition"
              @click="
                privacySettingsModal = true;
                menu = false;
              "
            >
              <LockClosedIcon class="h-4 w-4" />
              <p>Privacy Settings</p>
            </div>
            <div
              class="flex cursor-pointer items-center space-x-3 rounded-md p-2 hover:bg-ctp-accent hover:text-ctp-base transition"
              @click="
                notificationSettingsModal = true;
                menu = false;
              "
            >
              <BellIcon class="h-4 w-4" />
              <p>Notification Settings</p>
            </div>
            <div class="border-ctp-base my-1 mx-2 border-t"></div>
            <div
              v-if="space.ownerId === store.self.id"
              class="flex cursor-pointer items-center space-x-3 rounded-md p-2 text-red-400 hover:bg-ctp-red hover:text-ctp-base transition"
              @click="
                deleteModal = true;
                menu = false;
              "
            >
              <TrashIcon class="h-4 w-4" />
              <p>Delete Space</p>
            </div>
            <div
              v-if="space.ownerId !== store.self.id"
              class="flex cursor-pointer items-center space-x-3 rounded-md p-2 text-red-400 hover:bg-ctp-red hover:text-ctp-base transition"
              @click="
                leaveModal = true;
                menu = false;
              "
            >
              <ArrowRightOnRectangleIcon class="h-4 w-4" />
              <p>Leave Space</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <div
      ref="channelsEl"
      class="flex-1 space-y-4 overflow-auto py-4 px-2"
      @scroll="queueSaveScrollTop"
    >
      <div v-if="rootChannels.length" class="space-y-0.5">
        <SideBarSpaceChannel
          v-for="channel in rootChannels"
          :key="channel.id"
          :space="space"
          :channel="channel"
        />
      </div>
      <SideBarSpaceChannel
        v-for="channel in categoryChannels"
        :key="channel.id"
        :space="space"
        :channel="channel"
      />
    </div>
    <SpaceManage v-if="manageModal" :space="space" @close="manageModal = false" />
    <SpaceInviteCreateModal
      v-if="inviteCreateModal"
      :space="space"
      @close="inviteCreateModal = false"
    />
    <SpaceCategoryCreateModal
      v-if="categoryCreateModal"
      :space="space"
      @close="categoryCreateModal = false"
    />
    <SpaceChannelCreateModal
      v-if="channelCreateModal"
      :space="space"
      @close="channelCreateModal = false"
    />
    <SpaceSetAliasModal v-if="setAliasModal" :space="space" @close="setAliasModal = false" />
    <SpaceDeleteModal v-if="deleteModal" :space="space" @close="deleteModal = false" />
    <SpaceLeaveModal v-if="leaveModal" :space="space" @close="leaveModal = false" />
    <SpacePrivacySettingsModal
      v-if="privacySettingsModal"
      :space="space"
      @close="privacySettingsModal = false"
    />
    <SpaceNotificationSettingsModal
      v-if="notificationSettingsModal"
      :space="space"
      @close="notificationSettingsModal = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType, ref, onMounted, watch } from "vue";
import type { ISpace } from "../global/types";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";
import SideBarSpaceChannel from "./SideBarSpaceChannel.vue";
import { ChannelType, SpacePermission } from "@/../../hyalus-server/src/types";
import {
  ArrowRightOnRectangleIcon,
  PencilSquareIcon,
  CogIcon,
  FolderPlusIcon,
  PlusCircleIcon,
  TrashIcon,
  UserPlusIcon,
  BellIcon,
  LockClosedIcon,
  ChevronUpIcon,
} from "@heroicons/vue/20/solid";
import { useStore } from "../global/store";
import { checkSpacePermissions } from "../global/helpers";
import SpaceManage from "./SpaceManage.vue";
import SpaceInviteCreateModal from "./SpaceInviteCreateModal.vue";
import SpaceChannelCreateModal from "./SpaceChannelCreateModal.vue";
import SpaceSetAliasModal from "./SpaceSetAliasModal.vue";
import SpaceLeaveModal from "./SpaceLeaveModal.vue";
import SpaceDeleteModal from "./SpaceDeleteModal.vue";
import SpacePrivacySettingsModal from "./SpacePrivacySettingsModal.vue";
import SpaceNotificationSettingsModal from "./SpaceDeleteModal.vue";
import { useRouter } from "vue-router";
import SpaceCategoryCreateModal from "./SpaceCategoryCreateModal.vue";

const store = useStore();
const router = useRouter();
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
const menu = ref(false);
const manageModal = ref(false);
const inviteCreateModal = ref(false);
const categoryCreateModal = ref(false);
const channelCreateModal = ref(false);
const setAliasModal = ref(false);
const privacySettingsModal = ref(false);
const notificationSettingsModal = ref(false);
const deleteModal = ref(false);
const leaveModal = ref(false);
const channelsEl = ref<HTMLDivElement | null>(null);

const rootChannels = computed(() => {
  return store.channels
    .filter(
      (channel) =>
        channel.spaceId === props.space.id &&
        !channel.parentId &&
        channel.type !== ChannelType.SpaceCategory &&
        checkSpacePermissions({
          permissions: SpacePermission.ViewChannels,
          spaceId: props.space.id,
          channelId: channel.id,
        }),
    )
    .sort((a, b) => ((a.position || 0) > (b.position || 0) ? 1 : -1));
});

const categoryChannels = computed(() => {
  return store.channels
    .filter(
      (channel) =>
        channel.spaceId === props.space.id &&
        channel.type === ChannelType.SpaceCategory &&
        (checkSpacePermissions({
          permissions: SpacePermission.ViewChannels,
          spaceId: props.space.id,
          channelId: channel.id,
        }) ||
          store.channels.find(
            (channel2) =>
              channel2.spaceId === props.space.id &&
              channel2.parentId === channel.id &&
              checkSpacePermissions({
                permissions: SpacePermission.ViewChannels,
                spaceId: props.space.id,
                channelId: channel2.id,
              }),
          )),
    )
    .sort((a, b) => ((a.position || 0) > (b.position || 0) ? 1 : -1));
});

const allowCreateInvite = computed(() => {
  return checkSpacePermissions({
    permissions: SpacePermission.CreateInvite,
    spaceId: props.space.id,
  });
});

const allowSetAlias = computed(() => {
  return checkSpacePermissions({
    permissions: SpacePermission.SetAlias,
    spaceId: props.space.id,
  });
});

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

const allowManageChannels = computed(() => {
  return checkSpacePermissions({
    permissions: SpacePermission.ManageChannels,
    spaceId: props.space.id,
  });
});

let saveScrollTopTimeout = 0;
const queueSaveScrollTop = () => {
  if (!channelsEl.value) {
    return;
  }

  const spaceId = props.space.id;
  const scrollTop = channelsEl.value.scrollTop;

  clearTimeout(saveScrollTopTimeout);
  saveScrollTopTimeout = +setTimeout(
    async () => store.writeConfig(`lastScrollTop:space:${spaceId}`, scrollTop),
    100,
  );
};

const onSpaceUpdate = async () => {
  if (!channelsEl.value) {
    return;
  }

  const scrollTop = store.config[`lastScrollTop:space:${props.space.id}`] as number | undefined;

  if (scrollTop) {
    channelsEl.value.scrollTop = scrollTop;
  }

  const openChannel =
    store.channels.find(
      (channel) => channel.id === store.config[`lastOpenChannelId:space:${props.space.id}`],
    ) ||
    store.channels.find(
      (channel) => channel.spaceId === props.space.id && channel.type === ChannelType.SpaceText,
    );

  if (openChannel) {
    await router.push(`/channels/${openChannel.id}`);
  } else {
    await router.push("/app");
  }
};

onMounted(onSpaceUpdate);
watch(() => props.space, onSpaceUpdate);
</script>
