<template>
  <ModalBase
    v-if="store.self"
    title="Delete Space"
    submit-text="Delete"
    @submit="submit"
    @close="$emit('close')"
  >
    <template #icon>
      <TrashIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput
        v-if="!store.self.totpEnabled"
        v-model="auth"
        type="password"
        label="Password"
        autofocus
      />
      <ModalInput
        v-if="store.self.totpEnabled"
        v-model="auth"
        type="text"
        label="2FA Code"
        autofocus
      />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalInput from "./ModalInput.vue";
import ModalError from "./ModalError.vue";
import { type PropType, ref } from "vue";
import { prettyError } from "@/global/helpers";
import axios from "axios";
import { useStore } from "@/global/store";
import { TrashIcon } from "@heroicons/vue/24/solid";
import type { ISpace } from "@/global/types";
import sodium from "libsodium-wrappers";

const store = useStore();
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
const emit = defineEmits(["close"]);
const error = ref("");
const auth = ref("");

const submit = async () => {
  if (!store.self || !store.config.salt) {
    return;
  }

  try {
    if (!store.self.totpEnabled) {
      const symKey = sodium.crypto_pwhash(
        32,
        auth.value,
        store.config.salt,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_ALG_ARGON2ID13,
      );

      const authKey = sodium.crypto_pwhash(
        32,
        symKey,
        store.config.salt,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_ALG_ARGON2ID13,
      );

      await axios.post(`/api/v1/spaces/${props.space.id}/delete`, {
        authKey: sodium.to_base64(authKey),
      });
    } else {
      await axios.post(`/api/v1/spaces/${props.space.id}/delete`, {
        totpCode: +auth.value,
      });
    }
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
