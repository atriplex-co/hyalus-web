<template>
  <ModalBase
    title="Create Channel"
    submit-text="Create"
    @submit="submit"
    @close="$emit('close')"
  >
    <template #icon>
      <PlusIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <ModalInput v-model="name" type="text" label="Name" autofocus />
      <div class="w-full space-y-2">
        <p>Type</p>
        <div
          class="dark:bg-dark-900 dark:border-dark-600 flex w-full items-center space-x-3 rounded-md border border-gray-200 bg-gray-100 p-3 shadow-sm"
          @click="type = ChannelType.SpaceText"
        >
          <HashtagIcon
            class="dark:bg-dark-800 h-8 w-8 rounded-full bg-gray-200 p-2 text-gray-500 dark:text-gray-400"
          />
          <div class="flex-1">
            <p class="font-bold">Text Channel</p>
          </div>
          <CheckBox :model-value="type === ChannelType.SpaceText" />
        </div>
        <div
          class="dark:bg-dark-900 dark:border-dark-600 flex w-full items-center space-x-3 rounded-md border border-gray-200 bg-gray-100 p-3 shadow-sm"
          @click="type = ChannelType.SpaceVoice"
        >
          <SpeakerWaveIcon
            class="dark:bg-dark-800 h-8 w-8 rounded-full bg-gray-200 p-2 text-gray-500 dark:text-gray-400"
          />
          <div class="flex-1">
            <p class="font-bold">Voice Channel</p>
          </div>
          <CheckBox :model-value="type === ChannelType.SpaceVoice" />
        </div>
      </div>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import {
  HashtagIcon,
  PlusIcon,
  SpeakerWaveIcon,
} from "@heroicons/vue/20/solid";
import axios from "axios";
import { ChannelType } from "@/src/global/constants";
import { PropType, ref } from "vue";
import { prettyError } from "../global/helpers";
import { ISpace } from "../global/types";
import CheckBox from "./CheckBox.vue";
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";
import ModalInput from "./ModalInput.vue";

const emit = defineEmits(["close"]);
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
  parentId: {
    type: String,
    default: null,
  },
});
const error = ref("");
const name = ref("");
const type = ref(ChannelType.SpaceText);

const submit = async () => {
  error.value = "";

  try {
    await axios.post(`/api/v1/spaces/${props.space.id}/channels`, {
      parentId: props.parentId,
      name: name.value,
      type: type.value,
    });

    emit("close");
  } catch (e) {
    error.value = prettyError(e);
  }
};
</script>
