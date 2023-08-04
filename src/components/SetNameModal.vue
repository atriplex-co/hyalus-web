<template>
  <ModalBase title="Change Name" submit-text="Change" @submit="submit" @close="$emit('close')">
    <template #icon>
      <IdentityIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput v-model="name" type="text" label="Name" autofocus />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalInput from "./ModalInput.vue";
import ModalError from "./ModalError.vue";
import IdentityIcon from "../icons/IdentityIcon.vue";
import { ref } from "vue";
import { prettyError } from "../global/helpers";
import axios from "axios";
import { useStore } from "../global/store";

const store = useStore();
const emit = defineEmits(["close"]);
const name = ref(store.self?.name || "");
const error = ref("");

const submit = async () => {
  try {
    await axios.post("/api/v1/users/me", {
      name: name.value,
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
