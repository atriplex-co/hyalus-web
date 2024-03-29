<template>
  <ModalBase title="Disable 2FA" submit-text="Disable" @submit="submit" @close="$emit('close')">
    <template #icon>
      <LockIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput
        v-model="password"
        type="password"
        label="Password"
        autocomplete="current-password"
      />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalInput from "./ModalInput.vue";
import ModalError from "./ModalError.vue";
import LockIcon from "@/icons/LockIcon.vue";
import { ref } from "vue";
import sodium from "libsodium-wrappers";
import { prettyError } from "@/global/helpers";
import axios from "axios";
import { useStore } from "@/global/store";

const store = useStore();

const emit = defineEmits(["close"]);
const password = ref("");
const error = ref("");

const submit = async () => {
  if (!store.config.salt) {
    return;
  }

  try {
    const symKey = sodium.crypto_pwhash(
      32,
      password.value,
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

    await axios.post("/api/v1/users/me/totp/disable", {
      authKey: sodium.to_base64(authKey),
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};
</script>
