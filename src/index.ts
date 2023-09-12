import "./index.css";
import "overlayscrollbars/overlayscrollbars.css";
import { createApp } from "vue";
import App from "@/App.vue";
import { router } from "@/router";
import ServiceWorker from "@/shared/serviceWorker?worker";
import { getWorkerUrl, isMobile } from "./global/helpers";
import { pinia, store } from "@/global/store";
import Day from "dayjs";
import DayCalendar from "dayjs/plugin/calendar";
import DayDuration from "dayjs/plugin/duration";
import DayRelativeTime from "dayjs/plugin/relativeTime";
import DayLocalizedFormat from "dayjs/plugin/localizedFormat";
import DayISOWeek from "dayjs/plugin/isoWeek";
import { ColorMode } from "@/../../hyalus-server/src/types";

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

if (import.meta.env.DEV) {
  const _window = window as Record<string, any>;
  _window.store = store;
}
