<template>
  <div class="flex h-16 items-center justify-between">
    <p class="font-bold">{{ experiment.id }}</p>
    <InputList class="w-60">
      <template #selected>
        {{ value }}
      </template>
      <template #items>
        <InputListItem @click="value = ''">default</InputListItem>
        <InputListItem v-for="option in experiment.options" :key="option" @click="value = option">
          {{ option }}
        </InputListItem>
      </template>
    </InputList>
  </div>
</template>

<script lang="ts" setup>
import { experimentValueToComputed } from "@/global/helpers";
import type { IExperiment } from "@/global/types";
import type { PropType } from "vue";
import InputList from "./InputList.vue";
import InputListItem from "./InputListItem.vue";

const props = defineProps({
  experiment: {
    type: Object as PropType<IExperiment>,
    required: true,
  },
});

const value = experimentValueToComputed(props.experiment.id);
</script>
