<template>
  <ModalBase
    title="Create Space"
    submit-text="Create"
    @submit="submit"
    @close="$emit('close')"
  >
    <template #icon>
      <PlusIcon />
    </template>
    <template #main>
      <p class="text-primary-500">
        WARNING: Spaces are currently experimental and may be wiped during
        development!
      </p>
      <ModalError v-if="error" :error="error" />
      <ModalInput v-model="name" type="text" label="Name" autofocus />
    </template>
    <template #submit>
      <button
        class="dark:bg-dark-500 bg-primary-500 hover:bg-primary-600 dark:hover:bg-dark-400 cursor-pointer rounded-md px-4 py-2 text-gray-400 shadow-sm transition hover:text-white"
        @click="
          $emit('close');
          $emit('join');
        "
      >
        Join Space
      </button>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalInput from "./ModalInput.vue";
import ModalError from "./ModalError.vue";
import { ref } from "vue";
import { prettyError } from "../global/helpers";
import PlusIcon from "../icons/PlusIcon.vue";
import axios from "axios";
import { useStore } from "../global/store";
import { SocketMessageType } from "@/src/global/constants";

const store = useStore();
const emit = defineEmits(["close", "join"]);
const name = ref("");
const error = ref("");

const submit = async () => {
  store.expectedEvent = SocketMessageType.SSpaceCreate;

  try {
    await axios.post("/api/v1/spaces", {
      name: name.value,
    });
  } catch (e) {
    error.value = prettyError(e);
    store.expectedEvent = null;
    return;
  }

  store.expectedEvent = null;
  emit("close");
};
</script>
