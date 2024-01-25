<template>
  <span class="cursor-pointer font-semibold hover:underline" @click="profileOpen = true">@{{ name }}</span>
  <UserModal v-if="profileOpen" @close="profileOpen = false" :id="id" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import UserModal from "./UserModal.vue";
import { useStore } from "@/global/store";

const store = useStore();
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});
const profileOpen = ref(false);

const user = computed(() => {
  if (store.self && store.self.id === props.id) {
    return store.self;
  }
  for (const channel of store.channels) {
    for (const member of channel.members) {
      if (member.id === props.id) {
        return member;
      }
    }
  }
  for (const space of store.spaces) {
    for (const member of space.members) {
      if (member.id === props.id) {
        return member;
      }
    }
  }
  const cachedUser = store.cachedUsers.get(props.id);
  if (cachedUser) {
    return cachedUser;
  }
  return null;
});

const name = computed(() => {
  if (user.value) {
    return user.value.name;
  }
  return props.id;
});
</script>
