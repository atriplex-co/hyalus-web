<template>
  <ModalBase
    v-if="store.self"
    title="Welcome to Hyalus"
    submit-text="Next"
    required
    @submit="submit"
  >
    <template #icon>
      <SparklesIcon />
    </template>
    <template #main>
      <template v-if="stage === 0">
        <ModalError v-if="error" :error="error" />
        <p>Get started by setting up your account.</p>
        <div
          class="relative h-16 w-16 cursor-pointer overflow-hidden rounded-full bg-ctp-crust shadow-sm ring-ctp-accent transition"
          @click="setAvatar"
        >
          <UserAvatar
            v-if="store.self.avatar"
            :avatar="store.self.avatar"
            class="h-16 w-16 cursor-pointer rounded-full"
          />
          <div
            class="absolute inset-0 flex items-center justify-center text-ctp-subtext0 transition hover:bg-ctp-crust/50 hover:text-ctp-text"
            :class="{
              'opacity-0 hover:opacity-100': store.self.avatar,
            }"
          >
            <ArrowUpOnSquareIcon class="h-5 w-5" />
          </div>
        </div>
        <ModalInput v-model="name" type="text" label="Name" />
        <div class="w-full space-y-2">
          <p>Username</p>
          <div class="relative">
            <input
              v-model="username"
              class="w-full rounded-md border border-ctp-base bg-ctp-crust px-4 py-2 pl-11 text-ctp-subtext0 shadow-sm ring-ctp-accent transition focus:outline-none focus:ring-2"
              type="text"
              spellcheck="false"
              @input="usernameEdited = true"
            />
            <div
              class="absolute left-0 top-0 -mt-px ml-1 flex h-full items-center border-r border-ctp-base px-2 text-ctp-subtext0"
            >
              <p>@</p>
            </div>
            <div class="absolute right-0 top-0 h-full px-3 py-2">
              <div
                v-if="usernameCheckOk === 1"
                class="flex h-full items-center space-x-1 rounded-md bg-ctp-accent px-1 text-xs text-ctp-base"
              >
                <CheckIcon class="h-4 w-4" />
                <p>Available</p>
              </div>
              <div
                v-if="usernameCheckOk === 2"
                class="flex h-full items-center space-x-1 rounded-md bg-ctp-red px-1 text-xs text-ctp-base"
              >
                <XMarkIcon class="h-4 w-4" />
                <p>Taken</p>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="stage === 1">
        <div class="w-full space-y-2">
          <p>Color Mode</p>
          <InputList class="w-80">
            <template #selected>
              <div
                class="h-3 w-3 rounded-full"
                :class="{
                  'bg-gray-500': colorMode === ColorMode.Dark,
                  'bg-black': colorMode === ColorMode.DarkOLED,
                  'bg-gray-300': colorMode === ColorMode.Light,
                }"
              />
              <p>
                {{ formatColorMode(colorMode) }}
              </p>
            </template>
            <template #items>
              <InputListItem
                v-for="usableColorMode in usableColorModes"
                :key="usableColorMode"
                @click="colorMode = usableColorMode"
              >
                <div
                  class="h-3 w-3 rounded-full"
                  :class="{
                    'bg-gray-500': usableColorMode === ColorMode.Dark,
                    'bg-black': usableColorMode === ColorMode.DarkOLED,
                    'bg-gray-300': usableColorMode === ColorMode.Light,
                  }"
                />
                <p>
                  {{ formatColorMode(usableColorMode) }}
                </p>
              </InputListItem>
            </template>
          </InputList>
        </div>
      </template>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import { watch, ref, nextTick, computed } from "vue";
import { SparklesIcon, CheckIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import { ArrowUpOnSquareIcon } from "@heroicons/vue/24/outline";
import ModalError from "./ModalError.vue";
import ModalInput from "./ModalInput.vue";
import axios from "axios";
import { useStore } from "@/global/store";
import UserAvatar from "./UserAvatar.vue";
import { prettyError } from "@/global/helpers";
import { ColorMode } from "@/../../hyalus-server/src/types";
import InputList from "./InputList.vue";
import InputListItem from "./InputListItem.vue";

const store = useStore();
const emit = defineEmits(["close"]);
const error = ref("");
const name = ref("");
const username = ref("");
const usernameCheckOk = ref(0); // 0 = unknown, 1 = good, 2 = bad
const usernameEdited = ref(false);
const stage = ref(0); // WIP

const submit = async () => {
  try {
    if (stage.value === 0) {
      await axios.post(`/api/v1/users/me`, {
        name: name.value,
        username: username.value,
      });
    }
  } catch (e: unknown) {
    error.value = prettyError(e);
  }

  emit("close");
};

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

const usableColorModes = [ColorMode.Light, ColorMode.Dark, ColorMode.DarkOLED];

const colorMode = computed({
  get() {
    return store.config.colorMode;
  },
  async set(colorMode) {
    await store.writeConfig("colorMode", colorMode);

    if (store.config.colorSync) {
      await axios.post("/api/v1/users/me", {
        colorMode,
      });
    }
  },
});

const formatColorMode = (val: ColorMode) => {
  return {
    [ColorMode.Light + ""]: "Light",
    [ColorMode.Dark + ""]: "Dark",
    [ColorMode.DarkOLED + ""]: "Dark (OLED)",
  }[val + ""];
};

let usernameCheckTimeout = 0;

watch(
  () => name.value,
  async () => {
    await nextTick(); // forces input element to update.

    name.value = name.value.trimStart();
    name.value = name.value.slice(0, 30);

    if (!usernameEdited.value) {
      username.value = name.value;
    }
  },
);

watch(
  () => username.value,
  async () => {
    await nextTick(); // forces input element to update.

    username.value = username.value.toLowerCase();
    username.value = username.value.replaceAll(" ", "_");
    username.value = username.value.replace(/[^a-z0-9_]/gi, "");
    username.value = username.value.slice(0, 24);

    usernameCheckOk.value = 0;
    clearTimeout(usernameCheckTimeout);

    if (username.value.length > 2) {
      usernameCheckTimeout = +setTimeout(async () => {
        try {
          await axios.get(`/api/v1/users/by-username/${username.value}`);
          usernameCheckOk.value = 2;
        } catch {
          usernameCheckOk.value = 1;
        }
      }, 100);
    }
  },
);
</script>
