import "./index.css";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import ServiceWorker from "./shared/serviceWorker?worker";
import { getWorkerUrl, isMobile } from "./global/helpers";
import { idbDel, idbGet, idbKeys, idbSet } from "./global/idb";
import { pinia, store } from "./global/store";
import Day from "dayjs";
import DayCalendar from "dayjs/plugin/calendar";
import DayDuration from "dayjs/plugin/duration";
import DayRelativeTime from "dayjs/plugin/relativeTime";
import DayLocalizedFormat from "dayjs/plugin/localizedFormat";
import DayISOWeek from "dayjs/plugin/isoWeek";
import { ColorMode } from "@/../hyalus-server/src/types";

if (!isMobile) {
  document.querySelector("link[rel='manifest']")?.remove(); // prevent PWA from being installed on desktop.
}

Day.extend(DayCalendar);
Day.extend(DayDuration);
Day.extend(DayRelativeTime);
Day.extend(DayLocalizedFormat);
Day.extend(DayISOWeek);

await store.start();
await store.setKeybinds();

const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount("#app");

window.dev = {
  store,
  enabled: import.meta.env.DEV,
  start() {
    this.enabled = true;
  },
  stop() {
    this.enabled = false;
    console.clear();
  },
  idb: {
    keys: idbKeys,
    get: idbGet,
    set: idbSet,
    del: idbDel,
  },
};

const _debug = console.debug.bind(console);
console.debug = (...args) => {
  if (!window.dev.enabled) {
    return;
  }

  if (
    [
      "CCallRTC",
      "SCallRTC",
      "RemoteTrackICECandidate",
      "LocalTrackICECandidate",
    ].find((k) => JSON.stringify(args).includes(k))
  ) {
    return;
  }

  _debug(...args);
};

try {
  await navigator.serviceWorker.register(getWorkerUrl(ServiceWorker), {
    type: "module",
    scope: "/",
  });
} catch (e) {
  console.warn("error registering service worker");
  console.warn(e);
}

addEventListener("keydown", async (e: KeyboardEvent) => {
  if (e.key !== "F2") {
    return;
  }

  e.preventDefault();

  if (store.config.colorMode === ColorMode.Light) {
    await store.writeConfig("colorMode", ColorMode.Dark);
  } else if (store.config.colorMode === ColorMode.Dark) {
    await store.writeConfig("colorMode", ColorMode.Light);
  }
});
