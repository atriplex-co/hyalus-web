<template>
  <ModalBase title="Log Out" submit-text="Log Out" @close="$emit('close')" @submit="submit">
    <template #icon>
      <LogoutIcon />
    </template>
    <template #main>
      <p>Are you sure you want to log out?</p>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import LogoutIcon from "@/icons/LogoutIcon.vue";
import axios from "axios";

defineEmits(["close"]);

const submit = async () => {
  await axios.delete("/api/v1/sessions/current");
};
</script>
