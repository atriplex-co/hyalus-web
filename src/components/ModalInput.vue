<template>
  <div class="w-full space-y-2">
    <p>{{ label }}</p>
    <input
      ref="input"
      class="ring-primary-500 dark:bg-dark-900 dark:border-dark-600 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm transition placeholder:text-gray-600 focus:outline-none focus:ring dark:text-gray-400"
      :type="type"
      :value="modelValue"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      spellcheck="false"
      @input="
        $emit('update:modelValue', ($event?.target as HTMLInputElement).value)
      "
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted } from "vue";

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
