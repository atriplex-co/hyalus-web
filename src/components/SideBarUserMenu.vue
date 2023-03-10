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
      class="dark:bg-dark-900 absolute z-10 my-1 w-48 select-none overflow-hidden rounded-md bg-white p-2 text-sm shadow-lg shadow-[#00000044]"
      @mouseup.stop
    >
      <div class="flex items-center justify-between">
        <div class="min-w-0 p-2">
          <p class="font-bold">{{ store.self.name }}</p>
          <p class="truncate text-xs text-gray-600 dark:text-gray-400">
            @{{ store.self.username }}
          </p>
        </div>
        <div
          @click="
            if ($event.shiftKey) {
              router.push(`/settings/account`);
            } else {
              settingsModal = true;
            }
            $emit('close');
          "
        >
          <SettingsIcon
            class="bg-dark-800 h-8 w-8 rounded-full p-2 text-gray-400 transition hover:text-white"
          />
        </div>
      </div>
      <div class="dark:border-dark-800 my-1 border-t border-gray-100"></div>
      <div
        class="dark:hover:bg-dark-800 flex cursor-pointer items-center space-x-3 rounded-md p-2 transition hover:bg-gray-100"
        @click="
          setStatus(Status.Online);
          $emit('close');
        "
      >
        <div class="flex h-4 w-4 items-center justify-center">
          <div class="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
        <p>Online</p>
      </div>
      <div
        class="dark:hover:bg-dark-800 flex cursor-pointer items-center space-x-3 rounded-md p-2 transition hover:bg-gray-100"
        @click="
          setStatus(Status.Away);
          $emit('close');
        "
      >
        <div class="flex h-4 w-4 items-center justify-center">
          <div class="h-2.5 w-2.5 rounded-full bg-amber-500" />
        </div>
        <p>Away</p>
      </div>
      <div
        class="dark:hover:bg-dark-800 flex cursor-pointer items-center space-x-3 rounded-md p-2 transition hover:bg-gray-100"
        @click="
          setStatus(Status.Busy);
          $emit('close');
        "
      >
        <div class="flex h-4 w-4 items-center justify-center">
          <div class="h-2.5 w-2.5 rounded-full bg-rose-500" />
        </div>
        <p>Busy</p>
      </div>
      <div
        class="dark:hover:bg-dark-800 flex cursor-pointer items-center space-x-3 rounded-md p-2 transition hover:bg-gray-100"
        @click="
          setStatus(Status.Offline);
          $emit('close');
        "
      >
        <div class="flex h-4 w-4 items-center justify-center">
          <div class="h-2.5 w-2.5 rounded-full bg-gray-400" />
        </div>
        <p>Invisible</p>
      </div>
      <div class="dark:border-dark-800 my-1 border-t border-gray-100"></div>
      <div
        class="dark:hover:bg-dark-800 flex cursor-pointer items-center space-x-3 rounded-md p-2 transition hover:bg-gray-100"
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
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from "vue";
import { Status } from "@/src/global/constants";
import axios from "axios";
import LogoutIcon from "../icons/LogoutIcon.vue";
import LogoutModal from "./LogoutModal.vue";
import SettingsIcon from "../icons/SettingsIcon.vue";
import { useRouter } from "vue-router";
import SettingsModal from "./SettingsModal.vue";
import { useStore } from "../global/store";

const store = useStore();
const router = useRouter();
const emit = defineEmits(["close"]);
const logoutModal = ref(false);
const settingsModal = ref(false);
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
