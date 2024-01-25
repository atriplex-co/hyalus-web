<template>
  <div
    ref="root"
    class="select-text"
    :class="{
      'pt-2': firstInChunk && !showDate && !embedded,
    }"
  >
    <div v-if="showDate && !embedded" class="relative px-2.5 py-6">
      <div class="border-t border-ctp-surface0"></div>
      <div class="absolute top-4 flex w-full justify-center text-xs text-ctp-subtext0">
        <p class="bg-ctp-base px-2">{{ date }}</p>
      </div>
    </div>
    <div
      :class="{
        'py-1 hover:bg-ctp-mantle': !embedded,
      }"
      @contextmenu="messageMenu!.open($event)"
    >
      <div v-if="message.parent" class="flex items-center space-x-1.5 px-5 pb-2 text-xs">
        <div class="relative w-6 flex-shrink-0">
          <div
            class="absolute left-2 h-10 w-4 rounded-tl-lg border-l-2 border-t-2 border-ctp-surface0"
          ></div>
        </div>
        <div class="flex min-w-0 items-center space-x-1.5 rounded-md bg-ctp-surface0 p-1.5">
          <div
            class="flex cursor-pointer items-center space-x-1.5 transition"
            @click="
              userModalId = message.parent.author.id;
              userModal = true;
            "
          >
            <UserAvatar class="h-4 w-4" :avatar="message.parent.author.avatar" />
            <p class="text-ctp-white">{{ message.parent.author.name }}</p>
          </div>
          <div
            v-if="message.parent.dataFormatted"
            class="pointer-events-none flex min-w-0 flex-1 select-none space-x-2 truncate text-ctp-subtext0"
          >
            <MessageRenderer
              :html="message.parent.dataFormatted"
              :key="message.parent.dataFormatted"
            />
          </div>
        </div>
      </div>
      <div
        v-if="isEvent(message)"
        class="group mx-4 flex items-center justify-between rounded-[4px] border-l-4 bg-ctp-mantle px-3 py-2.5 text-sm shadow-md"
        :class="{
          'border-ctp-surface0': !sentByMe,
          'border-ctp-accent': sentByMe,
        }"
      >
        <div class="flex items-center space-x-3">
          <div class="h-4 w-4 text-ctp-subtext0">
            <FriendsIcon v-if="message.type === MessageType.FriendAccept" />
            <GroupIcon v-if="message.type === MessageType.GroupCreate" />
            <UserAddIcon v-if="message.type === MessageType.GroupAdd" />
            <UserRemoveIcon v-if="message.type === MessageType.GroupRemove" />
            <LogoutIcon v-if="message.type === MessageType.GroupLeave" />
            <PencilIcon v-if="message.type === MessageType.GroupName" />
            <PhotographIcon v-if="message.type === MessageType.GroupAvatar" />
          </div>
          <p class="text-ctp-text">{{ message.dataString }}</p>
        </div>
        <p class="text-ctp-subtext0 opacity-0 transition group-hover:opacity-100">
          {{ time }}
        </p>
      </div>
      <div
        v-if="!isEvent(message)"
        class="group flex items-end space-x-2"
        :class="{
          'mx-4': !embedded,
          'flex-row-reverse space-x-reverse': store.config.adaptiveLayout && sentByMe,
        }"
      >
        <div class="relative h-8 w-8">
          <UserAvatar
            v-if="lastInChunk || embedded || message.parent"
            :avatar="message.author.avatar"
            class="h-8 w-8 flex-shrink-0 cursor-pointer rounded-full"
            @click="
              userModalId = message.author.id;
              userModal = true;
            "
            @contextmenu="!embedded && userMenu!.open($event)"
          />
        </div>
        <div
          class="flex min-w-0 max-w-full flex-1 flex-col items-start space-y-1"
          :class="{
            'items-end': store.config.adaptiveLayout && sentByMe,
          }"
        >
          <div v-if="firstInChunk" class="flex items-center space-x-1.5 text-xs">
            <p
              class="cursor-pointer transition"
              :class="{
                'text-ctp-text': !userColor,
              }"
              :style="userColor ? `color:${userColor};` : ''"
              @click="
                userModalId = message.author.id;
                userModal = true;
              "
            >
              {{ message.author.name }}
            </p>
            <div class="relative text-ctp-overlay2 transition-all">
              <div
                class="ttarrow absolute bottom-[calc(100%+0.5rem)] left-[50%] -ml-[5rem] w-[10rem] transform rounded-md bg-ctp-surface0 p-2 text-center text-ctp-text shadow-md transition"
                :class="{
                  'invisible opacity-0': !timeExpanded,
                }"
              >
                <p>
                  {{ Day(message.createdAt).format("YYYY/MM/DD h:mm:ss A") }}
                </p>
              </div>
              <p @mouseenter="timeExpanded = true" @mouseleave="timeExpanded = false">
                {{ time }}
              </p>
            </div>
            <PencilIcon
              v-if="+message.createdAt !== +message.updatedAt"
              class="h-3 w-3 text-ctp-subtext0"
            />
          </div>
          <div
            class="flex max-w-full flex-1 items-center space-x-3"
            :class="{
              'flex-row-reverse': store.config.adaptiveLayout && sentByMe,
            }"
          >
            <div
              class="relative flex min-w-0 flex-1 flex-col break-words rounded-md text-sm"
              :class="{
                'bg-ctp-accent text-ctp-base': sentByMe && !previewUrl && !useLargeEmojis,
                'bg-ctp-surface0': (!sentByMe || previewUrl) && !useLargeEmojis,
                'large-emojis': useLargeEmojis,
                'shadow-md': !useLargeEmojis,
              }"
            >
              <div
                v-if="message.dataFormatted"
                class="whitespace-pre-wrap"
                :class="{
                  'p-2': !useLargeEmojis,
                }"
              >
                <MessageRenderer :html="message.dataFormatted" :key="message.dataFormatted" />
                <div
                  v-if="invite"
                  class="mt-2 flex w-80 items-center justify-between rounded-md bg-ctp-base p-3 text-ctp-text"
                >
                  <div class="flex items-center space-x-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-300"
                    >
                      <UserAvatar v-if="invite.space.avatar" :avatar="invite.space.avatar" />
                      <p v-else>{{ invite.space.name.slice(0, 1) }}</p>
                    </div>
                    <div>
                      <p class="text-semibold">
                        {{ invite.space.name }}
                      </p>
                      <p class="text-xs text-ctp-subtext0">
                        {{ invite.space.memberCount }} Member{{
                          invite.space.memberCount > 1 ? "s" : ""
                        }}
                      </p>
                    </div>
                  </div>
                  <button
                    class="rounded-md bg-ctp-accent p-1.5 text-xs text-ctp-base transition hover:bg-ctp-accent/75"
                    @click="useInvite"
                  >
                    Join
                  </button>
                </div>
              </div>

              <div v-if="upload">
                <div v-if="!previewUrl" class="flex items-center space-x-2 p-2">
                  <div
                    v-if="!embedded"
                    class="h-8 w-8 rounded-full p-2 text-ctp-surface0"
                    :class="{
                      'cursor-pointer': !fileDownloadActive,
                      'bg-black/10': sentByMe,
                      'bg-ctp-accent': !sentByMe,
                    }"
                    @click="fileDownload(true)"
                  >
                    <DownloadIcon v-if="!fileDownloadActive" />
                    <LoadingIcon v-if="fileDownloadActive" />
                  </div>
                  <div>
                    <p class="font-bold">{{ upload.name }}</p>
                    <p
                      class="text-xs"
                      :class="{
                        'text-ctp-surface0': sentByMe,
                        'text-ctp-subtext0': !sentByMe,
                      }"
                    >
                      {{ upload.sizeFormatted }}
                    </p>
                  </div>
                </div>
                <div v-if="previewUrl" class="flex items-center justify-center">
                  <img
                    v-if="upload.type.split('/')[0] === 'image'"
                    ref="previewEl"
                    :src="previewUrl"
                    class="max-h-80 max-w-md cursor-pointer rounded-md"
                    @error="delPreview"
                    @click="imageView = true"
                  />
                  <VideoPlayer
                    v-if="upload.type.split('/')[0] === 'video'"
                    :src="previewUrl"
                    :name="upload.name"
                    :size="upload.sizeFormatted"
                    @error="delPreview"
                    @download="fileDownload(true)"
                  />
                  <AudioPlayer
                    v-if="upload.type.split('/')[0] === 'audio'"
                    :src="previewUrl"
                    :name="upload.name"
                    :size="upload.sizeFormatted"
                    @error="delPreview"
                    @download="fileDownload(true)"
                  />
                </div>
              </div>
            </div>
            <div
              v-if="!embedded"
              class="flex-shrink-0 text-ctp-overlay0 opacity-0 transition group-hover:opacity-100"
              @click="messageMenu!.open($event)"
            >
              <EllipsisVerticalIcon class="h-4 w-4 cursor-pointer transition hover:text-ctp-text" />
            </div>
            <!-- <div
              v-if="!embedded"
              class="flex flex-shrink-0 items-center space-x-2 text-ctp-overlay0 transition"
              :class="{
                'px-2 opacity-0 group-hover:opacity-100': !embedded,
              }"
            >
              <div
                v-if="canReply"
                class="h-4 w-4 cursor-pointer transition hover:text-ctp-text"
                @click="reply"
              >
                <ArrowUturnLeftIcon />
              </div>
              <div
                v-if="canEdit"
                class="h-4 w-4 cursor-pointer transition hover:text-ctp-text"
                @click="editModal = true"
              >
                <PencilIcon />
              </div>
              <div
                v-if="canRemove"
                class="h-4 w-4 cursor-pointer transition hover:text-ctp-text"
                @click="remove"
              >
                <TrashIcon />
              </div>
              <a
                v-if="previewUrl"
                class="h-4 w-4 cursor-pointer transition hover:text-ctp-text"
                :href="previewUrl"
                :download="upload?.name"
              >
                <DownloadIcon />
              </a>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
  <ImageViewer
    v-if="upload && previewUrl && imageView"
    :src="previewUrl"
    :name="upload.name"
    :size="upload.sizeFormatted"
    @close="imageView = false"
  />
  <UserModal v-if="userModal" :id="userModalId" @close="userModal = false" />
  <!-- <UserContextMenu ref="userMenu" :user="message.author" /> -->
  <MessageContextMenu
    ref="messageMenu"
    @reply="$emit('reply')"
    @edit="editModal = true"
    @delete="onDelete"
    @download="() => fileDownload(true)"
    :message="message"
    :channel="channel"
    :upload="upload"
  />
  <MessageEditModal
    v-if="editModal"
    @close="editModal = false"
    :message="message"
    :channel="channel"
  />
  <MessageDeleteModal
    v-if="deleteModal"
    @close="deleteModal = false"
    :message="message"
    :channel="channel"
  >
    <MessageItem :channel="channel" :message="message" embedded />
  </MessageDeleteModal>
</template>

<script lang="ts" setup>
import UserAvatar from "./UserAvatar.vue";
import ImageViewer from "./ImageViewer.vue";
import MessageDeleteModal from "./MessageDeleteModal.vue";
import MessageEditModal from "./MessageEditModal.vue";
import FriendsIcon from "@/icons/FriendsIcon.vue";
import GroupIcon from "@/icons/GroupIcon.vue";
import UserAddIcon from "@/icons/UserAddIcon.vue";
import UserRemoveIcon from "@/icons/UserRemoveIcon.vue";
import LogoutIcon from "@/icons/LogoutIcon.vue";
import DownloadIcon from "@/icons/DownloadIcon.vue";
import LoadingIcon from "@/icons/LoadingIcon.vue";
import PhotographIcon from "@/icons/PhotographIcon.vue";
import Day from "dayjs";
import {
  ref,
  computed,
  onMounted,
  type PropType,
  type Ref,
  onUnmounted,
  onBeforeUnmount,
  watch,
  h,
} from "vue";
import type { IChannel, IMessage, ISpace, IMessageUpload } from "@/global/types";
import { MaxFileSize, MaxFileChunkSize } from "@/global/config";
import { MessageType } from "@/../../hyalus-server/src/types";
import {
  crypto_secretstream_xchacha20poly1305_init_pull,
  crypto_secretstream_xchacha20poly1305_pull,
  from_base64,
} from "libsodium-wrappers";
import axios from "axios";
import { useStore } from "@/global/store";
import UserModal from "./UserModal.vue";
import { PencilIcon, EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import UserContextMenu from "./UserContextMenu.vue";
import MessageContextMenu from "./MessageContextMenu.vue";
import VideoPlayer from "./VideoPlayer.vue";
import AudioPlayer from "./AudioPlayer.vue";
import MessageEmoji from "./MessageEmoji.vue";
import MessageRenderer from "./MessageRenderer.vue";

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
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
  embedded: {
    type: Boolean,
    default: false,
  },
  index: {
    type: Number,
    default: 0,
  },
});
defineEmits(["reply"]);
const chunkThreshold = 1000 * 60 * 5;
const userModal = ref(false);
const userModalId = ref("");
// eslint-disable-next-line vue/no-setup-props-destructure
const date = Day(props.message.createdAt).format("MMMM D, YYYY");
const time = ref("");
const previewUrl = ref("");
const previewEl: Ref<HTMLMediaElement | null> = ref(null);
const imageView = ref(false);
const deleteModal = ref(false);
const editModal = ref(false);
const root: Ref<HTMLDivElement | null> = ref(null);
const fileDownloadActive = ref(false);
const timeExpanded = ref(false);
const invite = ref<{
  code: string;
  space: {
    id: string;
    name: string;
    avatar: string | null;
    memberCount: number;
  };
} | null>(null);
const userMenu: Ref<typeof UserContextMenu | null> = ref(null);
const messageMenu: Ref<typeof MessageContextMenu | null> = ref(null);

const sentByMe = computed(() => {
  if (!store.self) {
    return false; // hmr seems to cause the store to get broken here. (just reload, or fix it.)
  }

  return props.message.author.id === store.self.id;
});

const precedingMessage = computed(() => props.channel.messages[props.index - 1]);

const supersedingMessage = computed(() => props.channel.messages[props.index + 1]);

const firstInChunk = computed(() => {
  if (isEvent(props.message)) {
    return !precedingMessage.value || !isEvent(precedingMessage.value);
  }

  return (
    !precedingMessage.value ||
    isEvent(precedingMessage.value) ||
    props.message.author.id !== precedingMessage.value.author.id ||
    +props.message.createdAt - +precedingMessage.value.createdAt > chunkThreshold ||
    props.message.parent ||
    precedingMessage.value.parent
  );
});

const lastInChunk = computed(
  () =>
    !supersedingMessage.value ||
    isEvent(supersedingMessage.value) ||
    props.message.author.id !== supersedingMessage.value.author.id ||
    +supersedingMessage.value.createdAt - +props.message.createdAt > chunkThreshold ||
    (supersedingMessage.value && supersedingMessage.value.parent),
);

const showDate = computed(
  () =>
    !precedingMessage.value ||
    precedingMessage.value.createdAt.toDateString() !== props.message.createdAt.toDateString(),
);

const isEvent = (message: IMessage) =>
  [
    MessageType.FriendAccept,
    MessageType.GroupCreate,
    MessageType.GroupName,
    MessageType.GroupAvatar,
    MessageType.GroupAdd,
    MessageType.GroupRemove,
    MessageType.GroupLeave,
  ].includes(message.type);

const fileSave = (url: string) => {
  if (!upload.value) {
    return;
  }

  const el = document.createElement("a");
  el.download = upload.value.name;
  el.href = url;
  el.click();
  URL.revokeObjectURL(el.href); // frees up mem on next GC cycle.
};

const fileDownload = async (save: boolean) => {
  if (!upload.value) {
    return;
  }

  if (upload.value.size > MaxFileSize) {
    console.warn(`file too large: ${props.message.id}`);
    return;
  }

  fileDownloadActive.value = true;
  const chunkedSize = upload.value.size + Math.ceil(upload.value.size / MaxFileChunkSize) * 17;
  const state = crypto_secretstream_xchacha20poly1305_init_pull(
    upload.value.header,
    upload.value.key,
  );
  const root = await navigator.storage.getDirectory();
  const _handle = await root.getFileHandle(`tmp_upload_${props.message.id}`, {
    create: true,
  });
  let handle = _handle as typeof _handle & {
    createWritable(): Promise<WritableStream<Uint8Array>>;
  };

  const file = await handle.getFile();
  if (file.size === upload.value.size) {
    const url = URL.createObjectURL(file);
    if (save) {
      fileSave(url);
    }
    return url;
  }
  if (file.size !== upload.value.size && file.size > 0) {
    await root.removeEntry(file.name);
    handle = (await root.getFileHandle(file.name, {
      create: true,
    })) as typeof handle;
  } // will get rid of incomplete/corrupt file.

  const writer = (await handle.createWritable()).getWriter();
  const res = await fetch(`/api/v1/uploads/${props.message.id}`);
  if (!res.body) {
    return;
  }

  const reader = res.body.getReader();
  let buf = new Uint8Array();
  let i = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    const _buf = buf;
    buf = new Uint8Array(buf.length + value.length);
    buf.set(_buf, 0);
    buf.set(value, _buf.length);
    i += value.length;
    if (i > chunkedSize) {
      break;
    }

    if (buf.length >= MaxFileChunkSize + 17 || i === chunkedSize) {
      for (;;) {
        const chunkSize = Math.min(MaxFileChunkSize + 17, buf.length);
        const chunk = new Uint8Array(buf.buffer.slice(0, chunkSize));
        buf = new Uint8Array(buf.buffer.slice(chunkSize));

        const pull = crypto_secretstream_xchacha20poly1305_pull(state, chunk);
        await writer.write(pull.message);

        if (!buf.length || (i !== chunkedSize && buf.length < MaxFileChunkSize + 17)) {
          break;
        }
      }
    }
  }

  await writer.close();
  if (i !== chunkedSize) {
    console.warn(`file size mismatch: ${props.message.id}`);
    fileDownloadActive.value = false;
    return;
  }

  const url = URL.createObjectURL(await handle.getFile());
  if (save) {
    fileSave(url);
  }

  fileDownloadActive.value = false;
  return url;
};

const delPreview = () => {
  URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
};

const onDelete = async (e: MouseEvent) => {
  if (e.shiftKey) {
    await axios.delete(`/api/v1/channels/${props.channel.id}/messages/${props.message.id}`);
  } else {
    deleteModal.value = true;
  }
};

const upload = computed(() => {
  if (
    ![MessageType.PrivateUploadOld, MessageType.PrivateUpload, MessageType.SpaceUpload].includes(
      props.message.type,
    ) ||
    !props.message.dataString
  ) {
    return;
  }

  const json = JSON.parse(props.message.dataString);

  let sizeFormattedUnits = "BKMG";
  let sizeFormattedUnit = 0;
  let sizeFormattedNum = json.size;
  let sizeFormatted = "";
  while (sizeFormattedNum > 1000) {
    sizeFormattedNum /= 1024;
    sizeFormattedUnit++;
  }
  sizeFormatted += Math.floor(sizeFormattedNum);
  sizeFormatted += sizeFormattedUnits[sizeFormattedUnit];

  return {
    ...json,
    name: json.name,
    type: json.type,
    header: from_base64(json.header),
    key: from_base64(json.key),
    size: json.size,
    sizeFormatted,
    chunks: json.chunks, // TODO: remove support for PrivateUploadOld
  } as IMessageUpload;
});

onMounted(async () => {
  if (!root.value) {
    return;
  }

  new IntersectionObserver(async () => {
    if (!root.value) {
      return;
    }

    const rect = root.value.getBoundingClientRect();

    if (!(rect.top > 0 && rect.bottom < innerHeight)) {
      return;
    }

    if (
      upload.value &&
      ["audio", "video", "image"].indexOf(upload.value.type.split("/")[0]) !== -1 &&
      upload.value.size < 1024 * 1024 * 20 &&
      previewUrl.value === ""
    ) {
      previewUrl.value = (await fileDownload(false)) || "";
    }
  }).observe(root.value);
});

const getTime = () => {
  const now = Day();
  const time = Day(props.message.createdAt);

  if (now.format("L") === time.format("L")) {
    return time.format("LT"); // 10:51 PM
  }

  if (now.isoWeek() === time.isoWeek()) {
    return time.format("ddd LT"); // Mon 10:51 PM
  }

  if (now.year() === time.year()) {
    return time.format("MMM D"); // Sep 5
  }

  return time.format("M/D/YY"); // 9/5/22
};

const userColor = computed(() => {
  if (!props.space) {
    return null;
  }

  const member = props.space.members.find((member) => member.id === props.message.author.id);
  if (!member) {
    return null;
  }

  const roles = [];
  for (const roleId of member.roleIds) {
    const role = props.space.roles.find((role) => role.id === roleId);

    if (role) {
      roles.push(role);
    }
  }

  if (!roles.length) {
    return;
  }

  roles.sort((a, b) => (a.position > b.position ? 1 : -1));
  if (roles[0].color) {
    return `#${roles[0].color.toString(16)}`;
  }

  return null;
});

const updateInvite = async () => {
  if (!props.message.dataString) {
    return;
  }

  const match = props.message.dataString.match(
    new RegExp(
      `${location.origin.replace(
        /[/\-\\^$*+?.()|[\]{}]/g,
        "\\$&",
      )}\\/invite\\/([123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{8})`,
    ),
  );

  if (!match) {
    return;
  }

  try {
    const { data } = await axios.post(`/api/v1/spaces/preview-invite`, {
      code: match[1],
    });

    invite.value = data;
  } catch {
    //
  }
};

updateInvite();
watch(() => props.message.dataString, updateInvite);

const updateTime = () => {
  time.value = getTime();
};

updateTime();
const updateTimeInterval = +setInterval(updateTime, 60000);

onUnmounted(() => {
  clearInterval(updateTimeInterval);
});

onBeforeUnmount(() => {
  if (previewEl.value) {
    previewEl.value.src = ""; // prevents memory leak (no idk why this works)
  }
});

const useInvite = async () => {
  if (!invite.value) {
    return;
  }

  await axios.post(`/api/v1/spaces/use-invite`, {
    code: invite.value.code,
  });
};

const useLargeEmojis = computed(() => {
  if (!props.message.dataFormatted) {
    return false;
  }
  const dom = new DOMParser().parseFromString(props.message.dataFormatted, "text/html");
  const tagNames = new Set();
  const p = dom.body.children[0] as HTMLParagraphElement;
  if (!p) {
    return false;
  }
  p.querySelectorAll("*").forEach((el) => tagNames.add(el.tagName));
  return !p.innerText && tagNames.size === 1 && tagNames.has("MESSAGEEMOJI");
});
</script>

<style>
pre {
  @apply -m-1.5 whitespace-pre-wrap rounded-md border-ctp-accent bg-ctp-crust p-2 text-ctp-text;
}

pre + * {
  @apply -mt-2;
}

.ttarrow::after {
  @apply border-transparent border-t-ctp-surface0 shadow-md;
  content: " ";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
}

.large-emojis img.emoji {
  width: 3rem !important;
  height: 3rem !important;
  margin-top: 0.125rem !important;
}
</style>
