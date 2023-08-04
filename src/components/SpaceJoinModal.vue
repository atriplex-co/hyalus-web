<template>
  <ModalBase title="Join Space" submit-text="Join" @submit="submit" @close="$emit('close')">
    <template #icon>
      <HashtagIcon />
    </template>
    <template #main>
      <p class="text-ctp-accent">
        WARNING: Spaces are currently experimental and may be wiped during development!
      </p>
      <ModalError v-if="error" :error="error" />
      <ModalInput v-model="code" type="text" label="Invite Code/URL" autofocus />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalInput from "./ModalInput.vue";
import ModalError from "./ModalError.vue";
import { ref } from "vue";
import { prettyError } from "../global/helpers";
import axios from "axios";
import { useStore } from "../global/store";
import { SocketMessageType } from "@/../../hyalus-server/src/types";
import { HashtagIcon } from "@heroicons/vue/20/solid";

const store = useStore();
const emit = defineEmits(["close"]);
const code = ref("");
const error = ref("");

const submit = async () => {
  code.value = code.value.split("/").at(-1) ?? "";
  store.expectedEvent = SocketMessageType.SSpaceCreate;

  try {
    await axios.post("/api/v1/spaces/use-invite", {
      code: code.value,
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
