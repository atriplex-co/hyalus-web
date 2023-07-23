<template>
  <div class="flex h-6 items-center justify-between">
    <p>{{ name }} ({{ permission }})</p>
    <InputBoolean
      v-if="allowed && deny === null"
      :model-value="!!(allow & permission)"
      @update:model-value="$emit('update:allow', allow ^ permission)"
    />
    <div
      v-if="allowed && deny !== null"
      class="dark:bg-dark-800 dark:border-dark-600 divide-dark-600 flex divide-x overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm"
    >
      <div
        class="flex h-6 w-6 items-center justify-center"
        :class="{
          'bg-red-500': deny & permission,
        }"
        @click="
          $emit('update:allow', allow & ~permission);
          $emit('update:deny', deny | permission);
        "
      >
        <p>-</p>
      </div>
      <div
        class="flex h-6 w-6 items-center justify-center"
        :class="{
          'bg-dark-400': !(allow & permission) && !(deny & permission),
        }"
        @click="
          $emit('update:allow', allow & ~permission);
          $emit('update:deny', deny & ~permission);
        "
      >
        <p>/</p>
      </div>
      <div
        class="flex h-6 w-6 items-center justify-center"
        :class="{
          'bg-ctp-accent': allow & permission,
        }"
        @click="
          $emit('update:allow', allow | permission);
          $emit('update:deny', deny & ~permission);
        "
      >
        <p>+</p>
      </div>
    </div>
    <div v-if="!allowed" class="flex h-6 w-6 items-center justify-center">
      <LockClosedIcon class="h-4 w-4 text-gray-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { LockClosedIcon } from "@heroicons/vue/20/solid";
import { computed, PropType } from "vue";
import { checkSpacePermissions } from "../global/helpers";
import { ISpace } from "../global/types";
import InputBoolean from "./InputBoolean.vue";

const props = defineProps({
  name: {
    type: String,
    default: "",
  },
  permission: {
    type: Number,
    default: 0,
  },
  allow: {
    type: Number,
    default: null,
  },
  deny: {
    type: Number,
    default: null,
  },
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
defineEmits(["update:allow", "update:deny"]);

const allowed = computed(() =>
  checkSpacePermissions({
    permissions: props.permission,
    spaceId: props.space.id,
  }),
);
</script>
