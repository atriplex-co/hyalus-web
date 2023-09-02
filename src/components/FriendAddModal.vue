<template>
  <ModalBase title="Add Friend" submit-text="Add" @submit="submit" @close="$emit('close')">
    <template #icon>
      <UserAddIcon />
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
