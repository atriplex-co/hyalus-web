<template>
  <ModalBase title="Change Password" submit-text="Change" @submit="submit" @close="$emit('close')">
    <template #icon>
      <KeyIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput
        v-model="password"
        type="password"
        label="Current password"
        autocomplete="current-password"
        autofocus
      />
      <ModalInput
        v-model="newPassword"
        type="password"
        label="New password"
        autocomplete="new-password"
      />
      <ModalInput
        v-model="newPasswordConfirm"
        type="password"
        label="Confirm new password"
        autocomplete="new-password"
      />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalInput from "./ModalInput.vue";
import ModalError from "./ModalError.vue";
import KeyIcon from "@/icons/KeyIcon.vue";
import { ref } from "vue";
import { prettyError } from "@/global/helpers";
import axios from "axios";
import { useStore } from "@/global/store";
import sodium from "libsodium-wrappers";

const store = useStore();
const emit = defineEmits(["close"]);
const password = ref("");
const newPassword = ref("");
const newPasswordConfirm = ref("");
const error = ref("");

const submit = async () => {
  if (newPassword.value !== newPasswordConfirm.value) {
    error.value = "Passwords must match";
    return;
  }

  if (!store.config.salt || !store.config.privateKey) {
    error.value = "Missing credentials";
    return;
  }

  const oldSymKey = sodium.crypto_pwhash(
    32,
    password.value,
    store.config.salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  );

  const oldAuthKey = sodium.crypto_pwhash(
    32,
    oldSymKey,
    store.config.salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  );

  const newSalt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);

  const symKey = sodium.crypto_pwhash(
    32,
    newPassword.value,
    newSalt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  );

  const newAuthKey = sodium.crypto_pwhash(
    32,
    symKey,
    newSalt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  );

  const newEncryptedPrivateKeyNonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

  const newEncryptedPrivateKey = new Uint8Array([
    ...newEncryptedPrivateKeyNonce,
    ...sodium.crypto_secretbox_easy(store.config.privateKey, newEncryptedPrivateKeyNonce, symKey),
  ]);

  try {
    await axios.post("/api/v1/users/me", {
      authKey: {
        oldAuthKey: sodium.to_base64(oldAuthKey),
        newAuthKey: sodium.to_base64(newAuthKey),
        newSalt: sodium.to_base64(newSalt),
        newEncryptedPrivateKey: sodium.to_base64(newEncryptedPrivateKey),
      },
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  await store.writeConfig("salt", newSalt);
  emit("close");
};
</script>
