<template>
  <ModalBase
    v-if="store.self"
    title="Change Nickname"
    submit-text="Change"
    @submit="submit"
    @close="$emit('close')"
  >
    <template #icon>
      <IdentityIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput
        v-model="alias"
        type="text"
        label="Nickname"
        :placeholder="store.self.name"
        autofocus
      />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalInput from "./ModalInput.vue";
import ModalError from "./ModalError.vue";
import IdentityIcon from "@/icons/IdentityIcon.vue";
import { type PropType, ref } from "vue";
import { prettyError } from "@/global/helpers";
import axios from "axios";
import { useStore } from "@/global/store";
import type { ISpace } from "@/global/types";

const store = useStore();
const props = defineProps({
  show: {
    type: Boolean,
  },
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
const emit = defineEmits(["close"]);
// eslint-disable-next-line vue/no-setup-props-destructure
const alias = ref(props.space.members.find((member) => member.id === store.self?.id)?.alias || "");
const error = ref("");

const submit = async () => {
  try {
    await axios.post(`/api/v1/spaces/${props.space.id}/self`, {
      alias: alias.value || null,
    });

    // TODO: test & implement.
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
