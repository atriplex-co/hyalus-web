<template>
  <ModalBase
    title="Enable 2FA"
    submit-text="Enable"
    @submit="submit"
    @close="$emit('close')"
  >
    <template #icon>
      <LockIcon />
    </template>
    <template #main>
      <div
        class="border-ctp-base overflow-hidden rounded-md border shadow-sm"
      >
        <img
          class="h-full w-full"
          :src="qrcodeUrl"
          style="filter:contrast(87%)invert()sepia()saturate(150%)hue-rotate(180deg)"
        />
      </div>
      <div class="space-y-2 text-sm">
        <a
          class="group flex items-center space-x-3 text-ctp-subtext0 hover:text-ctp-text transition"
          href="https://apps.apple.com/us/app/google-authenticator/id388497605"
          target="_blank"
          rel="noreferrer noopener"
        >
          <AppleIcon class="h-6 w-6" />
          <p>Authenticator for iOS</p>
        </a>
        <a
          class="group flex items-center space-x-3 text-ctp-subtext0 hover:text-ctp-text transition"
          href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
          target="_blank"
          rel="noreferrer noopener"
        >
          <GooglePlayIcon class="h-6 w-6" />
          <p>Authenticator for Android</p>
        </a>
        <div
          class="group flex items-center space-x-3 transition text-ctp-subtext0 hover:text-ctp-text"
        >
          <LockIcon class="h-6 w-6" />
          <p v-if="showTotpSecretB32" class="select-all">{{ totpSecretB32 }}</p>
          <button v-else @click="showTotpSecretB32 = true">
            Show TOTP secret
          </button>
        </div>
      </div>
      <ModalError v-if="error" :error="error" />
      <ModalInput
        v-model="password"
        type="password"
        label="Password"
        autocomplete="current-password"
      />
      <ModalInput v-model="totpCode" type="text" label="2FA Code" />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalInput from "./ModalInput.vue";
import ModalError from "./ModalError.vue";
import LockIcon from "../icons/LockIcon.vue";
import AppleIcon from "../icons/AppleIcon.vue";
import GooglePlayIcon from "../icons/GooglePlayIcon.vue";
import qrcode from "qrcode";
import { ref, onMounted } from "vue";
import sodium from "libsodium-wrappers";
import b32 from "base32-encode";
import { prettyError } from "../global/helpers";
import axios from "axios";
import { useStore } from "../global/store";

const store = useStore();
const emit = defineEmits(["close"]);
const error = ref("");
const password = ref("");
const totpCode = ref("");
const showTotpSecretB32 = ref(false);
const totpSecret = sodium.randombytes_buf(10);
const totpSecretB32 = b32(totpSecret, "RFC3548");
const qrcodeUrl = ref("");

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

    await axios.post("/api/v1/users/me/totp/enable", {
      authKey: sodium.to_base64(authKey),
      totpSecret: sodium.to_base64(totpSecret),
      totpCode: +totpCode.value,
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};

onMounted(async () => {
  if (!store.self) {
    return;
  }

  qrcodeUrl.value = await qrcode.toDataURL(
    `otpauth://totp/Hyalus:${store.self.username}?secret=${totpSecretB32}&issuer=Hyalus`,
  );
});
</script>

<style scoped>
.qrcode {
  filter: invert() contrast(80%);
}
</style>
