<template>
  <ModalBase
    v-if="store.self"
    title="Leave Space"
    submit-text="Leave"
    @submit="submit"
    @close="$emit('close')"
  >
    <template #icon>
      <ArrowRightOnRectangleIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <p>
        Are you sure you want to leave <strong>{{ props.space.name }}</strong
        >? You won't be able to join the space again without an invite.
      </p>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";
import { PropType, ref } from "vue";
import { prettyError } from "../global/helpers";
import axios from "axios";
import { useStore } from "../global/store";
import { ISpace } from "../global/types";
import { ArrowRightOnRectangleIcon } from "@heroicons/vue/20/solid";

const store = useStore();
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
const emit = defineEmits(["close"]);
const error = ref("");

const submit = async () => {
  try {
    await axios.post(`/api/v1/spaces/${props.space.id}/leave`);
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
