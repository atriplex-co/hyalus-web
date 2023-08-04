<template>
  <div
    v-if="show"
    ref="root"
    class="bg-ctp-crust fixed z-10 w-56 space-y-2 rounded-md p-4 text-sm shadow-md"
    @mouseup.stop
  >
    <template v-if="tile.user.id === store.self?.id">
      <div class="flex items-center justify-between">
        <p>Mute</p>
        <CheckBox v-model="selfMute" class="scale-90 transform" />
      </div>
      <div class="flex items-center justify-between">
        <p>Deafen</p>
        <CheckBox v-model="selfDeaf" class="scale-90 transform" />
      </div>
      <div class="space-y-2">
        <p>Input Volume</p>
        <InputRange v-model="store.config.audioInputGain" min="0" max="200" />
      </div>
    </template>
    <template v-else>
      <div class="flex items-center justify-between">
        <p>Mute</p>
        <CheckBox v-model="userMuted" class="scale-90 transform" />
      </div>
      <div class="space-y-2">
        <p>User Volume</p>
        <InputRange v-model="userGain" min="0" max="200" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref, type Ref, nextTick, type PropType, computed, onMounted } from "vue";
import type { ICallTile } from "../global/types";
import InputRange from "./InputRange.vue";
import { useStore } from "../global/store";
import CheckBox from "./CheckBox.vue";
import { CallStreamType } from "@/../../hyalus-server/src/types";
import { configToComputed } from "../global/helpers";

const store = useStore();

const root: Ref<HTMLDivElement | null> = ref(null);

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  tile: {
    type: Object as PropType<ICallTile>,
    default() {
      //
    },
  },
});

const emit = defineEmits(["close"]);

const selfMute = computed({
  get() {
    return !store.call?.localStreams.find((stream) => stream.type === CallStreamType.Audio);
  },
  async set(val: boolean) {
    if (!val) {
      await store.callAddLocalStream({
        type: CallStreamType.Audio,
      });
    } else {
      await store.callRemoveLocalStream({
        type: CallStreamType.Audio,
      });
    }
  },
});

const selfDeaf = computed({
  get() {
    return !!store.call?.deaf;
  },
  async set(val: boolean) {
    await store.callSetDeaf(val);
  },
});

let targetAudioStream = CallStreamType.Audio;
if (props.tile.remoteStream?.type === CallStreamType.DisplayVideo) {
  targetAudioStream = CallStreamType.DisplayAudio;
}

// eslint-disable-next-line vue/no-setup-props-destructure
const userMuted = configToComputed<boolean>(`userMuted:${props.tile.user.id}:${targetAudioStream}`);
// eslint-disable-next-line vue/no-setup-props-destructure
const userGain = configToComputed<number>(`userGain:${props.tile.user.id}:${targetAudioStream}`);

onMounted(async () => {
  if (props.tile.user.id !== store.self?.id) {
    if (store.config[`userGain:${props.tile.user.id}:${targetAudioStream}`] === undefined) {
      await store.writeConfig(`userGain:${props.tile.user.id}:${targetAudioStream}`, 100);
    }

    if (store.config[`userMuted:${props.tile.user.id}:${targetAudioStream}`] === undefined) {
      await store.writeConfig(`userMuted:${props.tile.user.id}:${targetAudioStream}`, false);
    }
  }
});

watch(
  () => props.show,
  async () => {
    await nextTick();

    if (!props.show || !root.value) {
      return;
    }

    root.value.style.left = `${props.x}px`;
    root.value.style.top = `${props.y}px`;

    const close = () => {
      emit("close");
      removeEventListener("mouseup", close);
    };

    setTimeout(() => {
      addEventListener("mouseup", close);
    });
  },
);
</script>
