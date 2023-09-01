<template>
  <transition
    enter-active-class="transition transform origin-top-left ease-out duration-100"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition transform origin-top-left ease-in duration-75"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="store.self && show"
      class="absolute z-10 my-1 w-64 select-none overflow-hidden rounded-md bg-ctp-base p-2 text-sm shadow-lg shadow-[#00000040]"
      @mouseup.stop
    >
      <div class="flex items-center justify-between">
        <div class="min-w-0 p-2">
          <p class="font-bold">{{ store.self.name }}</p>
          <p class="truncate text-xs text-ctp-subtext0">@{{ store.self.username }}</p>
        </div>
        <button
          @click="
            settingsModal = true;
            $emit('close');
          "
        >
          <SettingsIcon
            class="h-8 w-8 rounded-full bg-ctp-surface0 p-2 text-ctp-subtext0 transition hover:bg-ctp-surface0/50 hover:text-ctp-text"
          />
        </button>
      </div>
      <div class="my-1 border-t border-ctp-surface0"></div>
      <div
        v-if="!store.self.preferredStatusText"
        class="p-2 flex items-center hover:bg-ctp-surface0/50 transition cursor-pointer rounded-md space-x-3"
        @click="preferredStatusTextModal = true"
      >
        <PlusCircleIcon class="w-4 h-4" />
        <p>Set Custom Status</p>
      </div>
      <div
        v-if="store.self.preferredStatusText"
        class="p-2 flex items-center hover:bg-ctp-surface0/50 transition cursor-pointer rounded-md space-x-3"
        @click="preferredStatusTextModal = true"
      >
        <PencilSquareIcon class="w-4 h-4" />
        <p>Edit Custom Status</p>
      </div>
      <div class="my-1 border-t border-ctp-surface0"></div>
      <div
        class="flex cursor-pointer items-center space-x-3 rounded-md p-2 transition hover:bg-ctp-surface0/50"
        @click="
          setStatus(Status.Online);
          $emit('close');
        "
      >
        <div class="flex h-4 w-4 items-center justify-center">
          <div class="h-2.5 w-2.5 rounded-full bg-ctp-green" />
        </div>
        <p>Online</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-3 rounded-md p-2 transition hover:bg-ctp-surface0/50"
        @click="
          setStatus(Status.Away);
          $emit('close');
        "
      >
        <div class="flex h-4 w-4 items-center justify-center">
          <div class="h-2.5 w-2.5 rounded-full bg-ctp-yellow" />
        </div>
        <p>Away</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-3 rounded-md p-2 transition hover:bg-ctp-surface0/50"
        @click="
          setStatus(Status.Busy);
          $emit('close');
        "
      >
        <div class="flex h-4 w-4 items-center justify-center">
          <div class="h-2.5 w-2.5 rounded-full bg-ctp-red" />
        </div>
        <p>Busy</p>
      </div>
      <div
        class="flex cursor-pointer items-center space-x-3 rounded-md p-2 transition hover:bg-ctp-surface0/50"
        @click="
          setStatus(Status.Offline);
          $emit('close');
        "
      >
        <div class="flex h-4 w-4 items-center justify-center">
          <div class="h-2.5 w-2.5 rounded-full bg-ctp-subtext0" />
        </div>
        <p>Invisible</p>
      </div>
      <div class="my-1 border-t border-ctp-surface0"></div>
      <div
        class="flex cursor-pointer items-center space-x-3 rounded-md p-2 transition hover:bg-ctp-surface0/50"
        @click="
          logoutModal = true;
          $emit('close');
        "
      >
        <LogoutIcon class="h-4 w-4" />
        <p>Log out</p>
      </div>
    </div>
  </transition>
  <LogoutModal v-if="logoutModal" @close="logoutModal = false" />
  <SettingsModal v-if="settingsModal" @close="settingsModal = false" />
  <SetPreferredStatusTextModal
    v-if="preferredStatusTextModal"
    @close="preferredStatusTextModal = false"
  />
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from "vue";
import { Status } from "@/../../hyalus-server/src/types";
import axios from "axios";
import LogoutIcon from "../icons/LogoutIcon.vue";
import LogoutModal from "./LogoutModal.vue";
import SettingsIcon from "../icons/SettingsIcon.vue";
import SettingsModal from "./SettingsModal.vue";
import { useStore } from "../global/store";
import {
  FaceSmileIcon,
  PencilIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  PlusIcon,
} from "@heroicons/vue/20/solid";
import SetPreferredStatusTextModal from "./SetPreferredStatusTextModal.vue";

const store = useStore();
const emit = defineEmits(["close"]);
const logoutModal = ref(false);
const settingsModal = ref(false);
const preferredStatusTextModal = ref(false);
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const setStatus = async (preferredStatus: Status) => {
  await axios.post("/api/v1/users/me", {
    preferredStatus,
  });
};

const close = () => emit("close");
addEventListener("mouseup", close);

onUnmounted(() => {
  removeEventListener("mouseup", close);
});
</script>
