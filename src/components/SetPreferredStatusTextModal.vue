<template>
  <ModalBase
    @close="$emit('close')"
    @submit="submit"
    :title="!store.self!.preferredStatus ? 'Set Custom Status' : 'Edit Custom Status'"
  >
    <template #icon>
      <PlusCircleIcon v-if="!store.self!.preferredStatus" />
      <PencilSquareIcon v-if="store.self!.preferredStatus" />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput type="text" label="Custom Status" v-model="preferredStatusText" />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import { useStore } from "@/global/store";
import ModalBase from "./ModalBase.vue";
import { ref } from "vue";
import axios from "axios";
import { prettyError } from "@/global/helpers";
import { PencilSquareIcon, PlusCircleIcon } from "@heroicons/vue/20/solid";
import ModalError from "./ModalError.vue";
import ModalInput from "./ModalInput.vue";

const emit = defineEmits(["close"]);
const store = useStore();
const error = ref("");
const preferredStatusText = ref(store.self!.preferredStatusText);

const submit = async () => {
  try {
    await axios.post("/api/v1/users/me", {
      preferredStatusText: preferredStatusText.value,
    });
  } catch (e: unknown) {
    error.value = prettyError(e);
    return;
  }
  emit("close");
};
</script>
