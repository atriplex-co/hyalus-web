<template>
  <ModalBase
    title="Change Phone"
    submit-text="Change"
    @submit="submit"
    @close="$emit('close')"
  >
    <template #icon>
      <PhoneIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput v-model="phone" type="text" label="Phone" autofocus />
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
import { PhoneIcon } from "@heroicons/vue/24/solid";

const store = useStore();
const emit = defineEmits(["close"]);
const phone = ref(store.self?.phone || "");
const error = ref("");

const submit = async () => {
  try {
    await axios.post("/api/v1/users/me", {
      phone: phone.value,
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
