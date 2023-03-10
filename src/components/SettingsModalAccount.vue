<template>
  <div v-if="store.self">
    <p class="text-2xl">Account</p>
    <div class="mt-8 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div
          class="ring-primary-500 dark:border-dark-500 transition-gray-400 relative h-16 w-16 cursor-pointer overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-gray-600 shadow-sm transition dark:bg-dark-800"
          @click="setAvatar"
        >
          <UserAvatar
            v-if="store.self.avatar"
            :avatar="store.self.avatar"
            class="h-16 w-16 cursor-pointer rounded-full"
          />
          <div
            class="absolute inset-0 flex items-center justify-center transition hover:text-black dark:hover:text-white"
            :class="{
              'text-white opacity-0 hover:bg-gray-900 hover:bg-opacity-50 hover:opacity-100':
                store.self.avatar,
            }"
          >
            <ArrowUpOnSquareIcon class="h-5 w-5" />
          </div>
        </div>
        <div class="-space-y-0.5">
          <p class="text-lg font-semibold">{{ store.self.name }}</p>
          <p class="text-sm text-gray-400">@{{ store.self.username }}</p>
        </div>
      </div>
      <p
        class="bg-dark-500 hover:bg-dark-400 cursor-pointer rounded-md px-4 py-2.5 text-sm transition"
        @click="$emit('activate', 'profile')"
      >
        Edit Profile
      </p>
    </div>
    <div class="mt-8 space-y-4">
      <div
        class="bg-dark-500 hover:bg-dark-400 flex cursor-pointer items-center justify-between rounded-md py-3 px-4 transition"
        @click="setUsernameModal = true"
      >
        <div class="flex items-center space-x-4 text-gray-300">
          <AtSymbolIcon class="h-5 w-5" />
          <div>
            <p class="text-xs font-semibold uppercase">Username</p>
            <p class="-mb-0.5 text-sm">{{ store.self.username }}</p>
          </div>
        </div>
        <PencilIcon class="h-4 w-4" />
      </div>
      <div
        class="bg-dark-500 hover:bg-dark-400 flex cursor-pointer items-center justify-between rounded-md py-3 px-4 transition"
        @click="setEmailModal = true"
      >
        <div class="flex items-center space-x-4 text-gray-300">
          <EnvelopeIcon class="h-5 w-5" />
          <div>
            <p class="text-xs font-semibold uppercase">Email</p>
            <p class="-mb-0.5 text-sm">{{ store.self.email }}</p>
          </div>
        </div>
        <PencilIcon class="h-4 w-4" />
      </div>
      <div
        class="bg-dark-500 hover:bg-dark-400 flex cursor-pointer items-center justify-between rounded-md py-3 px-4 transition"
        @click="setPhoneModal = true"
      >
        <div class="flex items-center space-x-4 text-gray-300">
          <PhoneIcon class="h-5 w-5" />
          <div>
            <p class="text-xs font-semibold uppercase">Phone</p>
            <p class="-mb-0.5 text-sm">{{ store.self.phone || "N/A" }}</p>
          </div>
        </div>
        <PencilIcon class="h-4 w-4" />
      </div>
      <div
        class="bg-dark-500 hover:bg-dark-400 flex cursor-pointer items-center justify-between rounded-md py-3 px-4 transition"
        @click="setPasswordModal = true"
      >
        <div class="flex items-center space-x-4 text-gray-300">
          <LockClosedIcon class="h-5 w-5" />
          <div>
            <p class="text-xs font-semibold uppercase">Password</p>
            <p class="-mb-0.5 text-sm">
              Updated {{ store.self.authKeyUpdatedAt.toISOString() }}
            </p>
          </div>
        </div>
        <PencilIcon class="h-4 w-4" />
      </div>
      <div
        class="bg-dark-500 hover:bg-dark-400 flex cursor-pointer items-center justify-between rounded-md py-3 px-4 transition"
        @click="totpModal = true"
      >
        <div class="flex items-center space-x-4 text-gray-300">
          <ShieldCheckIcon class="h-5 w-5" />
          <div>
            <p class="text-xs font-semibold uppercase">2FA</p>
            <p class="-mb-0.5 text-sm">
              {{ store.self.totpEnabled ? "Enabled" : "Disabled" }}
            </p>
          </div>
        </div>
        <PencilIcon class="h-4 w-4" />
      </div>
    </div>
    <SetUsernameModal
      v-if="setUsernameModal"
      @close="setUsernameModal = false"
    />
    <SetEmailModal v-if="setEmailModal" @close="setEmailModal = false" />
    <SetPhoneModal v-if="setPhoneModal" @close="setPhoneModal = false" />
    <SetPasswordModal
      v-if="setPasswordModal"
      @close="setPasswordModal = false"
    />
    <TotpEnableModal
      v-if="!store.self.totpEnabled && totpModal"
      @close="totpModal = false"
    />
    <TotpDisableModal
      v-if="store.self.totpEnabled && totpModal"
      @close="totpModal = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ArrowUpOnSquareIcon } from "@heroicons/vue/24/outline";
import {
  AtSymbolIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PencilIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@heroicons/vue/24/solid";
import axios from "axios";
import { ref } from "vue";
import { useStore } from "../global/store";
import SetEmailModal from "./SetEmailModal.vue";
import SetPasswordModal from "./SetPasswordModal.vue";
import SetPhoneModal from "./SetPhoneModal.vue";
import SetUsernameModal from "./SetUsernameModal.vue";
import TotpEnableModal from "./TotpEnableModal.vue";
import TotpDisableModal from "./TotpDisableModal.vue";
import UserAvatar from "./UserAvatar.vue";

defineEmits(["activate"]);

const store = useStore();

const setUsernameModal = ref(false);
const setEmailModal = ref(false);
const setPhoneModal = ref(false);
const setPasswordModal = ref(false);
const totpModal = ref(false);

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
</script>
