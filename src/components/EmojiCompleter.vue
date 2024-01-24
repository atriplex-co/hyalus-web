<template>
  <div v-if="options.length" class="p-2 text-sm">
    <CompleterOption
      v-for="option in options"
      :key="option.id"
      :selected="options.indexOf(option) === selected"
      class="flex justify-between items-center"
      @replace="$emit('replace', `:${option.id}: `)"
      @select="selected = options.indexOf(option)"
    >
      <div class="flex items-center space-x-2">
        <img :src="option.url" class="w-4 h-4" />
        <p>{{ option.name }}</p>
      </div>
      <div v-if="option.space" class="text-ctp-overlay0">
        {{ option.space.name }}
      </div>
    </CompleterOption>
  </div>
</template>

<script setup lang="ts">
import { emojis as _emojis } from "hyalus-fluentui-emoji/dist/metadata.json";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import CompleterOption from "./CompleterOption.vue";
import type { ISpace } from "@/global/types";
import { useStore } from "@/global/store";
import { uuidToB32 } from "@/global/helpers";

interface IEmojiOption {
  id: string;
  name: string;
  url: string;
  space?: ISpace;
}

defineEmits(["replace"]);
const props = defineProps({
  query: {
    type: String,
    required: true,
  },
});
const selected = ref(0);
const store = useStore();

const options = computed(() => {
  let ret: IEmojiOption[] = [];
  ret = ret.concat(
    _emojis
      .filter((emoji) => emoji.id.toLowerCase().includes(props.query.toLowerCase()))
      .map((emoji) => ({
        id: emoji.id,
        name: emoji.name,
        url: `/fluentui-emoji/${emoji.asset}`,
      })),
  );
  for (const space of store.spaces) {
    ret = ret.concat(
      space.emojis
        .filter((emoji) => emoji.name.toLowerCase().includes(props.query.toLowerCase()))
        .map((emoji) => ({
          id: uuidToB32(emoji.id).toLowerCase(),
          name: emoji.name,
          url: `/api/v1/emojis/${emoji.id}`,
          space,
        })),
    );
  }
  let ret2: typeof ret = [];
  ret2 = ret2.concat(
    ret.filter((emoji) => emoji.name.toLowerCase().startsWith(props.query.toLowerCase())),
  );
  ret2 = ret2.concat(
    ret.filter(
      (emoji) =>
        !ret2.includes(emoji) && emoji.name.toLowerCase().includes(props.query.toLowerCase()),
    ),
  );
  return ret2.slice(0, 15);
});

watch(
  () => options.value,
  () => {
    selected.value = 0;
  },
);

const keydownHandler = (e: KeyboardEvent) => {
  if (e.key === "ArrowUp" && options.value.length) {
    e.preventDefault();
    if (selected.value > 0) {
      selected.value--;
    } else {
      selected.value = options.value.length - 1;
    }
  }

  if (e.key === "ArrowDown" && options.value.length) {
    e.preventDefault();
    if (selected.value < options.value.length - 1) {
      selected.value++;
    } else {
      selected.value = 0;
    }
  }
};

onMounted(() => {
  addEventListener("keydown", keydownHandler);
});

onUnmounted(() => {
  removeEventListener("keydown", keydownHandler);
});
</script>
