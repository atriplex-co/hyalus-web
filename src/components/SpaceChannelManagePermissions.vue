<template>
  <div>
    <p class="text-2xl">Permissions</p>
    <div v-if="channel.parentId" class="mt-8 flex items-center space-x-4">
      <InputBoolean v-model="sync" />
      <p>Sync Permissions</p>
    </div>
    <div v-if="!sync" class="mt-8 flex space-x-4">
      <div class="5 w-48 space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-gray-400">
            {{ channel.overrides.length }} Override{{
              channel.overrides.length !== 1 ? "s" : ""
            }}
          </p>
          <div class="relative">
            <PlusIcon
              class="h-4 w-4 cursor-pointer transition hover:text-white"
              @click="createModal = !createModal"
            />
            <div
              v-if="createModal"
              class="absolute right-0 top-6 h-64 w-48 overflow-auto rounded-md bg-gray-900 p-1.5 shadow-md"
            >
              <div>
                <p class="p-1.5 text-sm font-semibold text-gray-400">Roles</p>
                <div
                  v-for="role in space.roles"
                  :key="role.id"
                  class="hover:bg-dark-800 flex cursor-pointer items-center space-x-2 rounded-md py-1.5 px-2 text-sm"
                  @click="create(SpaceChannelOverrideType.Role, role.id)"
                >
                  <div
                    class="h-2.5 w-2.5 rounded-full bg-gray-500"
                    :style="
                      role.color
                        ? `background: #${role.color
                            .toString(16)
                            .padStart(6, '0')};`
                        : ''
                    "
                  ></div>
                  <p>{{ role.name }}</p>
                </div>
              </div>
              <div>
                <p class="p-1.5 text-sm font-semibold text-gray-400">Members</p>
                <div
                  v-for="member in space.members"
                  :key="member.id"
                  class="hover:bg-dark-800 flex cursor-pointer items-center space-x-3 rounded-md py-1.5 px-2 text-sm"
                  @click="create(SpaceChannelOverrideType.Member, member.id)"
                >
                  <UserAvatar :avatar="member.avatar" class="h-6 w-6" />
                  <div>
                    <p>{{ member.name }}</p>
                    <p class="text-xs text-gray-400">@{{ member.username }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="space-y-0.5 overflow-auto">
          <button
            v-for="override in roleOverrides"
            :key="override.override.id"
            class="hover:bg-dark-800 flex w-full items-center space-x-2 rounded-md py-1.5 px-2 text-sm transition"
            :class="{
              'bg-dark-800': id === override.override.id,
            }"
            @click="id = override.override.id"
          >
            <div
              class="h-2.5 w-2.5 rounded-full bg-gray-500"
              :style="
                override.role.color
                  ? `background: #${override.role.color
                      .toString(16)
                      .padStart(6, '0')};`
                  : ''
              "
            ></div>
            <p>{{ override.role.name }}</p>
          </button>
          <button
            class="hover:bg-dark-800 flex w-full items-center space-x-2 rounded-md py-1.5 px-2 text-sm transition"
            :class="{
              'bg-dark-800': id === '',
            }"
            @click="id = ''"
          >
            <div class="h-2.5 w-2.5 rounded-full bg-gray-500"></div>
            <p>@everyone</p>
          </button>
          <button
            v-for="override in memberOverrides"
            :key="override.override.id"
            class="hover:bg-dark-800 flex w-full items-center space-x-2 rounded-md py-1.5 px-2 text-sm transition"
            :class="{
              'bg-dark-800': id === override.override.id,
            }"
            @click="id = override.override.id"
          >
            <UserAvatar :avatar="override.member.avatar" class="h-5 w-5" />
            <p>{{ override.member.name }}</p>
          </button>
        </div>
      </div>
      <div class="flex-1 space-y-4 overflow-auto">
        <SpacePermissionsEditor
          :show-channels="true"
          :show-text-channels="
            [ChannelType.SpaceCategory, ChannelType.SpaceText].includes(
              channel.type,
            )
          "
          :show-voice-channels="
            [ChannelType.SpaceCategory, ChannelType.SpaceVoice].includes(
              channel.type,
            )
          "
          :space="space"
          :allow="allow"
          :deny="deny"
          @update:allow="allow = $event"
          @update:deny="deny = $event"
        />
        <div class="space-x-4">
          <button
            class="bg-dark-400 hover:bg-dark-200 rounded-md py-2 px-6 text-sm transition"
            @click="save"
          >
            Save
          </button>
          <button
            v-if="id"
            class="bg-dark-400 hover:bg-dark-200 rounded-md py-2 px-6 text-sm transition"
            @click="deleteModal = true"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    <SpaceChannelSyncModal
      v-if="syncModal"
      :channel="channel"
      @close="syncModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon } from "@heroicons/vue/20/solid";
import axios from "axios";
import { ChannelType, SpaceChannelOverrideType } from "@/../hyalus-server/src/types";
import { computed, PropType, ref, watch } from "vue";
import {
  IChannel,
  IChannelOverride,
  ISpace,
  ISpaceMember,
  ISpaceRole,
} from "../global/types";
import InputBoolean from "./InputBoolean.vue";
import SpaceChannelSyncModal from "./SpaceChannelSyncModal.vue";
import SpacePermissionsEditor from "./SpacePermissionsEditor.vue";
import UserAvatar from "./UserAvatar.vue";

const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
  channel: {
    type: Object as PropType<IChannel>,
    default() {
      //
    },
  },
});
const id = ref("");
const type = ref(SpaceChannelOverrideType.Everyone);
const scope = ref<string | null>(null);
const allow = ref(0);
const deny = ref(0);
const createModal = ref(false);
const deleteModal = ref(false);
const syncModal = ref(false);
const sync = computed({
  get() {
    return !!(props.channel.parentId && !props.channel.overrides.length);
  },
  async set() {
    syncModal.value = true;
  },
});
const roleOverrides = computed(() =>
  (
    props.channel.overrides
      .filter((override) => override.type === SpaceChannelOverrideType.Role)
      .map((override) => ({
        override,
        role: props.space.roles.find((role) => role.id === override.scope),
      }))
      .filter((override) => override.role) as {
      override: IChannelOverride;
      role: ISpaceRole;
    }[]
  ).sort((a, b) =>
    (a.role?.position ?? 0) > (b.role?.position ?? 0) ? 1 : -1,
  ),
);
const memberOverrides = computed(() =>
  (
    props.channel.overrides
      .filter((override) => override.type === SpaceChannelOverrideType.Member)
      .map((override) => ({
        override,
        member: props.space.members.find(
          (member) => member.id === override.scope,
        ),
      }))
      .filter((override) => override.member) as {
      override: IChannelOverride;
      member: ISpaceMember;
    }[]
  ).sort((a, b) => ((a.member?.name ?? "") > (b.member?.name ?? "") ? 1 : -1)),
);

const save = async () => {
  await axios.post(
    `/api/v1/spaces/${props.space.id}/channels/${props.channel.id}/overrides`,
    {
      type: type.value,
      scope: scope.value,
      allow: allow.value,
      deny: deny.value,
    },
  );
};

const update = () => {
  const override =
    props.channel.overrides.find((override) => override.id === id.value) ??
    props.channel.overrides.find(
      (override) => override.type === SpaceChannelOverrideType.Everyone,
    );
  if (override) {
    type.value = override.type;
    scope.value = override.scope;
    allow.value = override.allow;
    deny.value = override.deny;
  } else {
    id.value = "";
    type.value = SpaceChannelOverrideType.Everyone;
    scope.value = null;
    allow.value = 0;
    deny.value = 0;
  }
};

const create = async (type: SpaceChannelOverrideType, scope: string) => {
  createModal.value = false;
  await axios.post(
    `/api/v1/spaces/${props.space.id}/channels/${props.channel.id}/overrides`,
    {
      type,
      scope,
      allow: 0,
      deny: 0,
    },
  ); // TODO: error handling in SplitModals
};

const openOverride = roleOverrides.value[0];
if (openOverride) {
  id.value = openOverride.override.id;
}

update();
watch(
  () => id.value,
  () => {
    update();
  },
);
</script>
