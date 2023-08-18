<template>
  <div
    v-if="store.self"
    class="flex items-center justify-between rounded-md p-4"
    :class="{
      'bg-ctp-accent text-ctp-base': session.id === store.self.currentSessionId,
      'bg-ctp-surface0/50': session.id !== store.self.currentSessionId,
    }"
  >
    <div class="flex items-center space-x-4">
      <div class="h-8 w-8">
        <GlobeAltIcon v-if="agentType === 'web'" />
        <ComputerDesktopIcon v-if="agentType === 'desktop'" />
        <DevicePhoneMobileIcon v-if="agentType === 'mobile'" />
      </div>
      <div>
        <p class="font-bold">{{ agentFormatted }}</p>
        <p
          class="text-sm"
          :class="{
            'text-ctp-subtext0': session.id !== store.self.currentSessionId,
            'text-ctp-surface0': session.id === store.self.currentSessionId,
          }"
        >
          {{ updatedAt }}
        </p>
      </div>
    </div>
    <button
      v-if="session.id !== store.self.currentSessionId"
      class="hover:text-ctp-white h-8 w-8 rounded-full bg-ctp-surface0 p-2 text-ctp-subtext0 transition hover:bg-ctp-surface0/50"
      @click="del"
    >
      <TrashIcon />
    </button>
  </div>
</template>

<script lang="ts" setup>
import Day from "dayjs";
import UAParser from "ua-parser-js";
import type { PropType } from "vue";
import type { ISession } from "../global/types";
import axios from "axios";
import { useStore } from "../global/store";
import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

const store = useStore();

const props = defineProps({
  session: {
    type: Object as PropType<ISession>,
    default: null,
  },
});

// const createdAt = Day(props.session.createdAt).calendar();
// eslint-disable-next-line vue/no-setup-props-destructure
const updatedAt = Day(props.session.updatedAt).calendar();
// const ip = props.session.ip.replace("::ffff:", "");
// eslint-disable-next-line vue/no-setup-props-destructure
const agentParsed = UAParser(props.session.userAgent);
// const showIp = ref(false);

let agentFormatted = "";
let agentType = "web";

if (agentParsed.browser) {
  agentFormatted += agentParsed.browser.name;

  if (agentParsed.browser.version) {
    agentFormatted += ` ${agentParsed.browser.version}`;
  }
}

if (agentParsed?.device?.type === "mobile" || agentParsed?.device?.type === "tablet") {
  agentType = "mobile";
}

// eslint-disable-next-line vue/no-setup-props-destructure
const parts = props.session.userAgent.split("Electron/");
if (parts.length >= 2) {
  agentFormatted = `Hyalus ${parts[1].split(" ")[0]}`;
  agentType = "desktop";
}

if (agentParsed.os) {
  if (agentFormatted) {
    agentFormatted += ` on `;
  }

  agentFormatted += agentParsed.os.name;

  if (agentParsed.os.version) {
    agentFormatted += ` ${agentParsed.os.version}`;
  }
}

const del = async () => {
  await axios.delete(`/api/v1/sessions/${props.session.id}`);
};
</script>
