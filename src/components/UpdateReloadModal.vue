<template>
  <ModalBase
    :title="!isDesktop ? 'Reload to Update' : 'Restart to Update'"
    submit-text="Reload"
    @close="$emit('close')"
    @submit="submit"
  >
    <template #icon>
      <RefreshIcon />
    </template>
    <template #main>
      <p class="mb-1">{{ !isDesktop ? "Reload" : "Restart" }} the app for the latest update?</p>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import { isDesktop } from "@/global/helpers";
import ModalBase from "./ModalBase.vue";
import RefreshIcon from "@/icons/RefreshIcon.vue";

defineEmits(["close"]);

const submit = () => {
  if (isDesktop) {
    window.HyalusDesktop!.restart();
  } else {
    location.reload();
  }
};
</script>
