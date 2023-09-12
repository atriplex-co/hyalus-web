<template>
  <ModalBase title="Edit Emoji" @submit="submit" @close="$emit('close')" submit-text="Save">
    <template #icon>
      <PencilIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput type="text" v-model="name" label="Name" :autofocus="true" />
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import type { ISpace, ISpaceEmoji } from "@/global/types";
import { ref, type PropType } from "vue";
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";
import { PencilIcon } from "@heroicons/vue/20/solid";
import { prettyError } from "@/global/helpers";
import axios from "axios";
import ModalInput from "./ModalInput.vue";

const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    required: true,
  },
  emoji: {
    type: Object as PropType<ISpaceEmoji>,
    required: true,
  },
});
const emit = defineEmits(["close"]);
const error = ref("");
const name = ref(props.emoji.name);
const submit = async () => {
  try {
    await axios.patch(`/api/v1/spaces/${props.space.id}/emojis/${props.emoji.id}`, {
      name: name.value,
    });
    emit("close");
  } catch (e) {
    error.value = prettyError(e);
  }
};
</script>
