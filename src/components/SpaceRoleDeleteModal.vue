<template>
  <ModalBase title="Delete Role" submit-text="Delete" @submit="submit" @close="$emit('close')">
    <template #icon>
      <TrashIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <p>
        Are you sure you want to delete
        <strong>{{ role.name }}</strong
        >?
      </p>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";
import { type PropType, ref } from "vue";
import { prettyError } from "../global/helpers";
import axios from "axios";
import { TrashIcon } from "@heroicons/vue/20/solid";
import type { ISpace, ISpaceRole } from "../global/types";

const emit = defineEmits(["close"]);
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
  role: {
    type: Object as PropType<ISpaceRole>,
    default() {
      //
    },
  },
});
const error = ref("");

const submit = async () => {
  try {
    await axios.delete(`/api/v1/spaces/${props.space.id}/roles/${props.role.id}`);

    emit("close");
  } catch (e) {
    error.value = prettyError(e);
  }
};
</script>
