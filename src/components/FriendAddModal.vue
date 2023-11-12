<template>
  <ModalBase title="Add Friend" submit-text="Add" @submit="submit" @close="$emit('close')">
    <template #icon>
      <UserAddIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <div class="w-full space-y-2">
        <p>Username</p>
        <div class="relative">
          <input
            v-model="username"
            class="w-full rounded-md border border-ctp-base bg-ctp-crust px-4 py-2 pl-11 text-ctp-subtext0 shadow-sm ring-ctp-accent transition focus:outline-none focus:ring-2"
            type="text"
            spellcheck="false"
            autofocus
          />
          <div
            class="absolute left-0 top-0 -mt-px ml-1 flex h-full items-center border-r border-ctp-base px-2 text-ctp-subtext0"
          >
            <p>@</p>
          </div>
        </div>
      </div>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalInput from "./ModalInput.vue";
import ModalError from "./ModalError.vue";
import UserAddIcon from "@/icons/UserAddIcon.vue";
import { ref } from "vue";
import { prettyError } from "@/global/helpers";
import axios from "axios";

const emit = defineEmits(["close"]);
const username = ref("");
const error = ref("");

const submit = async () => {
  try {
    await axios.post("/api/v1/friends", {
      username: username.value,
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
