<template>
  <div
    class="absolute z-40 max-h-full w-full overflow-auto bg-black py-2 font-mono text-xs text-green-500"
    :class="{
      'top-8': isDesktop,
    }"
  >
    <div class="absolute right-0 flex flex-col items-start space-y-2 px-8">
      <AppIcon class="w-32 py-4 opacity-50 grayscale filter" />
      <button class="text-primary-500 bg-dark-900 p-2">restart (f5)</button>
      <button class="text-primary-500 bg-dark-900 p-2">restart (f6)</button>
      <button class="text-primary-500 bg-dark-900 p-2">devtools (f12)</button>
      <button class="text-primary-500 bg-dark-900 p-2">reinstall</button>
      <div class="flex items-center space-x-2">
        <button class="text-primary-500 bg-dark-900 p-2">main</button>
        <button class="text-primary-500 bg-dark-900 p-2">dev</button>
        <button class="text-primary-500 bg-dark-900 p-2">dev2</button>
        <p class="absolute -left-12 font-bold text-blue-500">server:</p>
      </div>
      <div class="flex items-center space-x-2">
        <button class="text-primary-500 bg-dark-900 p-2">#1</button>
        <button class="text-primary-500 bg-dark-900 p-2">#2</button>
        <button class="text-primary-500 bg-dark-900 p-2">#3</button>
        <button class="text-primary-500 bg-dark-900 p-2">#4</button>
        <p class="absolute -left-12 font-bold text-blue-500">profile:</p>
      </div>
    </div>
    <div class="flex">
      <p class="px-4 font-bold text-blue-500">build:</p>
      <p>{{ gitBranch }} ({{ gitHash }})</p>
    </div>
    <div class="flex">
      <p class="px-4 font-bold text-blue-500">config:</p>
      <DebugObject
        :obj="{
          ...store.config,
          token: undefined,
          salt: undefined,
          publicKey: undefined,
          privateKey: undefined,
        }"
      />
    </div>
    <!-- gray -->
    <div class="flex">
      <p class="px-4 font-bold text-blue-500">gray:</p>
      <div class="m-px bg-gray-50 p-2"></div>
      <div class="m-px bg-gray-100 p-2"></div>
      <div class="m-px bg-gray-200 p-2"></div>
      <div class="m-px bg-gray-300 p-2"></div>
      <div class="m-px bg-gray-400 p-2"></div>
      <div class="m-px bg-gray-500 p-2"></div>
      <div class="m-px bg-gray-600 p-2"></div>
      <div class="m-px bg-gray-700 p-2"></div>
      <div class="m-px bg-gray-800 p-2"></div>
      <div class="m-px bg-gray-900 p-2"></div>
    </div>
    <!-- dark -->
    <div class="flex">
      <p class="px-4 font-bold text-blue-500">dark:</p>
      <div class="bg-dark-50 m-px p-2"></div>
      <div class="bg-dark-100 m-px p-2"></div>
      <div class="bg-dark-200 m-px p-2"></div>
      <div class="bg-dark-300 m-px p-2"></div>
      <div class="bg-dark-400 m-px p-2"></div>
      <div class="bg-dark-500 m-px p-2"></div>
      <div class="bg-dark-600 m-px p-2"></div>
      <div class="bg-dark-700 m-px p-2"></div>
      <div class="bg-dark-800 m-px p-2"></div>
      <div class="bg-dark-900 m-px p-2"></div>
    </div>
    <!-- primary -->
    <div class="flex">
      <p class="px-4 font-bold text-blue-500">primary:</p>
      <div class="bg-primary-50 m-px p-2"></div>
      <div class="bg-primary-100 m-px p-2"></div>
      <div class="bg-primary-200 m-px p-2"></div>
      <div class="bg-primary-300 m-px p-2"></div>
      <div class="bg-primary-400 m-px p-2"></div>
      <div class="bg-primary-500 m-px p-2"></div>
      <div class="bg-primary-600 m-px p-2"></div>
      <div class="bg-primary-700 m-px p-2"></div>
      <div class="bg-primary-800 m-px p-2"></div>
      <div class="bg-primary-900 m-px p-2"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "../global/store";
import { isDesktop } from "../global/helpers";
import DebugObject from "./DebugObject.vue";
import AppIcon from "../icons/AppIcon.vue";

const gitBranch = import.meta.env.VITE_GIT_BRANCH;
const gitHash = import.meta.env.VITE_GIT_COMMIT_HASH;
const store = useStore();
</script>
