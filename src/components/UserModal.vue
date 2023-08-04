<template>
  <ModalBase :empty="true" @close="$emit('close')">
    <LoadingIcon v-if="!cachedUser" class="h-8 w-8" />
    <div v-if="cachedUser" class="bg-ctp-crust w-screen max-w-lg overflow-hidden rounded-md">
      <div class="bg-ctp-mantle min-h-[6rem] w-full">
        <img
          v-if="cachedUser.banner"
          :src="`/api/v1/avatars/${cachedUser.banner}`"
          class="w-full"
        />
      </div>
      <div class="space-y-6 px-6 pb-6">
        <div class="relative h-12">
          <div class="absolute -top-12">
            <UserAvatar
              :avatar="cachedUser.avatar"
              :status="status"
              class="h-24 w-24 rounded-full backdrop-blur"
            />
          </div>
          <div class="absolute right-0 bottom-0 flex space-x-2">
            <template v-if="!isSelf">
              <ChatBubbleLeftIcon
                class="bg-ctp-base h-8 w-8 cursor-pointer rounded-full p-2 text-ctp-subtext0 hover:bg-ctp-base/50 shadow-md transition"
                @click="openChannel"
              />
              <UserPlusIcon
                v-if="!friend"
                class="bg-ctp-base h-8 w-8 cursor-pointer rounded-full p-2 text-ctp-subtext0 hover:bg-ctp-base/50 shadow-md transition"
                @click="addFriend"
              />
              <UserMinusIcon
                v-if="friend"
                class="bg-ctp-base h-8 w-8 cursor-pointer rounded-full p-2 text-ctp-subtext0 hover:bg-ctp-base/50 shadow-md transition"
                @click="friendRemoveModal = true"
              />
            </template>
            <template v-if="isSelf">
              <PencilIcon
                class="bg-ctp-base h-8 w-8 cursor-pointer rounded-full p-2 text-ctp-subtext0 hover:bg-ctp-base/50 shadow-md transition"
              />
              <!-- open settings to profile -->
            </template>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="min-w-0 select-text">
            <p class="truncate text-xl font-bold">{{ cachedUser.name }}</p>
            <p class="truncate text-sm text-ctp-subtext0">@{{ cachedUser.username }}</p>
          </div>
          <div v-if="cachedUser.flags" class="bg-ctp-base flex space-x-2 rounded-md p-2 shadow-md">
            <div
              v-if="cachedUser.flags & UserFlag.System"
              class="h-4 w-4 text-blue-400"
              title="System"
            >
              <ServerStackIcon />
            </div>
            <div
              v-if="cachedUser.flags & UserFlag.Staff"
              class="h-4 w-4 text-green-400"
              title="Staff"
            >
              <WrenchScrewdriverIcon />
            </div>
            <div
              v-if="cachedUser.flags & UserFlag.Tester"
              class="h-4 w-4 text-pink-400"
              title="Tester"
            >
              <BeakerIcon />
            </div>
            <div
              v-if="cachedUser.flags & UserFlag.BugReporter"
              class="h-4 w-4 text-purple-400"
              title="Bug Reporter"
            >
              <BugAntIcon />
            </div>
            <div
              v-if="cachedUser.flags & UserFlag.EarlySupporter"
              class="h-4 w-4 text-indigo-400"
              title="Early Supporter"
            >
              <SparklesIcon />
            </div>
            <div v-if="cachedUser.flags & UserFlag.Bot" class="h-4 w-4 text-teal-400" title="Bot">
              <RobotIcon />
            </div>
          </div>
        </div>
        <div class="border-ctp-base flex space-x-2 border-b text-sm text-ctp-subtext0">
          <p
            class="-mb-px cursor-pointer px-2 pb-2 transition"
            :class="{
              'border-b-2 border-text text-ctp-text': tab === 'profile',
              '': tab !== 'profile',
            }"
            @click="tab = 'profile'"
          >
            Profile
          </p>
          <p
            v-if="!isSelf"
            class="-mb-px cursor-pointer px-2 pb-2 transition"
            :class="{
              'border-b-2 border-text text-ctp-text': tab === 'spaces',
              '': tab !== 'spaces',
            }"
            @click="tab = 'spaces'"
          >
            Mutual Spaces
          </p>
          <p
            v-if="!isSelf"
            class="-mb-px cursor-pointer px-2 pb-2 transition"
            :class="{
              'border-b-2 border-text text-ctp-text': tab === 'friends',
              '': tab !== 'friends',
            }"
            @click="tab = 'friends'"
          >
            Mutual Friends
          </p>
        </div>
        <div class="h-48 space-y-4 overflow-auto">
          <template v-if="tab === 'profile'">
            <div v-if="space" class="space-y-2">
              <p class="text-xs font-semibold text-gray-500">Roles ({{ space.name }})</p>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="role in spaceRoles"
                  :key="role.id"
                  class="bg-dark-600 flex h-6 items-center space-x-2 rounded-md px-2 text-xs"
                >
                  <div
                    class="h-2.5 w-2.5 rounded-full"
                    :class="{
                      'bg-gray-500': !role.color,
                    }"
                    :style="
                      role.color ? `background: #${role.color.toString(16).padStart(6, '0')};` : ''
                    "
                  ></div>
                  <p>{{ role.name }}</p>
                </div>
                <div
                  class="bg-dark-600 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-gray-400 transition hover:text-white"
                >
                  <PlusIcon class="h-4 w-4" />
                </div>
              </div>
            </div>
            <div v-if="bioHtml" class="space-y-1">
              <p class="text-xs font-semibold text-ctp-subtext0 uppercase">Bio</p>
              <!-- eslint-disable vue/no-v-html -->
              <div class="select-text whitespace-pre-wrap text-sm" v-html="bioHtml" />
              <!-- eslint-enable vue/no-v-html -->
            </div>
            <div
              v-if="!cachedUser.bio && !space"
              class="flex h-full w-full flex-col items-center justify-center space-y-4 text-sm text-gray-400"
            >
              <InformationCircleIcon class="h-8 w-8" />
              <p>Nothing to see here.</p>
            </div>
          </template>
          <template v-if="tab === 'spaces'">
            <div
              v-if="!mutualSpaces.length"
              class="flex h-full w-full flex-col items-center justify-center space-y-4 text-sm text-gray-400"
            >
              <XCircleIcon class="h-8 w-8" />
              <p>No mutual spaces.</p>
            </div>
            <div v-if="mutualSpaces.length" class="space-y-2">
              <div
                v-for="mutualSpace in mutualSpaces"
                :key="mutualSpace.id"
                class="bg-dark-600 flex items-center space-x-3 rounded-md p-3"
              >
                <div
                  class="dark:bg-dark-200 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-300"
                >
                  <UserAvatar v-if="mutualSpace.avatar" :avatar="mutualSpace.avatar" />
                  <p v-else>{{ mutualSpace.name.slice(0, 1) }}</p>
                </div>
                <div>
                  <p class="text-semibold">
                    {{ mutualSpace.name }}
                  </p>
                  <p class="text-xs text-gray-400">{{ mutualSpace.members.length }} Members</p>
                </div>
              </div>
            </div>
          </template>
          <template v-if="tab === 'friends'">
            <div
              class="flex h-full w-full flex-col items-center justify-center space-y-4 text-sm text-gray-400"
            >
              <FaceFrownIcon class="h-8 w-8" />
              <p>This doesn't actually work yet.</p>
              <!-- TODO:: mutual friends UI -->
            </div>
          </template>
        </div>
      </div>
    </div>
  </ModalBase>
  <FriendRemoveModal
    v-if="friend && friendRemoveModal"
    :friend="friend"
    @close="friendRemoveModal = false"
  />
</template>

<script lang="ts" setup>
import { onMounted, type PropType, ref, type Ref, computed } from "vue";
import type { ICachedUser, ISpace } from "../global/types";
import { getCachedUser } from "../global/helpers";
import UserAvatar from "./UserAvatar.vue";
import {
  ChatBubbleLeftIcon,
  PencilIcon,
  UserPlusIcon,
  UserMinusIcon,
  PlusIcon,
  BugAntIcon,
  SparklesIcon,
  BeakerIcon,
} from "@heroicons/vue/20/solid";
import { useStore } from "../global/store";
import { ChannelType, Status, UserFlag } from "@/../../hyalus-server/src/types";
import { useRouter } from "vue-router";
import ModalBase from "./ModalBase.vue";
import { FaceFrownIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/vue/24/outline";
import FriendRemoveModal from "./FriendRemoveModal.vue";
import axios from "axios";
import LoadingIcon from "../icons/LoadingIcon.vue";
import { ServerStackIcon, WrenchScrewdriverIcon } from "@heroicons/vue/20/solid";
import RobotIcon from "../icons/RobotIcon.vue";
import { messageFormatter } from "../global/config";

const store = useStore();
const router = useRouter();
const emit = defineEmits(["close"]);
const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  space: {
    type: Object as PropType<ISpace | undefined>,
    default: undefined,
  },
});
const cachedUser: Ref<ICachedUser | null> = ref(null);
const tab = ref("profile");
const friendRemoveModal = ref(false);

onMounted(async () => {
  cachedUser.value = await getCachedUser(props.id);
});

const isSelf = computed(() => {
  return !!(store.self && props.id === store.self.id);
});

const friend = computed(() => {
  return store.friends.find((friend) => friend.id === props.id);
});

const spaceMember = computed(() => {
  if (!props.space) {
    return;
  }

  return props.space.members.find((member) => member.id === props.id);
});

const spaceRoles = computed(() => {
  if (!props.space || !spaceMember.value) {
    return;
  }

  const roles = [];
  for (const id of spaceMember.value.roleIds) {
    const role = props.space.roles.find((role) => role.id === id);
    if (role) {
      roles.push(role);
    }
  }

  return roles.sort((a, b) => (a.position > b.position ? 1 : -1));
});

const status = computed(() => {
  if (store.self && props.id === store.self.id) {
    return store.self.preferredStatus;
  }

  if (friend.value && friend.value.accepted) {
    return friend.value.status;
  }

  for (const space of store.spaces) {
    const member = space.members.find((member) => member.id === props.id);

    if (member) {
      return member.status;
    }
  }

  return Status.Offline;
});

const mutualSpaces = computed(() => {
  return store.spaces.filter((space) => space.members.find((member) => member.id === props.id));
});

const openChannel = () => {
  const channel = store.channels.find(
    (channel) => channel.type === ChannelType.DM && channel.members[0].id === props.id,
  );

  if (channel) {
    router.push(`/channels/${channel.id}`);
  } else {
    // TODO: create DM channel with people who have a mutual server. (add "hidden" to channel states)
  }

  emit("close");
};

const addFriend = async () => {
  if (!cachedUser.value) {
    return;
  }

  await axios.post(`/api/v1/friends`, {
    username: cachedUser.value.username,
  });
};

const bioHtml = computed(() => {
  if (!cachedUser.value) {
    return;
  }

  return messageFormatter.render(cachedUser.value.bio.trim()).trim();
});
</script>
