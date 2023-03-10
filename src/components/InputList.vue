<template>
  <div ref="root" class="cursor-pointer" @click="open = !open">
    <div
      class="dark:border-dark-600 dark:hover:border-dark-400 flex w-96 items-center justify-between border border-gray-200 bg-gray-100 px-2 py-1 shadow-sm transition hover:border-gray-300 dark:bg-gray-800 dark:bg-opacity-50"
      :class="{
        'rounded-md': !open,
        'rounded-t-md': open,
      }"
    >
      <div class="flex items-center space-x-2">
        <slot name="selected" />
      </div>
      <ArrowDownIcon class="h-4 w-4 text-gray-400" />
    </div>
    <div class="relative z-20">
      <transition
        enter-active-class="transition transform ease-out duration-100 origin-top"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition transform ease-in duration-75 origin-top"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="open"
          class="dark:border-dark-600 absolute -mt-px flex max-h-32 w-96 flex-col overflow-auto rounded-b-md border border-gray-200 bg-gray-100 shadow-lg dark:bg-[#1c1c1c]"
        >
          <slot name="items" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ArrowDownIcon from "../icons/ArrowDownIcon.vue";
import { onBeforeUnmount, ref, Ref } from "vue";

const open = ref(false);
const root: Ref<HTMLDivElement | null> = ref(null);

const close = ({ target }: { target: EventTarget | null }) => {
  let el = target as HTMLElement;

  let isFromRoot = false;

  while (el.parentElement) {
    if (el.parentElement === root.value) {
      isFromRoot = true;
    }

    el = el.parentElement;
  }

  if (!isFromRoot) {
    open.value = false;
  }
};

addEventListener("click", close);

onBeforeUnmount(() => {
  removeEventListener("click", close);
});
</script>
