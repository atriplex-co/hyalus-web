<template>
  <ModalBase title="Delete Emoji" @submit="submit" @close="$emit('close')" submit-text="Delete">
    <template #icon>
      <TrashIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <p>
        Are you sure you want to delete <strong>{{ emoji.name }}</strong
        >?
      </p>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import type { ISpace, ISpaceEmoji } from "@/global/types";
import { ref, type PropType } from "vue";
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";
import { TrashIcon } from "@heroicons/vue/20/solid";
import { prettyError } from "@/global/helpers";
import axios from "axios";

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
const submit = async () => {
  try {
    await axios.delete(`/api/v1/spaces/${props.space.id}/emojis/${props.emoji.id}`);
    emit("close");
  } catch (e) {
    error.value = prettyError(e);
  }
};
</script>
