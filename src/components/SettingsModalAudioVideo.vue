<template>
  <div>
    <p class="text-2xl">Audio & Video</p>
    <div class="mt-8 divide-y divide-ctp-surface0/50 border-b border-t border-ctp-surface0/50">
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Audio Output</p>
        <InputList class="w-96">
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
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Audio Output Volume</p>
        <InputRange v-model="audioOutputGain" min="0" max="200" class="w-96" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Audio Input</p>
        <InputList class="w-96">
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
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Audio Input Volume</p>
        <InputRange v-model="audioInputGain" min="0" max="200" class="w-96" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Audio Input Sensitivity</p>
        <InputRange v-model="audioInputTrigger" min="0" max="100" class="w-96" />
      </div>
      <div class="flex min-h-[4rem] items-center justify-between">
        <p class="font-bold">Audio Test</p>
        <InputBoolean v-model="audioTest" />
        <audio v-if="audioStream" :srcObject="audioStream" autoplay></audio>
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">RTC Gain Control</p>
        <InputBoolean v-model="voiceRtcGain" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">RTC Echo Cancellation</p>
        <InputBoolean v-model="voiceRtcEcho" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">RTC Noise Supression</p>
        <InputBoolean v-model="voiceRtcNoise" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Noise Cancellation</p>
        <InputBoolean v-model="voiceRnnoise" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Video Input</p>
        <InputList class="w-96">
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
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Video Mode</p>
        <InputList class="w-96">
          <template #selected>
            {{ videoMode }}
          </template>
          <template #items>
            <InputListItem v-for="mode in usableVideoModes" :key="mode" @click="videoMode = mode">
              {{ mode }}
            </InputListItem>
          </template>
        </InputList>
      </div>
      <div class="flex min-h-[4rem] items-center justify-between">
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
import InputRange from "@/components/InputRange.vue";
import InputList from "@/components/InputList.vue";
import InputListItem from "@/components/InputListItem.vue";
import InputBoolean from "@/components/InputBoolean.vue";
import { computed, onMounted, ref, type Ref, onUnmounted } from "vue";
import { configToComputed, isDesktop } from "@/global/helpers";
import { useStore } from "@/global/store";

const store = useStore();

const usableVideoModes = ["540p30", "540p60", "720p30", "720p60", "1080p30", "1080p60"];
const usableAudioOutputs: Ref<MediaDeviceInfo[]> = ref([]);
const usableAudioInputs: Ref<MediaDeviceInfo[]> = ref([]);
const usableVideoInputs: Ref<MediaDeviceInfo[]> = ref([]);

const audioOutput = computed({
  get() {
    const device = usableAudioOutputs.value.find((d) => d.deviceId === store.config.audioOutput);

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
    const device = usableAudioInputs.value.find((d) => d.deviceId === store.config.audioInput);

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
    const device = usableVideoInputs.value.find((d) => d.deviceId === store.config.videoInput);

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
      audioStream.value = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: {
            ideal: store.config.audioInput,
          },
          echoCancellation: {
            ideal: store.config.voiceRtcEcho,
          },
          autoGainControl: {
            ideal: store.config.voiceRtcGain,
          },
          noiseSuppression: {
            ideal: store.config.voiceRtcNoise,
          },
        },
      });
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
      videoStream.value = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: {
            ideal: store.config.videoInput,
          },
        },
      });
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
    (d) => !d.label.startsWith("Default -") && !d.label.startsWith("Communications -"),
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
</script>
