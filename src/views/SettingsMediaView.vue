<template>
  <div class="flex-1 overflow-auto">
    <div class="flex h-14 items-center px-4 text-lg font-bold">
      <router-link
        v-if="isMobile"
        class="ml-2 mr-4 h-8 w-8 rounded-full bg-gray-600 p-1.5 text-gray-300 transition hover:bg-gray-500"
        to="/settings"
      >
        <ArrowLeftIcon />
      </router-link>
      <p>Audio &amp; Video</p>
    </div>
    <div
      class="dark:divide-dark-800 dark:border-dark-800 divide-y divide-gray-100 border-t border-b border-gray-100"
    >
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">Audio Output</p>
        <InputList>
          <template #selected>
            <p class="max-w-xs truncate">{{ audioOutput }}</p>
          </template>
          <template #items>
            <InputListItem
              v-for="device in usableAudioOutputs"
              :key="device.deviceId"
              @click="audioOutput = device.deviceId"
            >
              <p class="truncate">{{ device.label }}</p>
            </InputListItem>
          </template>
        </InputList>
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">Audio Output Volume</p>
        <InputRange v-model="audioOutputGain" min="0" max="200" class="w-96" />
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">Audio Input</p>
        <InputList>
          <template #selected>
            <p class="max-w-xs truncate">{{ audioInput }}</p>
          </template>
          <template #items>
            <InputListItem
              v-for="device in usableAudioInputs"
              :key="device.deviceId"
              @click="audioInput = device.deviceId"
            >
              <p class="truncate">{{ device.label }}</p>
            </InputListItem>
          </template>
        </InputList>
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">Audio Input Volume</p>
        <InputRange v-model="audioInputGain" min="0" max="200" class="w-96" />
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">Audio Input Sensitivity</p>
        <InputRange
          v-model="audioInputTrigger"
          min="0"
          max="100"
          class="w-96"
        />
      </div>
      <div class="flex min-h-[4rem] items-center justify-between px-6">
        <p class="font-bold">Audio Test</p>
        <InputBoolean v-model="audioTest" />
        <audio v-if="audioStream" :srcObject="audioStream" autoplay></audio>
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">RTC Gain Control</p>
        <InputBoolean v-model="voiceRtcGain" />
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">RTC Echo Cancellation</p>
        <InputBoolean v-model="voiceRtcEcho" />
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">RTC Noise Supression</p>
        <InputBoolean v-model="voiceRtcNoise" />
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">Noise Cancellation</p>
        <InputBoolean v-model="voiceRnnoise" />
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">Video Input</p>
        <InputList>
          <template #selected>
            <p class="max-w-xs truncate">{{ videoInput }}</p>
          </template>
          <template #items>
            <InputListItem
              v-for="device in usableVideoInputs"
              :key="device.deviceId"
              @click="videoInput = device.deviceId"
            >
              <p class="truncate">{{ device.label }}</p>
            </InputListItem>
          </template>
        </InputList>
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">Video Mode</p>
        <InputList>
          <template #selected>
            {{ videoMode }}
          </template>
          <template #items>
            <InputListItem
              v-for="mode in usableVideoModes"
              :key="mode"
              @click="videoMode = mode"
            >
              {{ mode }}
            </InputListItem>
          </template>
        </InputList>
      </div>
      <div class="flex h-16 items-center justify-between px-6">
        <p class="font-bold">Video Quality</p>
        <InputList>
          <template #selected>
            {{
              usableVideoQualities.find(
                (videoQuality2) => videoQuality2.val === videoQuality
              )?.name
            }}
          </template>
          <template #items>
            <InputListItem
              v-for="quality in usableVideoQualities"
              :key="quality"
              @click="videoQuality = quality.val"
            >
              {{ quality.name }}
            </InputListItem>
          </template>
        </InputList>
      </div>

      <div class="flex min-h-[4rem] items-center justify-between px-6">
        <p class="font-bold">Video Test</p>
        <div class="flex flex-col items-end space-y-4 py-4">
          <InputBoolean v-model="videoTest" />
          <video
            v-if="videoStream"
            class="max-w-sm"
            :srcObject="videoStream"
            autoplay
            muted
          ></video>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InputRange from "../components/InputRange.vue";
import InputList from "../components/InputList.vue";
import InputListItem from "../components/InputListItem.vue";
import InputBoolean from "../components/InputBoolean.vue";
import { computed, onMounted, ref, Ref, onUnmounted } from "vue";
import { configToComputed, isDesktop, isMobile } from "../global/helpers";
import ArrowLeftIcon from "../icons/ArrowLeftIcon.vue";
import { useStore } from "../global/store";

const store = useStore();

const usableVideoModes = [
  "480p30",
  "480p60",
  "720p30",
  "720p60",
  "1080p30",
  "1080p60",
];

const usableVideoQualities = [
  { name: "Auto", val: 0 },
  { name: "Dynamic (3mbps)", val: 3000000 },
  { name: "Dynamic (5mbps)", val: 5000000 },
  { name: "Dynamic (7mbps)", val: 7000000 },
  { name: "Dynamic (10mbps)", val: 10000000 },
  { name: "Dynamic (15mbps)", val: 15000000 },
  { name: "Dynamic (20mbps)", val: 20000000 },
  { name: "Dynamic (25mbps)", val: 25000000 },
  { name: "Dynamic (30mbps)", val: 30000000 },
  { name: "Dynamic (35mbps)", val: 35000000 },
  { name: "Dynamic (40mbps)", val: 40000000 },
];

const usableAudioOutputs: Ref<MediaDeviceInfo[]> = ref([]);
const usableAudioInputs: Ref<MediaDeviceInfo[]> = ref([]);
const usableVideoInputs: Ref<MediaDeviceInfo[]> = ref([]);

const audioOutput = computed({
  get() {
    const device = usableAudioOutputs.value.find(
      (d) => d.deviceId === store.config.audioOutput
    );

    if (device) {
      return device.label;
    }

    return "Default";
  },
  async set(val) {
    await store.writeConfig("audioOutput", val);
  },
});

const audioInput = computed({
  get() {
    const device = usableAudioInputs.value.find(
      (d) => d.deviceId === store.config.audioInput
    );

    if (device) {
      return device.label;
    }

    return "Default";
  },
  async set(val) {
    await store.writeConfig("audioInput", val);
  },
});

const videoInput = computed({
  get() {
    const device = usableVideoInputs.value.find(
      (d) => d.deviceId === store.config.videoInput
    );

    if (device) {
      return device.label;
    }

    return "Default";
  },
  async set(val) {
    await store.writeConfig("videoInput", val);
  },
});

let audioStream: Ref<MediaStream | null> = ref(null);

const audioTest = computed({
  get() {
    return !!audioStream.value;
  },
  async set(val) {
    if (val) {
      try {
        audioStream.value = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: store.config.audioInput || "default",
            echoCancellation: store.config.voiceRtcEcho,
            autoGainControl: store.config.voiceRtcGain,
            noiseSuppression: store.config.voiceRtcNoise,
          },
        });
      } catch {
        audioStream.value = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: "default",
            echoCancellation: store.config.voiceRtcEcho,
            autoGainControl: store.config.voiceRtcGain,
            noiseSuppression: store.config.voiceRtcNoise,
          },
        });
      }
    } else {
      if (audioStream.value) {
        for (const track of audioStream.value.getTracks()) {
          track.stop();
        }

        audioStream.value = null;
      }
    }
  },
});

let videoStream: Ref<MediaStream | null> = ref(null);

const videoTest = computed({
  get() {
    return !!videoStream.value;
  },
  async set(val) {
    if (val) {
      try {
        videoStream.value = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: store.config.videoInput || "default",
          },
        });
      } catch {
        videoStream.value = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: "default",
          },
        });
      }
    } else {
      if (videoStream.value) {
        for (const track of videoStream.value.getTracks()) {
          track.stop();
        }

        videoStream.value = null;
      }
    }
  },
});

const audioOutputGain = configToComputed<number>("audioOutputGain");
const audioInputGain = configToComputed<number>("audioInputGain");
const audioInputTrigger = configToComputed<number>("audioInputTrigger");
const videoMode = configToComputed<string>("videoMode");
const videoQuality = configToComputed<number>("videoQuality");
const voiceRtcGain = configToComputed<boolean>("voiceRtcGain");
const voiceRtcEcho = configToComputed<boolean>("voiceRtcEcho");
const voiceRtcNoise = configToComputed<boolean>("voiceRtcNoise");
const voiceRnnoise = configToComputed<boolean>("voiceRnnoise");

document.title = "Hyalus \u2022 Audio & Video";

onMounted(async () => {
  if (!isDesktop) {
    for (const type of ["audio", "video"]) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          [type]: true,
        });

        for (const track of stream.getTracks()) {
          track.stop();
        }
      } catch {
        //
      }
    }
  }

  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
    (d) =>
      !d.label.startsWith("Default -") &&
      !d.label.startsWith("Communications -")
  );

  usableAudioOutputs.value = devices.filter((d) => d.kind === "audiooutput");
  usableAudioInputs.value = devices.filter((d) => d.kind === "audioinput");
  usableVideoInputs.value = devices.filter((d) => d.kind === "videoinput");
});

onUnmounted(() => {
  if (audioStream.value) {
    for (const track of audioStream.value.getTracks()) {
      track.stop();
    }

    audioStream.value = null;
  }

  if (videoStream.value) {
    for (const track of videoStream.value.getTracks()) {
      track.stop();
    }

    videoStream.value = null;
  }
});

store.sideBarOpen = false;
</script>
