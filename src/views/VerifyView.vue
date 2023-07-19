<template>
  <div
    class="fixed inset-0 flex flex-col items-center justify-center space-y-4"
  >
    <template v-if="mode === 0">
      <LoadingIcon class="h-10 w-10 p-1" />
      <p class="text-xl font-bold">Verifying email</p>
    </template>
    <template v-if="mode === 1">
      <CheckCircleIcon class="text-primary-500 h-10 w-10" />
      <p class="text-xl font-bold">Email verified</p>
    </template>
    <template v-if="mode === 2">
      <ExclamationCircleIcon class="h-10 w-10 text-red-500" />
      <p class="text-xl font-bold">Invalid verification link</p>
    </template>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/vue/24/outline";
import LoadingIcon from "../icons/LoadingIcon.vue";

const route = useRoute();
const mode = ref(0);

onMounted(async () => {
  try {
    await axios.post(`/api/v1/users/verify`, {
      key: route.params.key,
    });

    mode.value = 1;
  } catch {
    mode.value = 2;
  }
});
</script>
