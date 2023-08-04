<template>
  <ModalBase
    title="Create Invite"
    cancel-text=""
    submit-text="Close"
    @submit="$emit('close')"
    @close="$emit('close')"
  >
    <template #icon>
      <UserPlusIcon />
    </template>
    <template #main>
      <p class="text-ctp-accent">
        WARNING: Spaces are currently experimental and may be wiped during development!
      </p>
      <ModalError v-if="error" :error="error" />
      <div v-if="code">
        <p class="select-all">{{ code }}</p>
        <p class="select-all">{{ url }}</p>
      </div>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";
import { onMounted, type PropType, ref } from "vue";
import { prettyError } from "../global/helpers";
import axios from "axios";
import type { ISpace } from "../global/types";
import { UserPlusIcon } from "@heroicons/vue/20/solid";

defineEmits(["close"]);
const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
const error = ref("");
const code = ref("");
const url = ref("");

onMounted(async () => {
  try {
    const { data } = await axios.post(`/api/v1/spaces/${props.space.id}/invites`, {
      // TODO: implement expiresAt in SpaceInviteCreateModal
    });

    code.value = data.code;
    url.value = `${location.origin}/invite/${data.code}`;
  } catch (e) {
    error.value = prettyError(e);
  }
});
</script>
