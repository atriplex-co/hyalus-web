<template>
  <div v-if="options.length" class="p-2 text-sm">
    <CompleterOption
      v-for="option in options"
      :key="option.id"
      :selected="options.indexOf(option) === selected"
      class="flex items-center space-x-2"
      @replace="$emit('replace', `<@${uuidToB32(option.id).toLowerCase()}> `)"
      @select="selected = options.indexOf(option)"
    >
      <UserAvatar :avatar="option.avatar" class="h-4 w-4" />
      <p>{{ option.name }}</p>
    </CompleterOption>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type PropType } from "vue";
import CompleterOption from "./CompleterOption.vue";
import type { IChannel, IChannelMember, ISelf, ISpaceMember } from "@/global/types";
import { useStore } from "@/global/store";
import { uuidToB32 } from "@/global/helpers";
import UserAvatar from "./UserAvatar.vue";

defineEmits(["replace"]);
const props = defineProps({
  query: {
    type: String,
    required: true,
  },
  channel: {
    type: Object as PropType<IChannel>,
    required: true,
  },
});
const selected = ref(0);
const store = useStore();

const options = computed(() => {
  let ret: (IChannelMember | ISpaceMember | ISelf)[] = [];
  let members: (IChannelMember | ISpaceMember | ISelf)[] = Array.from(props.channel.members);
  if (props.channel.spaceId) {
    const space = store.spaces.find((space) => space.id === props.channel.spaceId);
    if (space) {
      members = Array.from(space.members);
    }
  }
  if (!members.find((member) => member.id === store.self!.id)) {
    members.push(store.self!);
  }
  ret = ret.concat(
    members.filter(
      (member) =>
        member.name.toLowerCase().startsWith(props.query.toLowerCase()) ||
        member.username.toLowerCase().startsWith(props.query.toLowerCase()),
    ),
  );
  ret = ret.concat(
    members.filter(
      (member) =>
        !ret.includes(member) &&
        (member.name.toLowerCase().includes(props.query.toLowerCase()) ||
          member.username.toLowerCase().includes(props.query.toLowerCase())),
    ),
  );
  return ret.slice(0, 15);
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
