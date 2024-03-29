<template>
  <div ref="root" class="cursor-pointer" @click="open = !open">
    <div
      class="group flex items-center justify-between border border-ctp-surface0/50 bg-ctp-crust px-2 py-1 shadow-sm transition hover:border-ctp-surface0"
      :class="{
        'rounded-md': !open,
        'rounded-t-md': open,
      }"
    >
      <div class="flex items-center space-x-2">
        <slot name="selected" />
      </div>
      <ArrowDownIcon class="h-4 w-4 text-ctp-subtext0 group-hover:text-ctp-text" />
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
          class="absolute -mt-px flex max-h-32 w-full flex-col overflow-auto rounded-b-md border border-ctp-surface0/50 bg-ctp-crust shadow-lg"
        >
          <slot name="items" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ArrowDownIcon from "@/icons/ArrowDownIcon.vue";
import { onBeforeUnmount, ref, type Ref } from "vue";

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
