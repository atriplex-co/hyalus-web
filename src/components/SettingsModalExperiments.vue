<template>
  <div class="flex-1 h-full flex flex-col">
    <div class="flex items-center space-x-4">
      <p class="text-2xl">Experiments</p>
      <button
        v-if="store.config.experimentsEnabled"
        class="text-sm bg-ctp-accent text-ctp-crust p-1.5 w-20 transition hover:bg-ctp-accent/75 rounded-md"
        @click="disable"
      >
        Disable
      </button>
    </div>
    <div class="mt-8 flex-1">
      <div
        v-if="!store.config.experimentsEnabled"
        class="flex items-center justify-center flex-1 h-full flex-col -mt-16"
      >
        <BeakerIcon class="w-16 h-16 bg-ctp-surface0 rounded-full p-4 text-ctp-accent" />
        <p class="text-2xl font-bold mt-6">Experiments</p>
        <p class="mt-3 text-ctp-subtext0">Only enable experiments if you know what you're doing.</p>
        <button
          class="mt-6 text-sm bg-ctp-accent text-ctp-crust p-2 px-4 transition hover:bg-ctp-accent/75 rounded-md"
          @click="enable"
        >
          Enable
        </button>
      </div>
      <div v-if="store.config.experimentsEnabled" class="space-y-4">
        <div class="flex items-center space-x-3 bg-ctp-surface0/50 p-4 rounded-md">
          <ExclamationTriangleIcon class="w-5 h-5" />
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
