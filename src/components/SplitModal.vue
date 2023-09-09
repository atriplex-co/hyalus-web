<template>
  <ModalBase :empty="true" :backdrop="false" @close="$emit('close')">
    <div
      class="flex h-screen w-screen"
      :class="{
        'pt-[30px]': isDesktop,
      }"
    >
      <div
        class="w-[calc(50vw-(48rem/2)+(16rem/2))] bg-ctp-crust flex flex-col items-end px-4 pt-16 text-ctp-subtext0"
      >
        <div class="w-56 space-y-0.5">
          <slot name="left"></slot>
        </div>
      </div>
      <div
        class="w-[calc(50vw-(16rem/2)+(48rem/2))] bg-ctp-mantle pt-16 px-8 flex space-x-4 min-w-0 overflow-auto"
      >
        <div class="max-w-2xl w-screen">
          <transition
            enter-active-class="transition transform duration-75 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            mode="out-in"
          >
            <slot name="right"></slot>
          </transition>
          <div class="pb-8"></div>
        </div>
        <XCircleIcon
          class="h-7 w-7 cursor-pointer text-ctp-overlay0 transition hover:text-ctp-text"
          @click="$emit('close')"
        />
      </div>
    </div>
  </ModalBase>
</template>

<script setup lang="ts">
import ModalBase from "./ModalBase.vue";
import { XCircleIcon } from "@heroicons/vue/24/outline";
import { isDesktop } from "@/global/helpers";

defineEmits(["close"]);
</script>
