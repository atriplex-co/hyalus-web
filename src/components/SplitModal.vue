<template>
  <ModalBase :empty="true" :backdrop="false" @close="$emit('close')">
    <div
      class="flex h-screen w-screen"
      :class="{
        'pt-[30px]': isDesktop,
      }"
    >
      <div class="w-[50%] bg-ctp-crust"></div>
      <div class="w-[50%] bg-ctp-mantle"></div>
    </div>
    <div
      class="fixed inset-0 flex justify-center"
      :class="{
        'pt-[30px]': isDesktop,
      }"
    >
      <div class="w-56 space-y-0.5 bg-ctp-crust pr-4 pt-16 text-ctp-subtext0">
        <slot name="left"></slot>
      </div>
      <div id="main" class="flex space-x-4 overflow-auto bg-ctp-mantle px-8">
        <div class="w-screen max-w-2xl pt-16">
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
        <div class="h-8 w-8 pt-16" @click="$emit('close')">
          <XCircleIcon
            class="absolute h-8 w-8 cursor-pointer text-ctp-overlay0 transition hover:text-ctp-text"
          />
        </div>
      </div>
    </div>
  </ModalBase>
</template>

<script setup lang="ts">
import ModalBase from "./ModalBase.vue";
import { XCircleIcon } from "@heroicons/vue/24/outline";
import { isDesktop } from "../global/helpers";

defineEmits(["close"]);
</script>
