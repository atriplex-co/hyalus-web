<template>
  <ModalBase
    title="Edit Message"
    submit-text="Edit"
    @submit="messageBoxSubmit"
    @close="$emit('close')"
  >
    <template #icon>
      <PencilIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <p>Users can see if a message is edited.</p>
      <textarea
        ref="messageBox"
        v-model="messageBoxText"
        rows="1"
        placeholder="Send a message"
        class="ring-ctp-accent bg-ctp-crust border-ctp-base max-h-32 w-full resize-none rounded-md border px-4 py-2 shadow-sm outline-none transition focus:outline-none focus:ring text-ctp-subtext0 placeholder:text-ctp-overlay0"
        @input="messageBoxInput"
        @keydown="messageBoxKeydown"
      />
    </template>
  </ModalBase>
</template>

<script lang="ts" setup>
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";
import { ref, PropType, Ref, onMounted } from "vue";
import { prettyError } from "../global/helpers";
import { IMessage, IChannel } from "../global/types";
import sodium from "libsodium-wrappers";
import PencilIcon from "../icons/PencilIcon.vue";
import axios from "axios";
import { useStore } from "../global/store";
import msgpack from "msgpack-lite";

const store = useStore();
const props = defineProps({
  message: {
    type: Object as PropType<IMessage>,
    default() {
      //
    },
  },
  channel: {
    type: Object as PropType<IChannel>,
    default() {
      //
    },
  },
});
const emit = defineEmits(["close"]);
const messageBox: Ref<HTMLTextAreaElement | null> = ref(null);
const messageBoxText = ref(props.message.dataString || "");
const error = ref("");

const messageBoxSubmit = async () => {
  const data = messageBoxText.value.trim();

  try {
    if (data) {
      if (!store.self || !store.config.publicKey || !store.config.privateKey) {
        return;
      }

      const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
      const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

      const keys: Record<string, Uint8Array> = {};

      for (const member of props.channel.members) {
        const userKeyNonce = sodium.randombytes_buf(
          sodium.crypto_secretbox_NONCEBYTES,
        );

        keys[member.id] = new Uint8Array([
          ...userKeyNonce,
          ...sodium.crypto_box_easy(
            key,
            userKeyNonce,
            member.publicKey,
            store.config.privateKey,
          ),
        ]);
      }

      const selfKeyNonce = sodium.randombytes_buf(
        sodium.crypto_secretbox_NONCEBYTES,
      );

      keys[store.self.id] = new Uint8Array([
        ...selfKeyNonce,
        ...sodium.crypto_box_easy(
          key,
          selfKeyNonce,
          store.config.publicKey,
          store.config.privateKey,
        ),
      ]);

      await axios.patch(
        `/api/v1/channels/${props.channel.id}/messages/${props.message.id}`,
        {
          data: sodium.to_base64(
            msgpack.encode({
              data: new Uint8Array([
                ...nonce,
                ...sodium.crypto_secretbox_easy(data, nonce, key),
              ]),
              keys,
            }),
          ),
        },
      );
    } else {
      await axios.delete(
        `/api/v1/channels/${props.channel.id}/messages/${props.message.id}`,
      );
    }
  } catch (e) {
    error.value = prettyError(e);
    return;
  }

  emit("close");
};

const messageBoxInput = () => {
  if (!messageBox.value) {
    return;
  }

  messageBox.value.focus();
  messageBox.value.style.height = "auto";
  messageBox.value.style.height = `${messageBox.value.scrollHeight + 2}px`; // +2px for border
};

const messageBoxKeydown = (e: KeyboardEvent) => {
  if (e.code === "Enter" && !e.shiftKey) {
    e.preventDefault();
    messageBoxSubmit();
  }
};

onMounted(() => {
  setTimeout(() => {
    messageBoxInput();
  }, 10);
});
</script>
