<template>
  <ModalBase
    title="Change Username"
    submit-text="Change"
    @submit="submit"
    @close="$emit('close')"
  >
    <template #icon>
      <AtSymbolIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput v-model="username" type="text" label="Username" autofocus />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalInput from "./ModalInput.vue";
import ModalError from "./ModalError.vue";
import AtSymbolIcon from "../icons/AtSymbolIcon.vue";
import { ref } from "vue";
import { prettyError } from "../global/helpers";
import axios from "axios";
import { useStore } from "../global/store";

const store = useStore();
const emit = defineEmits(["close"]);
const username = ref(store.self?.username || "");
const error = ref("");

const submit = async () => {
  try {
    await axios.post("/api/v1/users/me", {
      username: username.value,
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
