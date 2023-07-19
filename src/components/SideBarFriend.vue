<template>
  <div
    class="group flex cursor-pointer items-center justify-between rounded-md p-1.5 hover:bg-gray-900"
    @click="userModal = true"
  >
    <div class="flex items-center space-x-3">
      <UserAvatar
        :avatar="friend.avatar"
        :status="friend.status"
        class="h-8 w-8 min-w-0 flex-shrink-0 rounded-full"
      />
      <div>
        <p class="truncate text-sm">{{ friend.name }}</p>
        <div class="flex min-w-0 items-center space-x-2 text-xs">
          <p class="truncate text-gray-500 dark:text-gray-400">
            @{{ friend.username }}
          </p>
          <p
            v-if="!friend.accepted && !friend.acceptable"
            class="bg-dark-600 rounded-md px-1 text-xs text-gray-300"
          >
            Pending
          </p>
        </div>
      </div>
    </div>
    <div class="flex space-x-2">
      <div v-if="friend.acceptable" @click.stop="accept">
        <CheckIcon
          class="bg-primary-500 hover:bg-primary-600 h-7 w-7 cursor-pointer rounded-full p-1.5 text-white transition"
        />
      </div>
      <div
        :class="{
          'hidden group-hover:block': friend.accepted,
        }"
        @click.stop="
          if (friend.accepted) {
            removeModal = true;
          } else {
            del();
          }
        "
      >
        <CloseIcon
          class="dark:bg-dark-500 h-7 w-7 cursor-pointer rounded-full bg-gray-200 p-1.5 text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        />
      </div>
    </div>
  </div>
  <UserModal v-if="userModal" :id="friend.id" @close="userModal = false" />
  <FriendRemoveModal
    v-if="removeModal"
    :friend="friend"
    @close="removeModal = false"
  />
</template>

<script lang="ts" setup>
import UserAvatar from "./UserAvatar.vue";
import CheckIcon from "../icons/CheckIcon.vue";
import CloseIcon from "../icons/CloseIcon.vue";
import { PropType, ref } from "vue";
import { IFriend } from "../global/types";
import { SocketMessageType } from "@/../hyalus-server/src/types";
import axios from "axios";
import { useStore } from "../global/store";
import UserModal from "./UserModal.vue";
import FriendRemoveModal from "./FriendRemoveModal.vue";

const store = useStore();
const props = defineProps({
  friend: {
    type: Object as PropType<IFriend>,
    default: null,
  },
});
const userModal = ref(false);
const removeModal = ref(false);

const accept = async () => {
  store.expectedEvent = SocketMessageType.SMessageCreate;

  try {
    await axios.post(`/api/v1/friends`, {
      username: props.friend.username,
    });
  } catch {
    // TODO: should probably handle errors here perhaps...
  }

  store.expectedEvent = null;
};

const del = async () => {
  await axios.delete(`/api/v1/friends/${props.friend.id}`);
};
</script>
