<template>
  <div class="flex h-6 items-center justify-between text-ctp-subtext0">
    <p>{{ name }} ({{ permission }})</p>
    <InputBoolean
      v-if="allowed && deny === null"
      :model-value="!!(allow & permission)"
      @update:model-value="$emit('update:allow', allow ^ permission)"
    />
    <div
      v-if="allowed && deny !== null"
      class="flex divide-x divide-ctp-base overflow-hidden rounded-md border border-ctp-base bg-ctp-crust shadow-sm"
    >
      <div
        class="flex h-6 w-6 items-center justify-center"
        :class="{
          'bg-ctp-red text-ctp-base': deny & permission,
        }"
        @click="
          $emit('update:allow', allow & ~permission);
          $emit('update:deny', deny | permission);
        "
      >
        <!-- <p>-</p> -->
        <MinusIcon class="h-4 w-4" />
      </div>
      <div
        class="flex h-6 w-6 items-center justify-center"
        :class="{
          'bg-ctp-surface0/50': !(allow & permission) && !(deny & permission),
        }"
        @click="
          $emit('update:allow', allow & ~permission);
          $emit('update:deny', deny & ~permission);
        "
      >
        <p class="font-bold">/</p>
      </div>
      <div
        class="flex h-6 w-6 items-center justify-center"
        :class="{
          'bg-ctp-green text-ctp-base': allow & permission,
        }"
        @click="
          $emit('update:allow', allow | permission);
          $emit('update:deny', deny & ~permission);
        "
      >
        <!-- <p>+</p> -->
        <PlusIcon class="h-4 w-4" />
      </div>
    </div>
    <div v-if="!allowed" class="flex h-6 w-6 items-center justify-center">
      <LockClosedIcon class="h-4 w-4 text-ctp-subtext0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { LockClosedIcon, MinusIcon, PlusIcon } from "@heroicons/vue/20/solid";
import { computed, type PropType } from "vue";
import { checkSpacePermissions } from "@/global/helpers";
import { type ISpace } from "@/global/types";
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
