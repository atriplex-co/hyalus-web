<template>
  <ModalBase
    :title="props.channel.type === ChannelType.SpaceCategory ? 'Delete Category' : 'Delete Channel'"
    submit-text="Delete"
    @close="$emit('close')"
    @submit="submit"
  >
    <template #icon>
      <TrashIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <p>
        Are you sure you want to permanently delete
        <strong
          >{{ props.channel.type === ChannelType.SpaceText ? "#" : ""
          }}{{ props.channel.name }}</strong
        >?
      </p>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import { TrashIcon } from "@heroicons/vue/20/solid";
import axios from "axios";
import { ChannelType } from "@/../../hyalus-server/src/types";
import { type PropType, ref } from "vue";
import { prettyError } from "@/global/helpers";
import type { IChannel, ISpace } from "@/global/types";
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";

const emit = defineEmits(["close"]);
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
  channel: {
    type: Object as PropType<IChannel>,
    default() {
      //
    },
  },
});
const error = ref("");

const submit = async () => {
  error.value = "";

  try {
    await axios.delete(`/api/v1/spaces/${props.space.id}/channels/${props.channel.id}`);

    emit("close");
  } catch (e) {
    error.value = prettyError(e);
  }
};
</script>
