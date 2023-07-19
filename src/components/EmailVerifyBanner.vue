<template>
  <div class="w-full">
    <div
      class="dark:bg-primary-600 bg-primary-500 flex h-9 items-center justify-between rounded-sm px-2 text-sm text-white"
    >
      <div class="flex items-center space-x-2 px-1">
        <EnvelopeIcon class="h-5 w-5" />
        <p>Check your email for a link to verify your account.</p>
        <button
          class="hover:text-primary-500 rounded-md border border-white px-2 py-0.5 font-bold transition hover:bg-white"
          @click="setEmailModal = true"
        >
          <p>Resend</p>
        </button>
      </div>
    </div>
    <SetEmailModal v-if="setEmailModal" @close="setEmailModal = false" />
  </div>
</template>

<script lang="ts" setup>
import { EnvelopeIcon } from "@heroicons/vue/20/solid";
import { ref } from "vue";
import SetEmailModal from "./SetEmailModal.vue";

const setEmailModal = ref(false);
</script>
