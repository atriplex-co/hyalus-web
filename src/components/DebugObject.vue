<template>
  <div>
    <p v-if="b64" class="text-white">{{ b64 }}</p>
    <div
      v-for="[k, v] in Object.entries(obj).filter((a) => a[1] !== undefined)"
      v-else
      :key="k"
      class="flex space-x-2"
    >
      <p class="font-bold">{{ k }}:</p>
      <p class="text-purple-500">{{ typeof v }}</p>
      <DebugObject v-if="v && v === Object(v)" :obj="v" />
      <p v-else class="text-white">{{ v }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { to_base64 } from "libsodium-wrappers";

const props = defineProps({
  obj: {
    type: Object,
    default() {
      //
    },
  },
});

const b64 = props.obj instanceof Uint8Array && to_base64(props.obj);
</script>
