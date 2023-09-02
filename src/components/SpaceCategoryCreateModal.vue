<template>
  <ModalBase title="Create Category" submit-text="Create" @submit="submit" @close="$emit('close')">
    <template #icon>
      <FolderPlusIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput v-model="name" type="text" label="Name" autofocus />
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import { FolderPlusIcon } from "@heroicons/vue/20/solid";
import axios from "axios";
import { ChannelType } from "@/../../hyalus-server/src/types";
import { type PropType, ref } from "vue";
import { prettyError } from "@/global/helpers";
import type { ISpace } from "@/global/types";
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";
import ModalInput from "./ModalInput.vue";

const emit = defineEmits(["close"]);
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
const error = ref("");
const name = ref("");

const submit = async () => {
  error.value = "";

  try {
    await axios.post(`/api/v1/spaces/${props.space.id}/channels`, {
      name: name.value,
      type: ChannelType.SpaceCategory,
    });

    emit("close");
  } catch (e) {
    error.value = prettyError(e);
  }
};
</script>
