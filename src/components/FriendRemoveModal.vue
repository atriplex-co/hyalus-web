<template>
  <ModalBase title="Remove Friend" submit-text="Remove" @close="$emit('close')" @submit="submit">
    <template #icon>
      <UserMinusIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <p>
        Are you sure you want to remove <strong>{{ friend.name }}</strong> as a friend?
      </p>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import { UserMinusIcon } from "@heroicons/vue/20/solid";
import axios from "axios";
import { type PropType, ref } from "vue";
import { prettyError } from "../global/helpers";
import type { IFriend } from "../global/types";
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";

const emit = defineEmits(["close"]);
const props = defineProps({
  friend: {
    type: Object as PropType<IFriend>,
    default() {
      //
    },
  },
});
const error = ref("");

const submit = async () => {
  try {
    await axios.delete(`/api/v1/friends/${props.friend.id}`);
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
