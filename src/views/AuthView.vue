<template>
  <BetaBanner
    v-if="store.config.betaBanner"
    class="fixed"
    :class="{
      'top-0': !isDesktop,
      'top-8': isDesktop,
    }"
  />
  <div
    class="dark:bg-dark-900 flex h-full flex-1 items-center justify-center bg-gray-100"
  >
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
              class="dark:bg-dark-800 -mt-2 flex items-center space-x-3 rounded-md bg-white p-4 text-sm shadow-sm"
            >
              <ErrorIcon class="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <p class="flex-1">{{ error }}</p>
            </div>
            <div v-if="['login', 'register'].includes(mode)" class="space-y-2">
              <p v-if="mode === 'login'" class="text-sm">Email (or username)</p>
              <p v-if="mode === 'register'" class="text-sm">Email</p>
              <input
                v-model="email"
                class="ring-primary-500 dark:bg-dark-800 dark:border-dark-600 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-500 shadow-sm transition focus:outline-none focus:ring dark:text-gray-400"
                type="text"
                autocomplete="username"
              />
            </div>
            <div v-if="['login', 'register'].includes(mode)" class="space-y-2">
              <p class="text-sm">Password</p>
              <input
                v-model="password"
                class="ring-primary-500 dark:bg-dark-800 dark:border-dark-600 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-500 shadow-sm transition focus:outline-none focus:ring dark:text-gray-400"
                type="password"
                autocomplete="current-password"
              />
            </div>
            <div v-if="mode === 'register'" class="space-y-2">
              <p class="text-sm">Confirm password</p>
              <input
                v-model="passwordConfirm"
                class="ring-primary-500 dark:bg-dark-800 dark:border-dark-600 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-500 shadow-sm transition focus:outline-none focus:ring dark:text-gray-400"
                type="password"
                autocomplete="current-password"
              />
            </div>
            <div v-if="mode === 'loginTotp'" class="space-y-2">
              <p class="text-sm">Code</p>
              <input
                v-model="totpCode"
                class="ring-primary-500 dark:bg-dark-800 dark:border-dark-600 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-500 shadow-sm transition focus:outline-none focus:ring dark:text-gray-400"
                type="totpCode"
                autocomplete="current-password"
                autofocus
              />
            </div>
          </div>
          <div class="flex flex-col items-center space-y-6">
            <button
              class="bg-primary-500 hover:bg-primary-600 w-full rounded-md py-2.5 text-sm text-white transition focus:outline-none"
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
                class="text-primary-500 hover:text-primary-600 transition"
                @click="
                  error = '';
                  mode = 'register';
                "
              >
                Register
              </button>
              <button
                v-if="mode === 'register'"
                class="text-primary-500 hover:text-primary-600 transition"
                @click="
                  error = '';
                  mode = 'login';
                "
              >
                Sign in
              </button>
              <button
                v-if="mode === 'loginTotp'"
                class="text-primary-500 hover:text-primary-600 transition"
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
import ErrorIcon from "../icons/ErrorIcon.vue";
import AppIcon from "../icons/AppIcon.vue";
import { ref, onMounted, watch } from "vue";
import { isDesktop, prettyError } from "../global/helpers";
import {
  crypto_box_keypair,
  crypto_pwhash,
  crypto_pwhash_ALG_ARGON2ID13,
  crypto_pwhash_MEMLIMIT_INTERACTIVE,
  crypto_pwhash_OPSLIMIT_INTERACTIVE,
  crypto_pwhash_SALTBYTES,
  crypto_secretbox_easy,
  crypto_secretbox_NONCEBYTES,
  crypto_secretbox_open_easy,
  from_base64,
  randombytes_buf,
  to_base64,
} from "libsodium-wrappers";
import { router } from "../router";
import BetaBanner from "../components/BetaBanner.vue";
import axios from "axios";
import { useStore } from "../global/store";
import LoadingIcon from "../icons/LoadingIcon.vue";

const store = useStore();

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

        salt = from_base64(prelogin.salt);

        symKey = crypto_pwhash(
          32,
          password.value,
          salt,
          crypto_pwhash_OPSLIMIT_INTERACTIVE,
          crypto_pwhash_MEMLIMIT_INTERACTIVE,
          crypto_pwhash_ALG_ARGON2ID13
        );

        authKey = crypto_pwhash(
          32,
          symKey,
          salt,
          crypto_pwhash_OPSLIMIT_INTERACTIVE,
          crypto_pwhash_MEMLIMIT_INTERACTIVE,
          crypto_pwhash_ALG_ARGON2ID13
        );
      }

      const body: {
        email: string;
        authKey: string;
        totpCode?: number;
      } = {
        email: email.value,
        authKey: to_base64(authKey),
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
        return;
      }

      const encryptedPrivateKey = from_base64(data.encryptedPrivateKey);

      const privateKey = crypto_secretbox_open_easy(
        new Uint8Array(encryptedPrivateKey.buffer, 24),
        new Uint8Array(encryptedPrivateKey.buffer, 0, 24),
        symKey
      );

      await store.writeConfig("salt", salt);
      await store.writeConfig("publicKey", from_base64(data.publicKey));
      await store.writeConfig("privateKey", privateKey);
      await store.writeConfig("token", from_base64(data.token));
      await store.start();
      await router.push("/app");
    }

    if (mode.value === "register") {
      if (password.value !== passwordConfirm.value) {
        throw new Error("Passwords don't match");
      }

      const salt = randombytes_buf(crypto_pwhash_SALTBYTES);

      const symKey = crypto_pwhash(
        32,
        password.value,
        salt,
        crypto_pwhash_OPSLIMIT_INTERACTIVE,
        crypto_pwhash_MEMLIMIT_INTERACTIVE,
        crypto_pwhash_ALG_ARGON2ID13
      );

      const authKey = crypto_pwhash(
        32,
        symKey,
        salt,
        crypto_pwhash_OPSLIMIT_INTERACTIVE,
        crypto_pwhash_MEMLIMIT_INTERACTIVE,
        crypto_pwhash_ALG_ARGON2ID13
      );

      const { publicKey, privateKey } = crypto_box_keypair();

      const encryptedPrivateKeyNonce = randombytes_buf(
        crypto_secretbox_NONCEBYTES
      );

      const encryptedPrivateKey = new Uint8Array([
        ...encryptedPrivateKeyNonce,
        ...crypto_secretbox_easy(privateKey, encryptedPrivateKeyNonce, symKey),
      ]);

      const {
        data,
      }: {
        data: {
          token: string;
        };
      } = await axios.post("/api/v1/users", {
        email: email.value,
        salt: to_base64(salt),
        authKey: to_base64(authKey),
        publicKey: to_base64(publicKey),
        encryptedPrivateKey: to_base64(encryptedPrivateKey),
      });

      await store.writeConfig("salt", salt);
      await store.writeConfig("publicKey", publicKey);
      await store.writeConfig("privateKey", privateKey);
      await store.writeConfig("token", from_base64(data.token));
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
  }
);

watch(
  () => mode.value,
  () => {
    error.value = "";
  }
);

onMounted(() => {
  document.title = "Hyalus";
});
</script>
