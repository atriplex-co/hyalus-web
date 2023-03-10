<template>
  <div
    v-if="channel"
    class="dark:bg-dark-700 flex min-h-0 min-w-0 flex-1 flex-col"
    @paste="processFiles($event.clipboardData)"
    @drop.prevent="processFiles($event.dataTransfer)"
    @dragover.prevent
    @dragstart.prevent
    @dragsend.prevent
  >
    <div
      class="dark:bg-dark-600 relative z-10 min-h-[56px] w-full bg-gray-100 shadow-md"
      :class="{
        'bg-black': inVoice,
      }"
    >
      <div class="absolute w-full">
        <ChannelHeader v-if="!inVoice" :channel="channel" :space="space" />
      </div>
      <transition
        enter-active-class="transition transform ease-out duration-100 origin-top"
        enter-from-class="opacity-0 scale-y-95"
        enter-to-class="opacity-100 scale-y-100"
        leave-active-class="transition transform ease-in duration-75 origin-top"
        leave-from-class="opacity-100 scale-y-100"
        leave-to-class="opacity-0 scale-y-95"
      >
        <ChannelCall v-if="inVoice" />
      </transition>
      <p
        v-if="!writable"
        class="dark:bg-dark-900 bg-gray-200 px-4 py-2 text-sm"
      >
        You can't send messages in this channel.
      </p>
    </div>
    <div class="flex min-h-0 flex-1">
      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <div class="relative min-h-0 w-full flex-1">
          <div v-if="typingStatus" class="absolute z-10 w-full p-2">
            <div
              class="dark:bg-dark-600 flex w-full items-center space-x-4 rounded-md bg-gray-100 px-4 py-2 text-sm shadow-md"
            >
              <PencilIcon class="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <p>{{ typingStatus }}</p>
            </div>
          </div>
          <div
            id="messageList"
            ref="messageList"
            class="flex h-full min-w-0 flex-1 flex-col overflow-auto"
            @scroll="scrollUpdated = true"
          >
            <div
              id="messageListBefore"
              ref="messageListBefore"
              class="flex-1 pt-16"
            ></div>
            <div class="space-y-1">
              <MessageItem
                v-for="[k, message] in Object.entries(channel.messages)"
                :key="k"
                :index="+k"
                :message="message"
                :channel="channel"
                :space="space"
              />
            </div>
            <div
              id="messageListAfter"
              ref="messageListAfter"
              class="pb-4"
            ></div>
          </div>
        </div>
        <div
          v-if="writable"
          class="bg-dark-600 m-4 mt-0 flex items-center space-x-4 rounded-md py-2 px-4 shadow-lg"
        >
          <textarea
            ref="messageBox"
            v-model="messageBoxText"
            rows="1"
            :placeholder="`Message ${name}`"
            class="max-h-32 flex-1 resize-none border-transparent bg-transparent text-sm outline-none placeholder:text-gray-400 focus:border-transparent dark:placeholder:text-gray-500"
            @input="messageBoxInput"
            @keydown="messageBoxKeydown"
          />
          <div class="flex space-x-2 text-gray-400">
            <div @click="attachFile">
              <PaperclipIcon
                class="h-8 w-8 cursor-pointer rounded-full bg-gray-100 p-2 transition hover:text-gray-800 dark:bg-gray-900 dark:hover:text-white"
              />
            </div>
            <div @click="messageBoxSubmit">
              <AirplaneIcon
                class="h-8 w-8 cursor-pointer rounded-full bg-gray-100 p-2 transition hover:text-gray-800 dark:bg-gray-900 dark:hover:text-white"
              />
            </div>
          </div>
        </div>
      </div>
      <ChannelMemberList
        v-if="
          store.config.showChannelMembers && channel.type !== ChannelType.DM
        "
        :channel="channel"
        :space="space"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import PaperclipIcon from "../icons/PaperclipIcon.vue";
import AirplaneIcon from "../icons/AirplaneIcon.vue";
import MessageItem from "../components/MessageItem.vue";
import PencilIcon from "../icons/PencilIcon.vue";
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  Ref,
  nextTick,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  checkSpacePermissions,
  getChannelState,
  processMessage,
} from "../global/helpers";
import {
  ChannelType,
  MessageType,
  SocketMessageType,
  SpacePermission,
} from "@/src/global/constants";
import sodium from "libsodium-wrappers";
import ChannelCall from "../components/ChannelCall.vue";
import { MaxFileSize, MaxFileChunkSize } from "../global/config";
import axios from "axios";
import { useStore } from "../global/store";
import ChannelHeader from "../components/ChannelHeader.vue";
import msgpack from "msgpack-lite";
import ChannelMemberList from "../components/ChannelMemberList.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();
const messageBoxText = ref("");
const messageBox: Ref<HTMLTextAreaElement | null> = ref(null);
const messageList: Ref<HTMLDivElement | null> = ref(null);
const messageListBefore: Ref<HTMLDivElement | null> = ref(null);
const messageListAfter: Ref<HTMLDivElement | null> = ref(null);
const typingStatus = ref("");
let lastTyping = 0;
const scrollUpdated = ref(false); // make sure chat is scrolled down when initially loaded.
let updateTypingStatusTimeout = 0;

const channel = computed(() => {
  return store.channels.find(
    (channel) => channel.id === route.params.channelId
  );
});

const space = computed(() => {
  return store.spaces.find((space) => space.id === channel.value?.spaceId);
});

const members = computed(() => {
  if (space.value) {
    return space.value.members;
  }

  if (channel.value) {
    return channel.value.members;
  }

  return [];
});

const name = computed(() => {
  if (!channel.value) {
    return "";
  }

  if (channel.value.type === ChannelType.DM) {
    return members.value[0].name;
  }

  return channel.value.name;
});

const writable = computed(() => {
  if (!channel.value) {
    return false;
  }

  if (channel.value.type === ChannelType.DM) {
    const friendId = members.value[0].id;

    return store.friends.find((friend) => friend.id === friendId)?.accepted;
  }

  if (channel.value.spaceId) {
    return checkSpacePermissions({
      permissions: SpacePermission.ViewChannels | SpacePermission.CreateMessage,
      spaceId: channel.value.spaceId,
      channelId: channel.value.id,
    });
  }

  return true;
});

const inVoice = computed(() => {
  return store.call && store.call.channelId === channel.value?.id;
});

const getMessages = async () => {
  const channelVal = channel.value;

  if (!channelVal) {
    return;
  }

  const sortedMessages = Array.from(channelVal.messages).sort((a, b) =>
    a.createdAt > b.createdAt ? 1 : -1
  );

  const {
    data: messages,
  }: {
    data: {
      id: string;
      type: MessageType;
      createdAt: number;
      updatedAt: number;
      author: {
        id: string;
        name: string;
        username: string;
        avatar: string | null;
      };
      data: string | null;
    }[];
  } = await axios.get(
    `/api/v1/channels/${channelVal.id}/messages${
      channelVal.messages.length
        ? `?before=${+sortedMessages[0].createdAt}`
        : ""
    }`
  );

  messages.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  const processedMessages = [];

  for (const message of messages) {
    const processedMessage = await processMessage({
      ...message,
      channel: channelVal,
    });

    if (
      !processedMessage ||
      channelVal.messages.find(({ id }) => id === processedMessage.id)
    ) {
      continue;
    }

    processedMessages.push(processedMessage);
  }

  const beforeScrollHeight = messageList.value?.scrollHeight;
  channelVal.messages = processedMessages.concat(channelVal.messages);
  await nextTick();

  if (messageList.value && beforeScrollHeight) {
    messageList.value.scrollTop +=
      messageList.value.scrollHeight - beforeScrollHeight;
  }
};

const packMessage = (input: string | Uint8Array) => {
  if (
    !channel.value ||
    !store.self ||
    !store.config.publicKey ||
    !store.config.privateKey
  ) {
    return "";
  }

  let data = typeof input === "string" ? sodium.from_string(input) : input;

  if (channel.value.members.length) {
    const keys: Record<string, Uint8Array> = {};
    const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

    for (const member of channel.value.members) {
      const userKeyNonce = sodium.randombytes_buf(
        sodium.crypto_secretbox_NONCEBYTES
      );

      keys[member.id] = new Uint8Array([
        ...userKeyNonce,
        ...sodium.crypto_box_easy(
          key,
          userKeyNonce,
          member.publicKey,
          store.config.privateKey
        ),
      ]);
    }

    const selfKeyNonce = sodium.randombytes_buf(
      sodium.crypto_secretbox_NONCEBYTES
    );

    keys[store.self.id] = new Uint8Array([
      ...selfKeyNonce,
      ...sodium.crypto_box_easy(
        key,
        selfKeyNonce,
        store.config.publicKey,
        store.config.privateKey
      ),
    ]);

    data = msgpack.encode({
      data: new Uint8Array([
        ...nonce,
        ...sodium.crypto_secretbox_easy(input, nonce, key),
      ]),
      keys,
    });
  }

  return sodium.to_base64(data);
};

const messageBoxSubmit = async () => {
  const data = messageBoxText.value.trim();
  messageBoxText.value = "";
  await nextTick();
  messageBoxInput();

  if (!data || !channel.value) {
    return;
  }

  await axios.post(`/api/v1/channels/${channel.value.id}/messages`, {
    data: packMessage(data),
  });
};

const messageBoxInput = async () => {
  if (!messageBox.value) {
    return;
  }

  messageBox.value.focus();
  messageBox.value.style.height = "auto";
  messageBox.value.style.height = `${messageBox.value.scrollHeight}px`;

  if (store.self?.typingEvents && +new Date() - 2000 > lastTyping) {
    lastTyping = +new Date();

    store.socket?.send({
      t: SocketMessageType.CChannelTyping,
      d: {
        id: channel.value?.id,
      },
    });
  }
};

const messageBoxKeydown = (e: KeyboardEvent) => {
  if (e.code === "Enter" && !e.shiftKey) {
    e.preventDefault();
    messageBoxSubmit();
  }
};

const uploadFile = async (file: File) => {
  if (!channel.value) {
    return;
  }

  if (file.size > MaxFileSize) {
    console.warn(`file too large: ${file.size} > ${MaxFileChunkSize}`);
    return;
  }

  const now = performance.now();
  const key = sodium.crypto_secretstream_xchacha20poly1305_keygen();
  const { state, header } =
    sodium.crypto_secretstream_xchacha20poly1305_init_push(key);
  const reader = new FileReader();
  const root = await navigator.storage.getDirectory();
  const output = await root.getFileHandle(`tmp_${+new Date()}`, {
    create: true,
  });
  const writer = (
    await (
      output as unknown as {
        createWritable(): Promise<WritableStream<Uint8Array>>;
      }
    ).createWritable()
  ).getWriter();

  for (let i = 0; i < Math.ceil(file.size / MaxFileChunkSize); i++) {
    const chunk = sodium.crypto_secretstream_xchacha20poly1305_push(
      state,
      await new Promise((cb) => {
        reader.onload = () => cb(new Uint8Array(reader.result as ArrayBuffer));
        reader.readAsArrayBuffer(
          file.slice(
            i * MaxFileChunkSize,
            i * MaxFileChunkSize + MaxFileChunkSize
          )
        );
      }),
      "",
      sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE
    );

    await writer.write(chunk);
  }

  await writer.close();
  console.debug(`encrypt: ${file.size}b - ${performance.now() - now}ms`);
  const data = JSON.stringify({
    v: 0,
    name: file.name,
    type: file.type,
    size: file.size,
    header: sodium.to_base64(header),
    key: sodium.to_base64(key),
  });
  const form = new FormData();
  form.append("data", packMessage(data));
  form.append("upload", await output.getFile());

  try {
    await axios.post(`/api/v1/channels/${channel.value.id}/messages`, form);
  } catch (e) {
    console.log(e);
  }

  await root.removeEntry(output.name);
};

const processFiles = async (data: DataTransfer | null) => {
  if (!data) {
    return;
  }

  for (const item of Array.from(data.items)) {
    const file = item.getAsFile();

    if (file) {
      await uploadFile(file);
    }
  }
};

const attachFile = async () => {
  const el = document.createElement("input");

  el.addEventListener("input", async () => {
    if (!el.files) {
      return;
    }

    for (const file of [...(el.files as unknown as File[])]) {
      await uploadFile(file);
    }
  });

  el.type = "file";
  el.multiple = true;
  el.click();
};

const updateTitle = () => {
  if (!name.value) {
    document.title = "Hyalus";
    return;
  }
  document.title = `Hyalus \u2022 ${name.value}`;
};

const updateLastChannel = async () => {
  if (!channel.value) {
    return;
  }

  let k = "lastOpenChannelId:";

  if (channel.value.spaceId) {
    k += `space:${channel.value.spaceId}`;
  } else {
    k += "home";
  }

  await store.writeConfig(k, channel.value.id);
};

const updateTypingStatus = () => {
  if (!channel.value) {
    return;
  }

  const typingUsers = [...members.value]
    .filter((member) =>
      store.typingStates.find(
        (state) =>
          state.id === member.id &&
          state.channelId === channel.value?.id &&
          +state.time > +new Date() - 1000 * 3
      )
    )
    .map((member) => member.name);

  typingStatus.value =
    typingUsers.length < 4
      ? [
          "",
          `${typingUsers[0]} is typing...`,
          `${typingUsers[0]}, and ${typingUsers[1]} are typing...`,
          `${typingUsers[0]}, ${typingUsers[1]}, and ${typingUsers[2]} are typing...`,
        ][typingUsers.length]
      : "Many users are typing...";

  clearTimeout(updateTypingStatusTimeout);
  updateTypingStatusTimeout = +setTimeout(updateTypingStatus, 3000);
};

const updateReadAt = async () => {
  if (!channel.value) {
    return;
  }

  const state = getChannelState(channel.value);

  if (+state.readAt === +channel.value.activeAt) {
    return;
  }

  await axios.post(`/api/v1/channels/${channel.value.id}/state`, {
    readAt: +channel.value.activeAt,
    mentionCount: 0,
  });
};

watch(
  () => channel.value,
  () => {
    updateTitle();
    updateLastChannel();
  }
);

watch(
  () => [channel.value, store.typingStates],
  () => {
    updateTypingStatus();
  }
);

watch(
  () => !!channel.value,
  async () => {
    if (!channel.value) {
      await router.push("/app");
      return;
    }
  }
);

onMounted(async () => {
  if (!channel.value) {
    return;
  }

  updateTitle();
  updateLastChannel();
  updateTypingStatus();

  if (messageList.value && messageListBefore.value && messageListAfter.value) {
    const updateScroll = () => {
      if (!messageList.value) {
        return;
      }

      if (!scrollUpdated.value) {
        messageList.value.scrollTop = messageList.value.scrollHeight;
      }
    };

    new ResizeObserver(() => {
      updateScroll();
    }).observe(messageList.value);

    new MutationObserver(() => {
      updateScroll();
    }).observe(messageList.value, {
      childList: true,
    });

    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        getMessages();
      }
    }).observe(messageListBefore.value);

    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        updateReadAt();
      }
    }).observe(messageListAfter.value);

    messageList.value.scrollTop = messageList.value.scrollHeight;
  }

  if (messageBox.value) {
    messageBox.value.focus();
  }
});

onUnmounted(() => {
  clearTimeout(updateTypingStatusTimeout);
});

watch(
  () => channel.value,
  () => {
    if (!channel.value) {
      return;
    }

    scrollUpdated.value = false;
    channel.value.messages = channel.value.messages.slice(-50);
  }
);

store.sideBarOpen = false;
</script>

<style scoped>
#messageList * {
  overflow-anchor: none;
}

#messageListAfter {
  overflow-anchor: auto;
}
</style>
