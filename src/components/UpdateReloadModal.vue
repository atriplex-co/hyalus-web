<template>
  <ModalBase title="Reload to Update" submit-text="Reload" @close="$emit('close')" @submit="submit">
    <template #icon>
      <RefreshIcon />
    </template>
    <template #main>
      <p class="mb-1">Reload the app for the latest update?</p>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import RefreshIcon from "@/icons/RefreshIcon.vue";

defineEmits(["close"]);

const submit = () => {
  location.reload();
};
</script>
