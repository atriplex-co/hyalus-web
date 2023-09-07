<template>
  <div class="flex h-full flex-1 flex-col">
    <div class="flex items-center space-x-4">
      <p class="text-2xl">Experiments</p>
      <button
        v-if="store.config.experimentsEnabled"
        class="w-20 rounded-md bg-ctp-accent p-1.5 text-sm text-ctp-crust transition hover:bg-ctp-accent/75"
        @click="disable"
      >
        Disable
      </button>
    </div>
    <div class="mt-8 flex-1">
      <div
        v-if="!store.config.experimentsEnabled"
        class="-mt-16 flex h-full flex-1 flex-col items-center justify-center"
      >
        <BeakerIcon class="h-16 w-16 rounded-full bg-ctp-surface0 p-4 text-ctp-accent" />
        <p class="mt-6 text-2xl font-bold">Experiments</p>
        <p class="mt-3 text-ctp-subtext0">Only enable experiments if you know what you're doing.</p>
        <button
          class="mt-6 rounded-md bg-ctp-accent p-2 px-4 text-sm text-ctp-crust transition hover:bg-ctp-accent/75"
          @click="enable"
        >
          Enable
        </button>
      </div>
      <div v-if="store.config.experimentsEnabled" class="space-y-4">
        <div class="flex items-center space-x-3 rounded-md bg-ctp-surface0/50 p-4">
          <ExclamationTriangleIcon class="h-5 w-5" />
          <p>Experiments are for testing and may be unstable.</p>
        </div>
        <div class="divide-y divide-ctp-surface0/50 border-b border-t border-ctp-surface0/50">
          <ExperimentItem
            v-for="experiment in availableExperiments"
            :key="experiment.id"
            :experiment="experiment"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { availableExperiments } from "@/global/config";
import ExperimentItem from "./ExperimentItem.vue";
import { useStore } from "@/global/store";
import { BeakerIcon } from "@heroicons/vue/24/solid";
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";

const store = useStore();
let enableClickCount = 0;

const enable = async () => {
  enableClickCount++;
  if (enableClickCount >= 7) {
    await store.writeConfig("experimentsEnabled", true);
    enableClickCount = 0;
  }
};

const disable = async () => {
  await store.writeConfig("experimentsEnabled", false);
  await store.writeConfig("experiments", {});
};
</script>
