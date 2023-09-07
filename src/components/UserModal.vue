<template>
  <ModalBase :empty="true" @close="$emit('close')">
    <LoadingIcon v-if="!cachedUser" class="h-8 w-8" />
    <div v-if="cachedUser" class="w-screen max-w-lg overflow-hidden rounded-md bg-ctp-crust">
      <div class="min-h-[6rem] w-full bg-ctp-mantle">
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
              :id="cachedUser.id"
              :avatar="cachedUser.avatar"
              :allow-status="true"
              :allow-animate="true"
              class="h-24 w-24 rounded-full backdrop-blur"
            />
          </div>
          <div class="absolute bottom-0 right-0 flex space-x-2">
            <template v-if="!isSelf">
              <ChatBubbleLeftIcon
                class="h-8 w-8 cursor-pointer rounded-full bg-ctp-base p-2 text-ctp-subtext0 shadow-md transition hover:bg-ctp-base/50"
                @click="openChannel"
              />
              <UserPlusIcon
                v-if="!friend"
                class="h-8 w-8 cursor-pointer rounded-full bg-ctp-base p-2 text-ctp-subtext0 shadow-md transition hover:bg-ctp-base/50"
                @click="addFriend"
              />
              <UserMinusIcon
                v-if="friend"
                class="h-8 w-8 cursor-pointer rounded-full bg-ctp-base p-2 text-ctp-subtext0 shadow-md transition hover:bg-ctp-base/50"
                @click="friendRemoveModal = true"
              />
            </template>
            <template v-if="isSelf">
              <PencilIcon
                @click="settingsModal = true"
                class="h-8 w-8 cursor-pointer rounded-full bg-ctp-base p-2 text-ctp-subtext0 shadow-md transition hover:bg-ctp-base/50"
              />
            </template>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="min-w-0 select-text">
            <p class="truncate text-xl font-bold">{{ cachedUser.name }}</p>
            <p class="truncate text-sm text-ctp-subtext0">@{{ cachedUser.username }}</p>
          </div>
          <div v-if="cachedUser.flags" class="flex space-x-2 rounded-md bg-ctp-base p-2 shadow-md">
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
        <div class="flex space-x-2 border-b border-ctp-base text-sm text-ctp-subtext0">
          <p
            class="-mb-px cursor-pointer px-2 pb-2 transition"
            :class="{
              'border-text border-b-2 text-ctp-text': tab === 'profile',
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
              'border-text border-b-2 text-ctp-text': tab === 'spaces',
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
              'border-text border-b-2 text-ctp-text': tab === 'friends',
              '': tab !== 'friends',
            }"
            @click="tab = 'friends'"
          >
            Mutual Friends
          </p>
          <p
            v-if="!isSelf"
            class="-mb-px cursor-pointer px-2 pb-2 transition"
            :class="{
              'border-text border-b-2 text-ctp-text': tab === 'groups',
              '': tab !== 'groups',
            }"
            @click="tab = 'groups'"
          >
            Mutual Groups
          </p>
        </div>
        <div class="h-48 space-y-4 overflow-auto">
          <template v-if="tab === 'profile'">
            <div v-if="space" class="space-y-2">
              <p class="text-xs font-semibold text-ctp-subtext0">Roles ({{ space.name }})</p>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="role in spaceRoles"
                  :key="role.id"
                  class="flex h-6 items-center space-x-2 rounded-md bg-ctp-base px-2 text-xs"
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
                  class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-ctp-base text-ctp-subtext0 transition hover:text-white"
                >
                  <PlusIcon class="h-4 w-4" />
                </div>
              </div>
            </div>
            <div v-if="bioHtml" class="space-y-1">
              <p class="text-xs font-semibold uppercase text-ctp-subtext0">Bio</p>
              <!-- eslint-disable vue/no-v-html -->
              <div class="select-text whitespace-pre-wrap text-sm" v-html="bioHtml" />
              <!-- eslint-enable vue/no-v-html -->
            </div>
            <div
              v-if="!cachedUser.bio && !space"
              class="flex h-full w-full flex-col items-center justify-center space-y-4 text-sm text-ctp-subtext0"
            >
              <InformationCircleIcon class="-mt-6 h-8 w-8" />
              <p>Nothing to see here.</p>
            </div>
          </template>
          <template v-if="tab === 'spaces'">
            <div
              v-if="!mutualSpaces.length"
              class="flex h-full w-full flex-col items-center justify-center space-y-4 text-sm text-ctp-subtext0"
            >
              <XCircleIcon class="-mt-6 h-8 w-8" />
              <p>No mutual spaces.</p>
            </div>
            <div v-if="mutualSpaces.length" class="space-y-2">
              <div
                v-for="mutualSpace in mutualSpaces"
                :key="mutualSpace.id"
                class="flex items-center space-x-2 rounded-md bg-ctp-base p-2"
              >
                <div
                  class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ctp-surface0"
                >
                  <UserAvatar v-if="mutualSpace.avatar" :avatar="mutualSpace.avatar" />
                  <p v-else>{{ mutualSpace.name.slice(0, 1) }}</p>
                </div>
                <div>
                  <p class="text-sm">
                    {{ mutualSpace.name }}
                  </p>
                  <p class="text-xs text-ctp-subtext0">{{ mutualSpace.members.length }} Members</p>
                </div>
              </div>
            </div>
          </template>
          <template v-if="tab === 'friends'">
            <div
              class="flex h-full w-full flex-col items-center justify-center space-y-4 text-sm text-ctp-subtext0"
            >
              <FaceFrownIcon class="-mt-6 h-8 w-8" />
              <p>This doesn't actually work yet.</p>
              <!-- TODO:: mutual friends UI -->
            </div>
          </template>
          <template v-if="tab === 'groups'">
            <div
              v-if="!mutualGroups.length"
              class="flex h-full w-full flex-col items-center justify-center space-y-4 text-sm text-ctp-subtext0"
            >
              <XCircleIcon class="-mt-6 h-8 w-8" />
              <p>No mutual groups.</p>
            </div>
            <div v-if="mutualGroups.length" class="space-y-2">
              <div
                v-for="mutualGroup in mutualGroups"
                :key="mutualGroup.id"
                class="flex items-center space-x-2 rounded-md bg-ctp-base p-2"
              >
                <div
                  class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ctp-surface0"
                >
                  <UserAvatar v-if="mutualGroup.avatar" :avatar="mutualGroup.avatar" />
                  <p v-else>{{ mutualGroup.name!.slice(0, 1) }}</p>
                </div>
                <div>
                  <p class="text-sm">
                    {{ mutualGroup.name }}
                  </p>
                  <p class="text-xs text-ctp-subtext0">
                    {{ mutualGroup.members.length + 1 }} Members
                  </p>
                </div>
              </div>
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
  <SettingsModal
    v-if="settingsModal"
    :openTo="SettingsPage.Profile"
    @close="settingsModal = false"
  />
</template>

<script lang="ts" setup>
import { onMounted, type PropType, ref, type Ref, computed } from "vue";
import { SettingsPage, type ICachedUser, type ISpace } from "@/global/types";
import { getCachedUser } from "@/global/helpers";
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
import { useStore } from "@/global/store";
import { ChannelType, UserFlag } from "@/../../hyalus-server/src/types";
import { useRouter } from "vue-router";
import ModalBase from "./ModalBase.vue";
import { FaceFrownIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/vue/24/outline";
import FriendRemoveModal from "./FriendRemoveModal.vue";
import axios from "axios";
import LoadingIcon from "@/icons/LoadingIcon.vue";
import { ServerStackIcon, WrenchScrewdriverIcon } from "@heroicons/vue/20/solid";
import RobotIcon from "@/icons/RobotIcon.vue";
import { messageFormatter } from "@/global/config";
import SettingsModal from "./SettingsModal.vue";

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
const settingsModal = ref(false);

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

const mutualSpaces = computed(() => {
  return store.spaces.filter((space) => space.members.find((member) => member.id === props.id));
});

const mutualGroups = computed(() => {
  return store.channels.filter(
    (channel) =>
      channel.type === ChannelType.Group &&
      channel.members.find((member) => member.id === props.id),
  );
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
