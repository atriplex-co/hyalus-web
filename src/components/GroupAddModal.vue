<template>
  <ModalBase title="Invite Friends" submit-text="Invite" @close="$emit('close')" @submit="submit">
    <template #icon>
      <UserAddIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <InputUser :users="members" />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";
import InputUser from "./InputUser.vue";
import UserAddIcon from "@/icons/UserAddIcon.vue";
import { ref, type PropType } from "vue";
import type { IChannel } from "@/global/types";
import { prettyError } from "@/global/helpers";
import axios from "axios";
import { useStore } from "@/global/store";

const store = useStore();
const props = defineProps({
  channel: {
    type: Object as PropType<IChannel>,
    default() {
      //
    },
  },
});
const emit = defineEmits(["close"]);
const error = ref("");
const members = ref(
  store.friends
    .filter(
      (friend) =>
        friend.accepted && !props.channel.members.find((member) => member.id === friend.id),
    )
    .map((friend) => ({
      ...friend,
      selected: false,
    })),
);

const submit = async () => {
  try {
    await axios.post(`/api/v1/channels/${props.channel.id}/members`, {
      userIds: members.value.filter((friend) => friend.selected).map((friend) => friend.id),
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
