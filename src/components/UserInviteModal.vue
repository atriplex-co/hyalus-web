<template>
  <ModalBase title="Add Friend" submit-text="Send" @submit="submit" @close="reset">
    <template #icon>
      <UserAddIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <div class="w-full space-y-2">
        <p>User</p>
        <div
          v-if="user"
          class="flex w-full items-center space-x-3 rounded-md border border-ctp-base bg-ctp-crust px-3 py-2"
        >
          <UserAvatar :avatar="user.avatar" class="h-8 w-8 rounded-full" />
          <div>
            <p class="text-sm font-bold">{{ user.name }}</p>
            <p class="text-sm slashed-zero text-ctp-subtext0">@{{ user.username }}</p>
          </div>
        </div>
      </div>
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";
import UserAvatar from "./UserAvatar.vue";
import UserAddIcon from "@/icons/UserAddIcon.vue";
import { onMounted, ref, type Ref } from "vue";
import { prettyError } from "@/global/helpers";
import axios from "axios";
import { useStore } from "@/global/store";

const store = useStore();
const user: Ref<{
  id: string;
  name: string;
  username: string;
  avatar: string | null;
} | null> = ref(null);
const error = ref("");

const reset = () => {
  store.invite = null;
};

const submit = async () => {
  if (store.friends.find((friend) => friend.username === store.invite)) {
    return;
  }

  try {
    await axios.post("/api/v1/friends", {
      username: store.invite,
    });
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  reset();
};

onMounted(async () => {
  try {
    const { data } = await axios.get(`/api/v1/users/by-username/${store.invite}`);

    user.value = data;
  } catch {
    reset();
  }
});
</script>
