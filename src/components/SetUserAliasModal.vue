<template>
  <ModalBase title="Set User Nickname" @submit="submit" @close="$emit('close')" submit-text="Save">
    <template #icon>
      <PencilSquareIcon />
    </template>
    <template #main>
      <ModalInput
        label="Nickname"
        type="text"
        v-model="nickname"
      />
    </template>
    <template #submit>
      <button
        class="hover:bg-ctp-base:bg-dark-400 cursor-pointer rounded-md bg-ctp-base px-4 py-2 text-ctp-subtext0 shadow-sm transition hover:text-white"
        @click="
          nickname = '';
          submit();
        "
      >
        Reset
      </button>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import { PencilSquareIcon } from "@heroicons/vue/24/solid";
import ModalBase from "./ModalBase.vue";
import ModalInput from "./ModalInput.vue";
import { ref } from "vue";
import { useStore } from "@/global/store";

const store = useStore();
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["close"]);

const nickname = ref(store.self!.userConfig.userAliases[props.id] ?? "");

const submit = async () => {
  if (nickname.value) {
    store.self!.userConfig.userAliases[props.id] = nickname.value;
  } else {
    delete store.self!.userConfig.userAliases[props.id];
  }
  emit("close");
  await store.updateUserConfig();
};
</script>
