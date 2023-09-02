<template>
  <ModalBase title="Create Group" submit-text="Create" @close="$emit('close')" @submit="submit">
    <template #icon>
      <GroupIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput v-model="name" type="text" label="Name" autofocus />
      <InputUser :users="users" />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import GroupIcon from "@/icons/GroupIcon.vue";
import ModalInput from "./ModalInput.vue";
import ModalError from "./ModalError.vue";
import InputUser from "./InputUser.vue";
import { ref, type Ref } from "vue";
import { prettyError } from "@/global/helpers";
import { SocketMessageType } from "@/../../hyalus-server/src/types";
import axios from "axios";
import { useStore } from "@/global/store";
import type { IFriend } from "@/global/types";

const store = useStore();
const props = defineProps({
  selected: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["close"]);
const users: Ref<
  (IFriend & {
    selected: boolean;
  })[]
> = ref(
  store.friends
    .filter((f) => f.accepted)
    .map((f) => ({
      ...f,
      selected: f.id === props.selected,
    })),
);
const error = ref("");
const name = ref("");

const submit = async () => {
  store.expectedEvent = SocketMessageType.SChannelCreate;
  try {
    await axios.post("/api/v1/channels", {
      name: name.value,
      userIds: users.value.filter((f) => f.selected).map((f) => f.id),
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  store.expectedEvent = null;
  emit("close");
};
</script>
