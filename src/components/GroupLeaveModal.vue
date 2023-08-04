<template>
  <ModalBase title="Leave Group" submit-text="Leave" @close="$emit('close')" @submit="submit">
    <template #icon>
      <LogoutIcon />
    </template>
    <template #main>
      <p>Are you sure you want to leave this group?</p>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import LogoutIcon from "../icons/LogoutIcon.vue";
import axios from "axios";
import type { IChannel } from "../global/types";
import type { PropType } from "vue";

const emit = defineEmits(["close"]);

const props = defineProps({
  channel: {
    type: Object as PropType<IChannel>,
    default() {
      //
    },
  },
});

const submit = async () => {
  await axios.delete(`/api/v1/channels/${props.channel.id}`);
  emit("close");
};
</script>
