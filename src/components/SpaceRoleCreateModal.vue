<template>
  <ModalBase
    title="Create Role"
    submit-text="Create"
    @submit="submit"
    @close="$emit('close')"
  >
    <template #icon>
      <PlusIcon />
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
import { PropType, ref } from "vue";
import { prettyError } from "../global/helpers";
import axios from "axios";
import { PlusIcon } from "@heroicons/vue/20/solid";
import { ISpace } from "../global/types";

const emit = defineEmits(["close"]);
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
const name = ref("");
const error = ref("");

const submit = async () => {
  try {
    await axios.post(`/api/v1/spaces/${props.space.id}/roles`, {
      name: name.value,
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
