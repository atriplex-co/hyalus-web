<template>
  <div class="w-full">
    <div
      class="bg-ctp-accent text-ctp-base flex h-9 items-center justify-between rounded-sm px-2 text-sm"
    >
      <div class="flex items-center space-x-2 px-1">
        <EnvelopeIcon class="h-5 w-5" />
        <p>Check your email for a link to verify your account.</p>
        <button
          class="rounded-md border border-ctp-base px-2 py-0.5 font-bold transition hover:bg-ctp-base hover:text-ctp-accent"
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
