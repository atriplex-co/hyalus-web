<template>
  <div
    v-if="store.self && !(store.config.streamerModeEnabled && store.config.streamerModeHideAccount)"
  >
    <p class="text-2xl">Account</p>
    <div class="mt-8 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div
          class="transition-gray-400 relative h-16 w-16 cursor-pointer overflow-hidden rounded-full bg-ctp-crust text-ctp-overlay0 shadow-sm ring-ctp-accent transition"
          @click="setAvatar"
        >
          <UserAvatar
            v-if="store.self.avatar"
            :avatar="store.self.avatar"
            class="h-16 w-16 cursor-pointer rounded-full"
          />
          <div
            class="absolute inset-0 flex items-center justify-center transition hover:text-ctp-text"
            :class="{
              'opacity-0 hover:bg-ctp-crust/50 hover:opacity-100': store.self.avatar,
            }"
          >
            <ArrowUpOnSquareIcon class="h-5 w-5" />
          </div>
        </div>
        <div class="-space-y-0.5">
          <p class="text-lg font-semibold">{{ store.self.name }}</p>
          <p class="text-sm text-ctp-subtext0">@{{ store.self.username }}</p>
        </div>
      </div>
      <p
        class="cursor-pointer rounded-md bg-ctp-surface0/50 px-4 py-2.5 text-sm transition hover:bg-ctp-base"
        @click="$emit('activate', SettingsPage.Profile)"
      >
        Edit Profile
      </p>
    </div>
    <div class="mt-8 space-y-4">
      <div
        class="flex cursor-pointer items-center justify-between rounded-md bg-ctp-surface0/50 px-4 py-3 transition hover:bg-ctp-base"
        @click="setUsernameModal = true"
      >
        <div class="flex items-center space-x-4">
          <AtSymbolIcon class="h-5 w-5" />
          <div>
            <p class="text-xs font-semibold uppercase">Username</p>
            <p class="-mb-0.5 text-sm">{{ store.self.username }}</p>
          </div>
        </div>
        <PencilIcon class="h-4 w-4" />
      </div>
      <div
        class="flex cursor-pointer items-center justify-between rounded-md bg-ctp-surface0/50 px-4 py-3 transition hover:bg-ctp-base"
        @click="setEmailModal = true"
      >
        <div class="flex items-center space-x-4">
          <EnvelopeIcon class="h-5 w-5" />
          <div>
            <p class="text-xs font-semibold uppercase">Email</p>
            <p class="-mb-0.5 text-sm">{{ store.self.email }}</p>
          </div>
        </div>
        <PencilIcon class="h-4 w-4" />
      </div>
      <div
        class="flex cursor-pointer items-center justify-between rounded-md bg-ctp-surface0/50 px-4 py-3 transition hover:bg-ctp-base"
        @click="setPhoneModal = true"
      >
        <div class="flex items-center space-x-4">
          <PhoneIcon class="h-5 w-5" />
          <div>
            <p class="text-xs font-semibold uppercase">Phone</p>
            <p class="-mb-0.5 text-sm">{{ store.self.phone || "N/A" }}</p>
          </div>
        </div>
        <PencilIcon class="h-4 w-4" />
      </div>
      <div
        class="flex cursor-pointer items-center justify-between rounded-md bg-ctp-surface0/50 px-4 py-3 transition hover:bg-ctp-base"
        @click="setPasswordModal = true"
      >
        <div class="flex items-center space-x-4">
          <LockClosedIcon class="h-5 w-5" />
          <div>
            <p class="text-xs font-semibold uppercase">Password</p>
            <p class="-mb-0.5 text-sm">Updated {{ store.self.authKeyUpdatedAt.toISOString() }}</p>
          </div>
        </div>
        <PencilIcon class="h-4 w-4" />
      </div>
      <div
        class="flex cursor-pointer items-center justify-between rounded-md bg-ctp-surface0/50 px-4 py-3 transition hover:bg-ctp-base"
        @click="totpModal = true"
      >
        <div class="flex items-center space-x-4">
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
    <SetUsernameModal v-if="setUsernameModal" @close="setUsernameModal = false" />
    <SetEmailModal v-if="setEmailModal" @close="setEmailModal = false" />
    <SetPhoneModal v-if="setPhoneModal" @close="setPhoneModal = false" />
    <SetPasswordModal v-if="setPasswordModal" @close="setPasswordModal = false" />
    <TotpEnableModal v-if="!store.self.totpEnabled && totpModal" @close="totpModal = false" />
    <TotpDisableModal v-if="store.self.totpEnabled && totpModal" @close="totpModal = false" />
  </div>
  <div v-else class="flex h-full flex-col items-center justify-center space-y-4 text-ctp-subtext0">
    <TvIcon class="h-10 w-10" />
    <p>Streamer Mode Enabled</p>
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
  TvIcon,
} from "@heroicons/vue/24/solid";
import axios from "axios";
import { ref } from "vue";
import { useStore } from "@/global/store";
import SetEmailModal from "./SetEmailModal.vue";
import SetPasswordModal from "./SetPasswordModal.vue";
import SetPhoneModal from "./SetPhoneModal.vue";
import SetUsernameModal from "./SetUsernameModal.vue";
import TotpEnableModal from "./TotpEnableModal.vue";
import TotpDisableModal from "./TotpDisableModal.vue";
import UserAvatar from "./UserAvatar.vue";
import { SettingsPage } from "@/global/types";

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
