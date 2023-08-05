<template>
  <div
    ref="root"
    class="select-text"
    :class="{
      'pt-3': firstInChunk && !showDate && !embedded,
    }"
  >
    <!-- <p
      v-if="showDate && !embedded"
      class="mt-4 mb-2 border-t border-ctp-surface0/50 py-4 text-center text-xs text-ctp-subtext0"
    >
      {{ date }}
    </p> -->
    <div v-if="showDate && !embedded" class="relative py-6 px-2.5">
      <div class="border-t border-ctp-surface0"></div>
      <div class="text-xs text-ctp-subtext0 absolute top-4 w-full flex justify-center">
        <p class="bg-ctp-base px-2">{{ date }}</p>
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
          v-if="lastInChunk || embedded"
          :avatar="message.author.avatar"
          class="h-8 w-8 flex-shrink-0 cursor-pointer rounded-full"
          @click="userModal = true"
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
            @click="userModal = true"
          >
            {{ message.author.name }}
          </p>
          <div class="relative text-ctp-overlay2 transition-all">
            <div
              class="ttarrow absolute bottom-[calc(100%+0.5rem)] left-[50%] -ml-[5rem] w-[10rem] transform rounded-md p-2 text-center shadow-md transition bg-ctp-surface0 text-ctp-text"
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
            class="relative flex min-w-0 flex-1 flex-col break-words rounded-md text-sm shadow-md"
            :class="{
              'bg-ctp-accent text-ctp-base': sentByMe && !previewUrl,
              'bg-ctp-surface0': !sentByMe || previewUrl,
            }"
          >
            <!-- eslint-disable vue/no-v-html -->
            <div v-if="message.dataFormatted" class="whitespace-pre-wrap p-2">
              <div v-html="message.dataFormatted"></div>
              <div
                v-if="invite"
                class="bg-ctp-base mt-2 flex w-80 items-center justify-between rounded-md p-3 text-ctp-text"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="dark:bg-dark-200 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-300"
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
                  class="bg-ctp-accent rounded-md p-1.5 text-ctp-base hover:bg-ctp-accent/75 transition text-xs"
                  @click="useInvite"
                >
                  Join
                </button>
              </div>
            </div>
            <!-- eslint-enable -->
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
                <!-- TODO: custom video player UI bc the stock chromium one kinda sucks -->
                <video
                  v-if="upload.type.split('/')[0] === 'video'"
                  ref="previewEl"
                  :src="previewUrl"
                  class="max-h-80 max-w-md rounded-md"
                  controls
                  @error="delPreview"
                />
                <div
                  v-if="upload.type.split('/')[0] === 'audio'"
                  class="overflow-hidden rounded-md bg-[#f1f3f4] grayscale filter dark:contrast-[85.5%] dark:invert"
                >
                  <audio
                    ref="previewEl"
                    :src="previewUrl"
                    controls
                    class="-m-1 w-96"
                    @error="delPreview"
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="!embedded"
            class="flex flex-shrink-0 items-center space-x-2 text-ctp-overlay0 transition"
            :class="{
              'px-2 opacity-0 group-hover:opacity-100': !embedded,
            }"
          >
            <div
              v-if="editable"
              class="h-4 w-4 cursor-pointer transition hover:text-ctp-text"
              @click="editModal = true"
            >
              <PencilIcon />
            </div>
            <div
              v-if="removable"
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
          </div>
        </div>
      </div>
    </div>
  </div>
  <ImageView v-if="!!previewUrl && imageView" :src="previewUrl || ''" @close="imageView = false" />
  <MessageDeleteModal
    v-if="deleteModal"
    :message="message"
    :channel="channel"
    @close="deleteModal = false"
  >
    <MessageItem :channel="channel" :message="message" embedded />
  </MessageDeleteModal>
  <MessageEditModal
    v-if="editModal"
    :message="message"
    :channel="channel"
    @close="editModal = false"
  />
  <UserModal v-if="userModal" :id="message.author.id" @close="userModal = false" />
</template>

<script lang="ts" setup>
import UserAvatar from "./UserAvatar.vue";
import ImageView from "./ImageView.vue";
import MessageDeleteModal from "./MessageDeleteModal.vue";
import MessageEditModal from "./MessageEditModal.vue";
import TrashIcon from "../icons/TrashIcon.vue";
import FriendsIcon from "../icons/FriendsIcon.vue";
import GroupIcon from "../icons/GroupIcon.vue";
import UserAddIcon from "../icons/UserAddIcon.vue";
import UserRemoveIcon from "../icons/UserRemoveIcon.vue";
import LogoutIcon from "../icons/LogoutIcon.vue";
import DownloadIcon from "../icons/DownloadIcon.vue";
import LoadingIcon from "../icons/LoadingIcon.vue";
import PencilIcon from "../icons/PencilIcon.vue";
import PhotographIcon from "../icons/PhotographIcon.vue";
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
} from "vue";
import type { IChannel, IMessage, ISocketMessage, ISpace } from "../global/types";
import { idbGet, idbSet } from "../global/idb";
import { iceServers, MaxFileSize, MaxFileChunkSize } from "../global/config";
import {
  MessageType,
  SocketMessageType,
  FileChunkRTCType,
  SpacePermission,
} from "@/../../hyalus-server/src/types";
import {
  crypto_box_easy,
  crypto_box_NONCEBYTES,
  crypto_box_open_easy,
  crypto_hash,
  crypto_secretstream_xchacha20poly1305_init_pull,
  crypto_secretstream_xchacha20poly1305_pull,
  from_base64,
  randombytes_buf,
  to_base64,
  to_string,
} from "libsodium-wrappers";
import axios from "axios";
import { useStore } from "../global/store";
import Promise from "bluebird";
import UserModal from "./UserModal.vue";
import { checkSpacePermissions } from "../global/helpers";

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
const chunkThreshold = 1000 * 60 * 5;
const userModal = ref(false);
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
    +props.message.createdAt - +precedingMessage.value.createdAt > chunkThreshold
  );
});

const lastInChunk = computed(
  () =>
    !supersedingMessage.value ||
    isEvent(supersedingMessage.value) ||
    props.message.author.id !== supersedingMessage.value.author.id ||
    +supersedingMessage.value.createdAt - +props.message.createdAt > chunkThreshold,
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

const fileDownloadOld = async (save: boolean) => {
  if (!upload.value || fileDownloadActive.value) {
    return;
  }

  if (upload.value.size > MaxFileSize) {
    console.warn(`file too large: ${props.message.id}`);
    return;
  }

  fileDownloadActive.value = true;

  await Promise.map(
    upload.value.chunks,
    async (hash) => {
      if (await idbGet<Uint8Array>(`file:${hash}`)) {
        return;
      }

      const pc = new RTCPeerConnection({ iceServers });
      const packets: Uint8Array[] = [];
      const tag = to_base64(randombytes_buf(16));
      let publicKey: Uint8Array | null = null;
      let dataOffset = 0;

      const send = (val: unknown) => {
        if (!publicKey) {
          return;
        }

        const jsonRaw = JSON.stringify(val);
        const json = JSON.parse(jsonRaw);
        console.debug("f_rtc/tx: %o", {
          ...json,
          t: FileChunkRTCType[json.t],
        }); // yes, there's a reason for this.
        const nonce = randombytes_buf(crypto_box_NONCEBYTES);

        store.socket?.send({
          t: SocketMessageType.CFileChunkRTC,
          d: {
            hash,
            tag,
            data: to_base64(
              new Uint8Array([
                ...nonce,
                ...crypto_box_easy(
                  jsonRaw,
                  nonce,
                  publicKey,
                  store.config.privateKey as unknown as Uint8Array,
                ),
              ]),
            ),
          },
        });
      };

      await new Promise((resolve) => {
        pc.addEventListener("icecandidate", ({ candidate }) => {
          if (!candidate) {
            return;
          }

          send({
            t: FileChunkRTCType.ICECandidate,
            d: JSON.stringify(candidate),
          });
        });

        pc.addEventListener("datachannel", ({ channel: dc }) => {
          dc.addEventListener("open", () => {
            console.debug("f_rtc/dc: open");
          });

          dc.addEventListener("close", () => {
            console.debug("f_rtc/dc: close");
          });

          dc.addEventListener("message", async ({ data }) => {
            const chunkLength =
              packets.length && packets.map((p) => p.length).reduce((a, b) => a + b);

            if (
              chunkLength > MaxFileChunkSize + 4096 ||
              chunkLength + dataOffset > MaxFileSize + 4096 // should include crypto_secretstream_MACBYTES's
            ) {
              console.warn(`file chunk too large: ${hash}`);
              fileDownloadActive.value = false;
              pc.close();
              return;
            }

            if (data) {
              packets.push(new Uint8Array(data));
              return;
            }

            const chunk: Uint8Array = new Uint8Array(chunkLength);

            for (let i = 0, j = 0; i < packets.length; i++) {
              chunk.set(packets[i], j);
              j += packets[i].length;
            }

            if (hash !== to_base64(crypto_hash(chunk))) {
              return console.warn(`invalid data for file chunk: ${hash}`);
            }

            await idbSet(`file:${hash}`, chunk);

            pc.close();
            resolve(undefined);
          });
        });

        pc.addEventListener("connectionstatechange", () => {
          console.debug(`f_rtc/peer: ${pc.connectionState}`);
        });

        store.socket?.registerHook({
          ttl: 1000 * 10,
          ttlTimeout: null,
          type: SocketMessageType.SFileChunkRTC,
          async hook(msg: ISocketMessage) {
            const data = msg.d as {
              hash: string;
              tag: string;
              data: string;
              userId: string;
              channelId: string;
            };

            if (data.hash !== hash || data.tag !== tag) {
              return;
            }

            if (data.userId === store.self?.id) {
              publicKey = store.config.publicKey;
            } else {
              publicKey =
                props.channel.members.find((member) => member.id === data.userId)?.publicKey ||
                null;
            }

            if (!publicKey) {
              console.warn(`fileChunkRtc for invalid user: ${data.userId}`);
              return;
            }

            const dataBytes = from_base64(data.data);
            const dataDecrypted: {
              t: FileChunkRTCType;
              d: string;
            } = JSON.parse(
              to_string(
                crypto_box_open_easy(
                  new Uint8Array(dataBytes.buffer, crypto_box_NONCEBYTES),
                  new Uint8Array(dataBytes.buffer, 0, crypto_box_NONCEBYTES),
                  publicKey,
                  store.config.privateKey as unknown as Uint8Array,
                ),
              ),
            );

            console.debug("f_rtc/rx: %o", dataDecrypted);

            if (dataDecrypted.t === FileChunkRTCType.SDP) {
              await pc.setRemoteDescription(
                new RTCSessionDescription({
                  type: "offer",
                  sdp: dataDecrypted.d,
                }),
              );
              await pc.setLocalDescription(await pc.createAnswer());

              send({
                t: FileChunkRTCType.SDP,
                d: pc.localDescription?.sdp,
              });
            }

            if (dataDecrypted.t === FileChunkRTCType.ICECandidate) {
              await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(dataDecrypted.d)));
            }
          },
        });

        store.socket?.send({
          t: SocketMessageType.CFileChunkRequest,
          d: {
            hash,
            tag,
            channelId: props.channel.id,
          },
        });
      });
    },
    {
      concurrency: 3,
    },
  );

  // return;

  const state = crypto_secretstream_xchacha20poly1305_init_pull(
    upload.value.header,
    upload.value.key,
  );

  const data = new Uint8Array(upload.value.size);
  let dataOffset = 0;

  for (const hash of upload.value.chunks) {
    let chunk = (await idbGet(`file:${hash}`)) as Uint8Array | undefined;

    if (!chunk) {
      const pc = new RTCPeerConnection({ iceServers });
      const packets: Uint8Array[] = [];
      const tag = to_base64(randombytes_buf(16));
      let publicKey: Uint8Array | null = null;

      const send = (val: unknown) => {
        if (!publicKey) {
          return;
        }

        const jsonRaw = JSON.stringify(val);
        const json = JSON.parse(jsonRaw);
        console.debug("f_rtc/tx: %o", {
          ...json,
          t: FileChunkRTCType[json.t],
        }); // yes, there's a reason for this.
        const nonce = randombytes_buf(crypto_box_NONCEBYTES);

        store.socket?.send({
          t: SocketMessageType.CFileChunkRTC,
          d: {
            hash,
            tag,
            data: to_base64(
              new Uint8Array([
                ...nonce,
                ...crypto_box_easy(
                  jsonRaw,
                  nonce,
                  publicKey,
                  store.config.privateKey as unknown as Uint8Array,
                ),
              ]),
            ),
          },
        });
      };

      await new Promise((resolve) => {
        pc.addEventListener("icecandidate", ({ candidate }) => {
          if (!candidate) {
            return;
          }

          send({
            t: FileChunkRTCType.ICECandidate,
            d: JSON.stringify(candidate),
          });
        });

        pc.addEventListener("datachannel", ({ channel: dc }) => {
          dc.addEventListener("open", () => {
            console.debug("f_rtc/dc: open");
          });

          dc.addEventListener("close", () => {
            console.debug("f_rtc/dc: close");
          });

          dc.addEventListener("message", async ({ data }) => {
            const chunkLength =
              packets.length && packets.map((p) => p.length).reduce((a, b) => a + b);

            if (
              chunkLength > MaxFileChunkSize + 4096 ||
              chunkLength + dataOffset > MaxFileSize + 4096 // should include crypto_secretstream_MACBYTES's
            ) {
              console.warn(`file chunk too large: ${hash}`);
              fileDownloadActive.value = false;
              pc.close();
              return;
            }

            if (data) {
              packets.push(new Uint8Array(data));
              return;
            }

            chunk = new Uint8Array(chunkLength);

            for (let i = 0, j = 0; i < packets.length; i++) {
              chunk.set(packets[i], j);
              j += packets[i].length;
            }

            if (hash !== to_base64(crypto_hash(chunk))) {
              console.warn(`invalid data for file chunk: ${hash}`);
              chunk = undefined;
            }

            if (chunk) {
              await idbSet(`file:${hash}`, chunk);
            }

            pc.close();
            resolve(undefined);
          });
        });

        pc.addEventListener("connectionstatechange", () => {
          console.debug(`f_rtc/peer: ${pc.connectionState}`);
        });

        store.socket?.registerHook({
          ttl: 1000 * 10,
          ttlTimeout: null,
          type: SocketMessageType.SFileChunkRTC,
          async hook(msg: ISocketMessage) {
            const data = msg.d as {
              hash: string;
              tag: string;
              data: string;
              userId: string;
              channelId: string;
            };

            if (data.hash !== hash || data.tag !== tag) {
              return;
            }

            if (data.userId === store.self?.id) {
              publicKey = store.config.publicKey;
            } else {
              publicKey =
                props.channel.members.find((member) => member.id === data.userId)?.publicKey ||
                null;
            }

            if (!publicKey) {
              console.warn(`fileChunkRtc for invalid user: ${data.userId}`);
              return;
            }

            const dataBytes = from_base64(data.data);
            const dataDecrypted: {
              t: FileChunkRTCType;
              d: string;
            } = JSON.parse(
              to_string(
                crypto_box_open_easy(
                  new Uint8Array(dataBytes.buffer, crypto_box_NONCEBYTES),
                  new Uint8Array(dataBytes.buffer, 0, crypto_box_NONCEBYTES),
                  publicKey,
                  store.config.privateKey as unknown as Uint8Array,
                ),
              ),
            );

            console.debug("f_rtc/rx: %o", dataDecrypted);

            if (dataDecrypted.t === FileChunkRTCType.SDP) {
              await pc.setRemoteDescription(
                new RTCSessionDescription({
                  type: "offer",
                  sdp: dataDecrypted.d,
                }),
              );
              await pc.setLocalDescription(await pc.createAnswer());

              send({
                t: FileChunkRTCType.SDP,
                d: pc.localDescription?.sdp,
              });
            }

            if (dataDecrypted.t === FileChunkRTCType.ICECandidate) {
              await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(dataDecrypted.d)));
            }
          },
        });

        store.socket?.send({
          t: SocketMessageType.CFileChunkRequest,
          d: {
            hash,
            tag,
            channelId: props.channel.id,
          },
        });
      });
    }

    if (!chunk) {
      console.warn(`error getting chunk: ${hash}`);
      fileDownloadActive.value = false;
      return;
    }

    const pull = crypto_secretstream_xchacha20poly1305_pull(state, chunk);

    if (!pull) {
      console.warn(`error decrypting chunk: ${hash}`);
      fileDownloadActive.value = false;
      return;
    }

    if (pull.message.length > data.length - dataOffset) {
      console.warn(`error writing chunk: ${hash}`);
      fileDownloadActive.value = false;
      return;
    }

    data.set(pull.message, dataOffset);
    dataOffset += pull.message.length;
  }

  const url = URL.createObjectURL(new Blob([data]));

  if (save) {
    const el = document.createElement("a");
    el.download = upload.value.name;
    el.href = url;
    el.click();
    URL.revokeObjectURL(el.href); // frees up mem on next GC cycle.
  }

  fileDownloadActive.value = false;
  return url;
};

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
  if (props.message.type === MessageType.PrivateUploadOld) {
    await fileDownloadOld(save);
    return;
  }

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

const remove = async (e: MouseEvent) => {
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
  } as {
    name: string;
    type: string;
    header: Uint8Array;
    key: Uint8Array;
    size: number;
    sizeFormatted: string;
    chunks: string[];
  };
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
      upload.value.size < 1024 * 1024 * 10 &&
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

const removable = computed(() => {
  return (
    sentByMe.value ||
    (props.channel.spaceId &&
      checkSpacePermissions({
        permissions: SpacePermission.ManageMessages,
        spaceId: props.channel.spaceId,
        channelId: props.channel.id,
      }))
  );
});

const editable = computed(() => {
  return (
    sentByMe.value &&
    [
      // editable message types:
      MessageType.PrivateText,
      MessageType.SpaceText,
    ].includes(props.message.type)
  );
});

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
</script>

<style>
pre {
  @apply border-ctp-accent bg-ctp-crust -m-1.5 whitespace-pre-wrap rounded-md p-2 text-ctp-text;
}

pre + * {
  @apply -mt-2;
}

.ttarrow::after {
  @apply shadow-md border-transparent border-t-ctp-surface0;
  content: " ";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
}
</style>
