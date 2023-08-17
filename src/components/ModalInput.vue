<template>
  <div class="w-full space-y-2">
    <p>{{ label }}</p>
    <input
      ref="input"
      class="ring-ctp-accent border-ctp-base w-full rounded-md border bg-ctp-crust px-3 py-2 text-ctp-subtext0 shadow-sm transition focus:outline-none focus:ring-2"
      :type="type"
      :value="modelValue"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      spellcheck="false"
      @input="$emit('update:modelValue', ($event?.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, type Ref, onMounted } from "vue";

const input: Ref<HTMLInputElement | null> = ref(null);

const props = defineProps({
  type: {
    type: String,
    default: "text",
  },
  label: {
    type: String,
    default: "",
  },
  modelValue: {
    type: String,
    default: "",
  },
  autocomplete: {
    type: String,
    default: "",
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "",
  },
});

defineEmits(["update:modelValue"]);

onMounted(() => {
  if (input.value && props.autofocus) {
    input.value.focus();
  }
});
</script>
