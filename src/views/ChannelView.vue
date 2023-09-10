<template>
  <div
    v-if="channel"
    class="flex min-h-0 min-w-0 flex-1 flex-col"
    @paste="processFiles($event.clipboardData)"
    @drop.prevent="processFiles($event.dataTransfer)"
    @dragover.prevent
    @dragstart.prevent
    @dragsend.prevent
  >
    <div
      class="relative z-10 min-h-[3.5rem] w-full bg-ctp-base shadow-md shadow-ctp-crust/50"
      :class="{
        'bg-black': inVoice,
        'h-full': inVoice && voiceOnly,
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
        <ChannelCall v-if="inVoice" :full="voiceOnly" />
      </transition>
    </div>
    <p v-if="!writable && writableType" class="bg-ctp-crust px-4 py-2 text-sm">
      You can't send messages in this channel.
    </p>
    <div v-if="writableType" class="flex min-h-0 flex-1">
      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <div class="relative min-h-0 w-full flex-1">
          <div v-if="typingStatus" class="absolute z-10 w-full p-2">
            <div
              class="flex w-full items-center space-x-4 rounded-md bg-ctp-surface0 px-4 py-2 text-sm shadow-md"
            >
              <PencilIcon class="h-4 w-4" />
              <p>{{ typingStatus }}</p>
            </div>
          </div>
          <div
            id="messageList"
            ref="messageList"
            class="flex h-full min-w-0 flex-1 flex-col overflow-auto overflow-x-hidden"
            @scroll="onScroll"
          >
            <div id="messageListBefore" ref="messageListBefore" class="flex-1 pt-16"></div>
            <div class="space-y-1">
              <MessageItem
                v-for="[k, message] in Object.entries(channel.messages)"
                :key="k"
                :index="+k"
                :message="message"
                :channel="channel"
                :space="space"
                @reply="replyMessage = $event"
              />
            </div>
            <div id="messageListAfter" ref="messageListAfter" class="pb-4"></div>
          </div>
        </div>
        <div class="m-4 mt-0 rounded-md bg-ctp-mantle shadow-lg">
          <div
            v-if="replyMessage"
            class="flex min-w-0 items-center justify-between space-x-2 border-b border-ctp-base px-4 py-2 text-sm"
          >
            <div class="flex min-w-0 items-center space-x-2">
              <p class="text-ctp-subtext0">Replying to</p>
              <div class="flex items-center space-x-1">
                <UserAvatar class="h-5 w-5" :avatar="replyMessage.author.avatar" />
                <p class="text-ctp-white">{{ replyMessage.author.name }}</p>
              </div>
              <div
                class="flex flex-1 space-x-2 truncate text-ctp-subtext0"
                v-html="replyMessage.dataFormatted"
              ></div>
            </div>
            <XMarkIcon
              class="h-5 w-5 flex-shrink-0 cursor-pointer text-ctp-subtext0 transition hover:text-ctp-text"
              @click="replyMessage = null"
            />
          </div>
          <div v-if="writable" class="flex items-center space-x-4 px-4 py-2">
            <textarea
              ref="messageBox"
              v-model="messageBoxText"
              rows="1"
              :placeholder="`Message ${name}`"
              class="focus:border-transparent:text-gray-500 max-h-32 flex-1 resize-none border-transparent bg-transparent text-sm outline-none placeholder:text-ctp-overlay0"
              @input="messageBoxInput"
              @keydown="messageBoxKeydown"
            />
            <div class="flex space-x-2 text-ctp-subtext0">
              <div @click="attachFile">
                <PaperClipIcon
                  class="h-8 w-8 cursor-pointer rounded-full bg-ctp-surface0 p-2 transition hover:text-ctp-text"
                />
              </div>
              <div @click="messageBoxSubmit">
                <PaperAirplaneIcon
                  class="h-8 w-8 cursor-pointer rounded-full bg-ctp-surface0 p-2 transition hover:text-ctp-text"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChannelMemberList
        v-if="store.config.showChannelMembers && channel.type !== ChannelType.DM && writableType"
        :channel="channel"
        :space="space"
      />
    </div>
    <div
      v-if="voiceOnly && !inVoice"
      class="flex flex-1 flex-col items-center justify-center space-y-4"
    >
      <SpeakerWaveIcon class="h-12 w-12 rounded-full bg-ctp-surface0 p-3" />
      <p class="text-2xl">{{ channel.name }}</p>
      <button class="w-16 rounded-md bg-ctp-accent p-2 text-sm text-ctp-base" @click="callStart">
        Join
      </button>
    </div>
    <MessageEditModal
      v-if="messageBeingEdited"
      :channel="channel"
      :message="messageBeingEdited"
      @close="messageBeingEdited = null"
    />
  </div>
</template>

<script lang="ts" setup>
import MessageItem from "@/components/MessageItem.vue";
import { ref, computed, onMounted, onUnmounted, type Ref, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { checkSpacePermissions, getChannelState, processMessage } from "@/global/helpers";
import {
  CallStreamType,
  ChannelType,
  MessageType,
  SocketMessageType,
  SpacePermission,
} from "@/../../hyalus-server/src/types";
import sodium from "libsodium-wrappers";
import ChannelCall from "@/components/ChannelCall.vue";
import { MaxFileSize, MaxFileChunkSize } from "@/global/config";
import axios from "axios";
import { useStore } from "@/global/store";
import ChannelHeader from "@/components/ChannelHeader.vue";
import msgpack from "msgpack-lite";
import ChannelMemberList from "@/components/ChannelMemberList.vue";
import type { IMessage } from "@/global/types";
import { PaperAirplaneIcon, PaperClipIcon, PencilIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import UserAvatar from "@/components/UserAvatar.vue";
import MessageEditModal from "@/components/MessageEditModal.vue";
import { SpeakerWaveIcon } from "@heroicons/vue/24/outline";
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";

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
const replyMessage: Ref<IMessage | null> = ref(null);
const messageBeingEdited: Ref<IMessage | null> = ref(null);

const channel = computed(() => {
  return store.channels.find((channel) => channel.id === route.params.channelId);
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

const writableType = computed(() => {
  if (!channel.value) {
    return false;
  }

  if (
    ![
      // writable channel types:
      ChannelType.DM,
      ChannelType.Group,
      ChannelType.SpaceText,
    ].includes(channel.value.type)
  ) {
    return false;
  }

  return true;
});

const writable = computed(() => {
  if (!channel.value) {
    return false;
  }

  if (!writableType.value) {
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
    a.createdAt > b.createdAt ? 1 : -1,
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
      parent?: {
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
      };
    }[];
  } = await axios.get(
    `/api/v1/channels/${channelVal.id}/messages${
      channelVal.messages.length ? `?before=${+sortedMessages[0].createdAt}` : ""
    }`,
  );

  messages.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  const processedMessages = [];

  for (const message of messages) {
    const processedMessage = await processMessage({
      ...message,
      channel: channelVal,
      parent: message.parent && {
        ...message.parent,
        channel: channelVal,
      },
    });

    if (!processedMessage || channelVal.messages.find(({ id }) => id === processedMessage.id)) {
      continue;
    }

    processedMessages.push(processedMessage);
  }

  const beforeScrollHeight = messageList.value?.scrollHeight;
  channelVal.messages = processedMessages.concat(channelVal.messages);
  await nextTick();

  if (messageList.value && beforeScrollHeight) {
    messageList.value.scrollTop += messageList.value.scrollHeight - beforeScrollHeight;
  }
};

const packMessage = (input: string | Uint8Array) => {
  if (!channel.value || !store.self || !store.config.publicKey || !store.config.privateKey) {
    return "";
  }

  let data = typeof input === "string" ? sodium.from_string(input) : input;

  if (channel.value.members.length) {
    const keys: Record<string, Uint8Array> = {};
    const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

    for (const member of channel.value.members) {
      const userKeyNonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

      keys[member.id] = new Uint8Array([
        ...userKeyNonce,
        ...sodium.crypto_box_easy(key, userKeyNonce, member.publicKey, store.config.privateKey),
      ]);
    }

    const selfKeyNonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

    keys[store.self.id] = new Uint8Array([
      ...selfKeyNonce,
      ...sodium.crypto_box_easy(key, selfKeyNonce, store.config.publicKey, store.config.privateKey),
    ]);

    data = msgpack.encode({
      data: new Uint8Array([...nonce, ...sodium.crypto_secretbox_easy(input, nonce, key)]),
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
    ...(replyMessage.value
      ? {
          parentId: replyMessage.value.id,
        }
      : {}),
  });

  if (replyMessage.value) {
    replyMessage.value = null;
  }
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

  if (e.code === "ArrowUp" && !messageBoxText.value) {
    const message = Array.from(channel.value!.messages)
      .reverse()
      .find(
        (message) =>
          message.author.id === store.self!.id &&
          [
            //editable Message types:
            MessageType.PrivateText,
            MessageType.SpaceText,
          ].includes(message.type),
      );
    if (message) {
      messageBeingEdited.value = message;
    }
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

  const key = sodium.crypto_secretstream_xchacha20poly1305_keygen();
  const { state, header } = sodium.crypto_secretstream_xchacha20poly1305_init_push(key);
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
          file.slice(i * MaxFileChunkSize, i * MaxFileChunkSize + MaxFileChunkSize),
        );
      }),
      "",
      sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE,
    );

    await writer.write(chunk);
  }

  await writer.close();
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
  await store.writeConfig(
    "recentChannelIds",
    [
      channel.value.id,
      ...store.config.recentChannelIds.filter((id) => id !== channel.value!.id),
    ].slice(0, 10),
  );
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
          +state.time > +new Date() - 1000 * 3,
      ),
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
  },
);

watch(
  () => [channel.value, store.typingStates],
  () => {
    updateTypingStatus();
  },
);

watch(
  () => !!channel.value,
  async () => {
    if (!channel.value) {
      await router.push("/app");
      return;
    }
  },
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

const keydownHandler = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    replyMessage.value = null;
    return;
  }

  if (messageBox.value && !e.ctrlKey) {
    // messageBox.value.focus();
    // TOOD: make this work without breaking so much shit.
  }
};
addEventListener("keydown", keydownHandler);

onUnmounted(() => {
  clearTimeout(updateTypingStatusTimeout);
  removeEventListener("keydown", keydownHandler);
});

watch(
  () => channel.value,
  () => {
    if (!channel.value) {
      return;
    }

    scrollUpdated.value = false;
    channel.value.messages = channel.value.messages.slice(-50);
  },
);

watch(
  () => replyMessage.value,
  () => {
    if (replyMessage.value && messageBox.value) {
      messageBox.value.focus();
    }
  },
);

const voiceOnly = computed(() => {
  if (!channel.value) {
    return false;
  }
  return [
    // voice only channels:
    ChannelType.SpaceVoice,
  ].includes(channel.value.type);
});

const callStart = async (e: MouseEvent) => {
  if (store.call) {
    await store.callReset();
  }

  await store.callStart(channel.value!.id);

  if (!e.shiftKey) {
    await store.callAddLocalStream({
      type: CallStreamType.Audio,
      silent: true,
    });
  }
};

store.sideBarOpen = false;

const onScroll = () => {
  if (
    messageList.value!.scrollTop ===
    messageList.value!.scrollHeight - messageList.value!.offsetHeight
  ) {
    scrollUpdated.value = false; // yes this code sucks i'm tired fuck off
  } else {
    scrollUpdated.value = true;
  }
};

addEventListener("focusin", () => {
  if (!scrollUpdated.value) {
    updateReadAt();
  }
});

watch(
  () => channel.value?.activeAt,
  () => {
    if (!scrollUpdated.value) {
      updateReadAt();
    }
  },
);
</script>

<style scoped>
#messageList * {
  overflow-anchor: none;
}

#messageListAfter {
  overflow-anchor: auto;
}
</style>
