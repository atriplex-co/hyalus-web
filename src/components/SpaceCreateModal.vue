<template>
  <ModalBase title="Create Space" submit-text="Create" @submit="submit" @close="$emit('close')">
    <template #icon>
      <PlusIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput v-model="name" type="text" label="Name" autofocus />
    </template>
    <template #submit>
      <button
        class="hover:bg-ctp-base:bg-dark-400 cursor-pointer rounded-md bg-ctp-base px-4 py-2 text-ctp-subtext0 shadow-sm transition hover:text-white"
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
import { prettyError } from "@/global/helpers";
import PlusIcon from "@/icons/PlusIcon.vue";
import axios from "axios";
import { useStore } from "@/global/store";
import { SocketMessageType } from "@/../../hyalus-server/src/types";

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
