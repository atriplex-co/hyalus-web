<template>
  <ModalBase
    v-if="store.self"
    :title="store.self.emailVerified ? 'Change Email' : 'Verify Email'"
    :submit-text="store.self.emailVerified ? 'Change' : 'Verify'"
    @submit="submit"
    @close="$emit('close')"
  >
    <template #icon>
      <EnvelopeIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput v-model="email" type="text" label="Email" autofocus />
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
import { EnvelopeIcon } from "@heroicons/vue/24/solid";

const store = useStore();
const emit = defineEmits(["close"]);
const email = ref("");
const error = ref("");

const submit = async () => {
  try {
    await axios.post("/api/v1/users/me", {
      email: email.value,
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};

if (store.self && !store.self.email.endsWith("@hyalus.app")) {
  email.value = store.self.email;
} else {
  email.value = "";
}
</script>
