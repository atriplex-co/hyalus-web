<template>
  <BetaBanner
    v-if="store.config.betaBanner"
    class="fixed"
    :class="{
      'top-0': !isDesktop,
      'top-[30px]': isDesktop,
    }"
  />
  <div class="flex h-full flex-1 items-center justify-center bg-ctp-crust">
    <div class="flex w-full max-w-sm flex-col space-y-8 rounded-md">
      <div class="flex flex-col items-center space-y-6 text-2xl font-bold">
        <AppIcon class="h-16 w-16" />
        <p v-if="mode === 'login'">Sign in to Hyalus</p>
        <p v-if="mode === 'loginTotp'">2FA Verification</p>
        <p v-if="mode === 'register'">Create an account</p>
      </div>
      <div class="mt-4 flex flex-col items-center">
        <form class="w-full space-y-8" @submit.prevent="submit">
          <div class="space-y-4">
            <div
              v-if="error"
              class="-mt-2 flex items-center space-x-3 rounded-md bg-ctp-mantle p-4 text-sm shadow-sm"
            >
              <ErrorIcon class="h-5 w-5" />
              <p class="flex-1">{{ error }}</p>
            </div>
            <div v-if="['login', 'register'].includes(mode)" class="space-y-2">
              <p v-if="mode === 'login'" class="text-sm">Email (or username)</p>
              <p v-if="mode === 'register'" class="text-sm">Email</p>
              <input
                v-model="email"
                class="w-full rounded-md border border-ctp-base bg-ctp-mantle px-3 py-2 text-ctp-subtext0 shadow-sm ring-ctp-accent transition focus:outline-none focus:ring-2"
                type="text"
                autocomplete="username"
              />
            </div>
            <div v-if="['login', 'register'].includes(mode)" class="space-y-2">
              <p class="text-sm">Password</p>
              <input
                v-model="password"
                class="w-full rounded-md border border-ctp-base bg-ctp-mantle px-3 py-2 text-ctp-subtext0 shadow-sm ring-ctp-accent transition focus:outline-none focus:ring-2"
                type="password"
                autocomplete="current-password"
              />
            </div>
            <div v-if="mode === 'register'" class="space-y-2">
              <p class="text-sm">Confirm password</p>
              <input
                v-model="passwordConfirm"
                class="w-full rounded-md border border-ctp-base bg-ctp-mantle px-3 py-2 text-ctp-subtext0 shadow-sm ring-ctp-accent transition focus:outline-none focus:ring-2"
                type="password"
                autocomplete="current-password"
              />
            </div>
            <div v-if="mode === 'loginTotp'" class="space-y-2">
              <p class="text-sm">Code</p>
              <input
                v-model="totpCode"
                class="w-full rounded-md border border-ctp-base bg-ctp-mantle px-3 py-2 text-ctp-subtext0 shadow-sm ring-ctp-accent transition focus:outline-none focus:ring-2"
                type="totpCode"
                autocomplete="current-password"
                autofocus
              />
            </div>
          </div>
          <div class="flex flex-col items-center space-y-6">
            <button
              class="w-full rounded-md bg-ctp-accent py-2.5 text-sm font-medium text-ctp-base transition hover:bg-ctp-accent/75 focus:outline-none"
            >
              <template v-if="ready">
                <p v-if="mode === 'login'">Sign in</p>
                <p v-if="mode === 'loginTotp'">Verify</p>
                <p v-if="mode === 'register'">Create</p>
              </template>
              <LoadingIcon v-else class="mx-auto h-5 w-5" />
            </button>
            <div class="space-y-4 text-sm">
              <button
                v-if="mode === 'login'"
                class="text-ctp-accent transition hover:text-ctp-accent"
                @click="
                  error = '';
                  mode = 'register';
                "
              >
                Register
              </button>
              <button
                v-if="mode === 'register'"
                class="text-ctp-accent transition hover:text-ctp-accent"
                @click="
                  error = '';
                  mode = 'login';
                "
              >
                Sign in
              </button>
              <button
                v-if="mode === 'loginTotp'"
                class="text-ctp-accent transition hover:text-ctp-accent"
                @click="
                  error = '';
                  mode = 'login';
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ErrorIcon from "@/icons/ErrorIcon.vue";
import AppIcon from "@/icons/AppIcon.vue";
import { ref, onMounted, watch } from "vue";
import { isDesktop, prettyError } from "@/global/helpers";
import sodium from "libsodium-wrappers";
import BetaBanner from "@/components/BetaBanner.vue";
import axios from "axios";
import { useStore } from "@/global/store";
import LoadingIcon from "@/icons/LoadingIcon.vue";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();

const mode = ref("login");
const email = ref("");
const password = ref("");
const passwordConfirm = ref("");
const totpCode = ref("");
const error = ref("");
const ready = ref(true);

let salt: Uint8Array;
let symKey: Uint8Array;
let authKey: Uint8Array;

const submit = async () => {
  try {
    error.value = "";
    ready.value = false;

    if (mode.value === "login" || mode.value === "loginTotp") {
      if (mode.value === "login") {
        const {
          data: prelogin,
        }: {
          data: {
            salt: string;
          };
        } = await axios.post("/api/v1/sessions", {
          email: email.value,
        });

        salt = sodium.from_base64(prelogin.salt);

        symKey = sodium.crypto_pwhash(
          32,
          password.value,
          salt,
          sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_ALG_ARGON2ID13,
        );

        authKey = sodium.crypto_pwhash(
          32,
          symKey,
          salt,
          sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_ALG_ARGON2ID13,
        );
      }

      const body: {
        email: string;
        authKey: string;
        totpCode?: number;
      } = {
        email: email.value,
        authKey: sodium.to_base64(authKey),
      };

      if (mode.value === "loginTotp") {
        body.totpCode = +totpCode.value;
      }

      const {
        data,
      }: {
        data: {
          token: string;
          publicKey: string;
          encryptedPrivateKey: string;
          totpRequired?: boolean;
        };
      } = await axios.post("/api/v1/sessions", body);

      if (data.totpRequired) {
        mode.value = "loginTotp";
        ready.value = true;
        return;
      }

      const encryptedPrivateKey = sodium.from_base64(data.encryptedPrivateKey);

      const privateKey = sodium.crypto_secretbox_open_easy(
        new Uint8Array(encryptedPrivateKey.buffer, 24),
        new Uint8Array(encryptedPrivateKey.buffer, 0, 24),
        symKey,
      );

      await store.writeConfig("salt", salt);
      await store.writeConfig("publicKey", sodium.from_base64(data.publicKey));
      await store.writeConfig("privateKey", privateKey);
      await store.writeConfig("token", sodium.from_base64(data.token));
      if (window.HyalusDesktop && window.HyalusDesktop.flushStorageData) {
        window.HyalusDesktop.flushStorageData();
      }
      await store.start();
      await router.push("/app");
    }

    if (mode.value === "register") {
      if (password.value !== passwordConfirm.value) {
        throw new Error("Passwords don't match");
      }

      const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
      const symKey = sodium.crypto_pwhash(
        32,
        password.value,
        salt,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_ALG_ARGON2ID13,
      );
      const authKey = sodium.crypto_pwhash(
        32,
        symKey,
        salt,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_ALG_ARGON2ID13,
      );
      const { publicKey, privateKey } = sodium.crypto_box_keypair();
      const encryptedPrivateKeyNonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
      const encryptedPrivateKey = new Uint8Array([
        ...encryptedPrivateKeyNonce,
        ...sodium.crypto_secretbox_easy(privateKey, encryptedPrivateKeyNonce, symKey),
      ]);

      const {
        data,
      }: {
        data: {
          token: string;
        };
      } = await axios.post("/api/v1/users", {
        email: email.value,
        salt: sodium.to_base64(salt),
        authKey: sodium.to_base64(authKey),
        publicKey: sodium.to_base64(publicKey),
        encryptedPrivateKey: sodium.to_base64(encryptedPrivateKey),
      });

      await store.writeConfig("salt", salt);
      await store.writeConfig("publicKey", publicKey);
      await store.writeConfig("privateKey", privateKey);
      await store.writeConfig("token", sodium.from_base64(data.token));
      if (window.HyalusDesktop && window.HyalusDesktop.flushStorageData) {
        window.HyalusDesktop.flushStorageData();
      }
      await store.start();
      await router.push("/app");
    }
  } catch (e) {
    console.debug(e);
    error.value = prettyError(e);
  }

  ready.value = true;
};

watch(
  () => totpCode.value,
  () => {
    if (totpCode.value.length === 6) {
      submit();
    }
  },
);

watch(
  () => mode.value,
  () => {
    error.value = "";
  },
);

onMounted(() => {
  document.title = "Hyalus";
});
</script>
