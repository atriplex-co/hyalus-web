<template>
  <ModalBase title="Rename Group" submit-text="Rename" @submit="submit" @close="$emit('close')">
    <template #icon>
      <PencilIcon />
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
import PencilIcon from "../icons/PencilIcon.vue";
import { ref, type PropType } from "vue";
import { prettyError } from "../global/helpers";
import type { IChannel } from "../global/types";
import axios from "axios";

const props = defineProps({
  channel: {
    type: Object as PropType<IChannel>,
    default() {
      //
    },
  },
});

const emit = defineEmits(["close"]);
// eslint-disable-next-line vue/no-setup-props-destructure
const name = ref(props.channel.name || "");
const error = ref("");

const submit = async () => {
  try {
    await axios.post(`/api/v1/channels/${props.channel.id}`, {
      name: name.value,
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
