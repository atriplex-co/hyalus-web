<template>
  <div v-if="store.self" class="flex-1 overflow-auto">
    <div class="flex h-14 items-center px-4 text-lg font-bold">
      <router-link
        v-if="isMobile"
        class="ml-2 mr-4 h-8 w-8 rounded-full bg-gray-600 p-1.5 text-gray-300 transition hover:bg-gray-500"
        to="/settings"
      >
        <ArrowLeftIcon />
      </router-link>
      <p>Account</p>
    </div>
    <div
      class="dark:divide-dark-800 dark:border-dark-800 divide-y divide-gray-100 border-t border-b border-gray-100"
    >
      <div class="flex h-16 items-center justify-between px-6">
        <div class="flex items-center">
          <p class="w-48 font-bold">Avatar</p>
          <UserAvatar
            :avatar="store.self.avatar"
            class="h-8 w-8 rounded-full"
          />
        </div>
        <div
          class="bg-primary-500 hover:bg-primary-600 h-8 w-8 cursor-pointer rounded-full p-2 text-white transition"
          @click="setAvatar"
        >
          <PencilIcon />
        </div>
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <div class="flex">
          <p class="w-48 font-bold">Name</p>
          <p class="text-gray-500 dark:text-gray-400">{{ store.self.name }}</p>
        </div>
        <div
          class="bg-primary-500 hover:bg-primary-600 h-8 w-8 cursor-pointer rounded-full p-2 text-white transition"
          @click="setNameModal = true"
        >
          <PencilIcon />
        </div>
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <div class="flex">
          <p class="w-48 font-bold">Username</p>
          <p class="text-gray-500 dark:text-gray-400">
            @{{ store.self.username }}
          </p>
        </div>
        <div
          class="bg-primary-500 hover:bg-primary-600 h-8 w-8 cursor-pointer rounded-full p-2 text-white transition"
          @click="setUsernameModal = true"
        >
          <PencilIcon />
        </div>
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <div class="flex">
          <p class="w-48 font-bold">Email</p>
          <div class="flex items-center space-x-2">
            <p class="text-gray-500 dark:text-gray-400">
              {{ store.self.email }}
            </p>
            <CheckCircleIcon
              v-if="store.self.emailVerified"
              class="-m-1 h-5 w-5 text-green-500"
            />
            <ExclamationCircleIcon
              v-if="!store.self.emailVerified"
              class="-m-1 h-5 w-5 text-yellow-500"
            />
          </div>
        </div>
        <div
          class="bg-primary-500 hover:bg-primary-600 h-8 w-8 cursor-pointer rounded-full p-2 text-white transition"
          @click="setEmailModal = true"
        >
          <PencilIcon />
        </div>
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <div class="flex">
          <p class="w-48 font-bold">Phone</p>
          <p class="text-gray-500 dark:text-gray-400">
            {{ store.self.phone || "N/A" }}
          </p>
        </div>
        <div
          class="bg-primary-500 hover:bg-primary-600 h-8 w-8 cursor-pointer rounded-full p-2 text-white transition"
          @click="setPhoneModal = true"
        >
          <PencilIcon />
        </div>
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <div class="flex">
          <p class="w-48 font-bold">Password</p>
          <p class="text-gray-500 dark:text-gray-400">{{ authKeyUpdated }}</p>
        </div>
        <div
          class="bg-primary-500 hover:bg-primary-600 h-8 w-8 cursor-pointer rounded-full p-2 text-white transition"
          @click="setPasswordModal = true"
        >
          <PencilIcon />
        </div>
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <div class="flex">
          <p class="w-48 font-bold">2FA</p>
          <p class="text-gray-500 dark:text-gray-400">
            {{ totpEnabled ? "Enabled" : "Disabled" }}
          </p>
        </div>
        <InputBoolean v-model="totpEnabled" />
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <div class="flex">
          <p class="w-48 font-bold">Typing Indicators</p>
          <p class="text-gray-500 dark:text-gray-400">
            {{ typingEvents ? "Enabled" : "Disabled" }}
          </p>
        </div>
        <InputBoolean v-model="typingEvents" />
      </div>
    </div>
    <SetNameModal v-if="setNameModal" @close="setNameModal = false" />
    <SetUsernameModal
      v-if="setUsernameModal"
      @close="setUsernameModal = false"
    />
    <SetPasswordModal
      v-if="setPasswordModal"
      @close="setPasswordModal = false"
    />
    <TotpEnableModal v-if="totpEnableModal" @close="totpEnableModal = false" />
    <TotpDisableModal
      v-if="totpDisableModal"
      @close="totpDisableModal = false"
    />
    <SetEmailModal v-if="setEmailModal" @close="setEmailModal = false" />
    <SetPhoneModal v-if="setPhoneModal" @close="setPhoneModal = false" />
  </div>
</template>

<script lang="ts" setup>
import InputBoolean from "../components/InputBoolean.vue";
import UserAvatar from "../components/UserAvatar.vue";
import SetNameModal from "../components/SetNameModal.vue";
import SetUsernameModal from "../components/SetUsernameModal.vue";
import SetPasswordModal from "../components/SetPasswordModal.vue";
import TotpEnableModal from "../components/TotpEnableModal.vue";
import TotpDisableModal from "../components/TotpDisableModal.vue";
import PencilIcon from "../icons/PencilIcon.vue";
import { ref, computed } from "vue";
import { isMobile } from "../global/helpers";
import ArrowLeftIcon from "../icons/ArrowLeftIcon.vue";
import axios from "axios";
import { useStore } from "../global/store";
import SetEmailModal from "../components/SetEmailModal.vue";
import SetPhoneModal from "../components/SetPhoneModal.vue";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/20/solid";

const store = useStore();
const setNameModal = ref(false);
const setUsernameModal = ref(false);
const setPasswordModal = ref(false);
const totpEnableModal = ref(false);
const totpDisableModal = ref(false);
const setEmailModal = ref(false);
const setPhoneModal = ref(false);

const authKeyUpdated = computed(() => {
  if (!store.self) {
    return "";
  }

  return `Updated ${store.self.authKeyUpdatedAt.toLocaleDateString()}`;
});

const totpEnabled = computed({
  get() {
    if (!store.self) {
      return false;
    }

    return store.self.totpEnabled;
  },
  set(val: boolean) {
    if (val) {
      totpEnableModal.value = true;
    } else {
      totpDisableModal.value = true;
    }
  },
});

const typingEvents = computed({
  get() {
    if (!store.self) {
      return true;
    }

    return store.self.typingEvents;
  },
  async set(val: boolean) {
    await axios.post("/api/v1/users/me", {
      typingEvents: val,
    });
  },
});

const setAvatar = async () => {
  const el = document.createElement("input");

  el.addEventListener("input", async () => {
    if (!el.files) {
      return;
    }

    const form = new FormData();
    form.append("avatar", el.files[0]);

    await axios.post("/api/v1/users/me/avatar", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  });

  el.type = "file";
  el.click();
};

document.title = `Hyalus \u2022 Account`;
store.sideBarOpen = false;
</script>
