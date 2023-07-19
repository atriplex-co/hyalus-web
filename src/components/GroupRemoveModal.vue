<template>
  <ModalBase
    title="Remove Mmeber"
    submit-text="Remove"
    @close="$emit('close')"
    @submit="submit"
  >
    <template #icon>
      <UserMinusIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <p>
        Are you sure you want to remove <strong>{{ member.name }}</strong> from
        the group {{ channel.name }}?
      </p>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import { UserMinusIcon } from "@heroicons/vue/20/solid";
import axios from "axios";
import { PropType, ref } from "vue";
import { prettyError } from "../global/helpers";
import { IChannel, IChannelMember, ISelf, ISpaceMember } from "../global/types";
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";

const emit = defineEmits(["close"]);
const props = defineProps({
  channel: {
    type: Object as PropType<IChannel>,
    default() {
      //
    },
  },
  member: {
    type: Object as PropType<IChannelMember | ISpaceMember | ISelf>,
    default() {
      //
    },
  },
});
const error = ref("");

const submit = async () => {
  try {
    await axios.delete(
      `/api/v1/channels/${props.channel.id}/members/${props.member.id}`,
    );
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
