<template>
  <Teleport to="#app-inner">
    <!-- events are emitted manually since we're in a teleported element. -->
    <div @click="$emit('click', $event)">
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="ready1 && backdrop" class="fixed inset-0 z-40 bg-black bg-opacity-60" />
      </transition>
      <div
        v-if="ready1"
        class="fixed inset-0 flex items-center justify-center"
        :class="{
          'z-40': empty,
          'z-50': !empty,
        }"
        @mousedown="$emit('close')"
      >
        <transition
          enter-active-class="transition transform ease-out duration-200"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="transition transform ease-in duration-100"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div v-if="ready2" @mousedown.stop>
            <slot v-if="empty" />
            <div
              v-else
              class="w-screen max-w-md overflow-hidden rounded-md bg-ctp-mantle opacity-100 shadow-lg"
            >
              <div class="space-y-4 p-4">
                <div class="flex items-center space-x-3">
                  <div class="h-8 w-8 rounded-full bg-ctp-surface0 p-2">
                    <slot name="icon" />
                  </div>
                  <p class="text-xl font-bold">
                    {{ title }}
                  </p>
                </div>
                <form
                  class="flex flex-col items-start space-y-4 pb-2 text-sm"
                  @submit.prevent="$emit('submit')"
                >
                  <slot name="main" />
                </form>
              </div>
              <div class="flex items-center justify-between space-x-2 bg-ctp-crust p-4 text-sm">
                <div class="flex-1">
                  <slot name="submit" />
                </div>
                <div class="flex items-center">
                  <p
                    v-if="!required"
                    class="cursor-pointer px-4 py-2 text-ctp-subtext0 transition hover:text-ctp-text"
                    @click="$emit('close')"
                  >
                    {{ cancelText }}
                  </p>
                  <p
                    class="cursor-pointer rounded-md bg-ctp-accent px-4 py-2 text-ctp-base shadow-sm transition hover:bg-ctp-accent/75"
                    @click="$emit('submit')"
                  >
                    {{ submitText }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, nextTick } from "vue";

const ready1 = ref(false);
const ready2 = ref(false);
const emit = defineEmits(["close", "submit", "click"]);
defineProps({
  title: {
    type: String,
    default: "",
  },
  cancelText: {
    type: String,
    default: "Cancel",
  },
  submitText: {
    type: String,
    default: "Submit",
  },
  empty: {
    type: Boolean,
    default: false,
  },
  backdrop: {
    type: Boolean,
    default: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
});

const keydownHandler = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    emit("close");
    e.stopPropagation();
  }
};

onMounted(async () => {
  ready1.value = true;
  await nextTick();
  ready2.value = true;

  addEventListener("keydown", keydownHandler);
});

onUnmounted(() => {
  removeEventListener("keydown", keydownHandler);
});
</script>
