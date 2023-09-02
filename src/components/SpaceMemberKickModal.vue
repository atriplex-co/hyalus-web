<template>
  <ModalBase title="Kick Member" submit-text="Kick" @submit="submit" @close="$emit('close')">
    <template #icon>
      <ScaleIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <p>
        Are you sure you want to kick
        <strong>{{ props.member.name }} (@{{ props.member.username }})</strong>
        from the space? They will not be able to join again without an invite.
      </p>
      <ModalInput v-model="reason" type="text" label="Reason" placeholder="None specified" />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import { ScaleIcon } from "@heroicons/vue/20/solid";
import axios from "axios";
import { type PropType, ref } from "vue";
import { prettyError } from "@/global/helpers";
import type { ISpace, ISpaceMember } from "@/global/types";
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";
import ModalInput from "./ModalInput.vue";

const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
  member: {
    type: Object as PropType<ISpaceMember>,
    default() {
      //
    },
  },
});
const emit = defineEmits(["close"]);
const error = ref("");
const reason = ref("");

const submit = async () => {
  error.value = "";

  try {
    await axios.post(`/api/v1/spaces/${props.space.id}/members/${props.member.id}/kick`, {
      reason: reason.value,
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
