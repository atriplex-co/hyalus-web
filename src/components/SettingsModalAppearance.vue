<template>
  <div>
    <p class="text-2xl">Appearance</p>
    <div class="mt-8 divide-y divide-ctp-surface0/50 border-b border-t border-ctp-surface0/50">
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Font Scale</p>
        <InputList>
          <template #selected>
            <p>{{ fontScale }}%</p>
          </template>
          <template #items>
            <InputListItem
              v-for="usableFontScale in usableFontScales"
              :key="usableFontScale"
              @click="fontScale = usableFontScale"
            >
              <p>{{ usableFontScale }}%</p>
            </InputListItem>
          </template>
        </InputList>
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Color Mode</p>
        <InputList>
          <template #selected>
            <div
              class="h-3 w-3 rounded-full"
              :class="{
                'bg-[#2d2d2d]': colorMode === ColorMode.Dark,
                'bg-[#000000]': colorMode === ColorMode.DarkOLED,
                'bg-[#282839]': colorMode === ColorMode.DarkMocha,
                'bg-[#dce0e8]': colorMode === ColorMode.Light,
              }"
            />
            <p>
              {{ formatColorMode(colorMode) }}
            </p>
          </template>
          <template #items>
            <InputListItem
              v-for="usableColorMode in usableColorModes"
              :key="usableColorMode"
              @click="colorMode = usableColorMode"
            >
              <div
                class="h-3 w-3 rounded-full"
                :class="{
                  'bg-[#2d2d2d]': usableColorMode === ColorMode.Dark,
                  'bg-[#000000]': usableColorMode === ColorMode.DarkOLED,
                  'bg-[#282839]': usableColorMode === ColorMode.DarkMocha,
                  'bg-[#dce0e8]': usableColorMode === ColorMode.Light,
                }"
              />
              <p>
                {{ formatColorMode(usableColorMode) }}
              </p>
            </InputListItem>
          </template>
        </InputList>
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Color Theme</p>
        <InputList>
          <template #selected>
            <div class="h-3 w-3 rounded-full bg-ctp-accent" />
            <p>
              {{ formatColorTheme(colorTheme) }}
            </p>
          </template>
          <template #items>
            <InputListItem
              v-for="usableColorTheme in usableColorThemes"
              :key="usableColorTheme"
              @click="colorTheme = usableColorTheme"
            >
              <div
                class="h-3 w-3 rounded-full"
                :class="{
                  'bg-ctp-rosewater': usableColorTheme == ColorTheme.Rosewater,
                  'bg-ctp-flamingo': usableColorTheme == ColorTheme.Flamingo,
                  'bg-ctp-pink': usableColorTheme == ColorTheme.Pink,
                  'bg-ctp-mauve': usableColorTheme == ColorTheme.Mauve,
                  'bg-ctp-red': usableColorTheme == ColorTheme.Red,
                  'bg-ctp-maroon': usableColorTheme == ColorTheme.Maroon,
                  'bg-ctp-peach': usableColorTheme == ColorTheme.Peach,
                  'bg-ctp-yellow': usableColorTheme == ColorTheme.Yellow,
                  'bg-ctp-green': usableColorTheme == ColorTheme.Green,
                  'bg-ctp-teal': usableColorTheme == ColorTheme.Teal,
                  'bg-ctp-sky': usableColorTheme == ColorTheme.Sky,
                  'bg-ctp-sapphire': usableColorTheme == ColorTheme.Sapphire,
                  'bg-ctp-blue': usableColorTheme == ColorTheme.Blue,
                  'bg-ctp-lavender': usableColorTheme == ColorTheme.Lavender,
                }"
              />
              <p>
                {{ formatColorTheme(usableColorTheme) }}
              </p>
            </InputListItem>
          </template>
        </InputList>
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Color Sync</p>
        <InputBoolean v-model="colorSync" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Adaptive Layout</p>
        <InputBoolean v-model="adaptiveLayout" />
      </div>
      <div class="flex h-16 items-center justify-between">
        <p class="font-bold">Grayscale</p>
        <InputBoolean v-model="grayscale" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InputList from "../components/InputList.vue";
import InputListItem from "../components/InputListItem.vue";
import InputBoolean from "../components/InputBoolean.vue";
import { configToComputed } from "../global/helpers";
import { ColorMode, ColorTheme } from "@/../../hyalus-server/src/types";
import { useStore } from "../global/store";
import { computed } from "vue";
import axios from "axios";

const usableColorModes = Object.values(ColorMode).filter(
  (v) => typeof v === "number",
) as ColorMode[];
const usableColorThemes = Object.values(ColorTheme).filter(
  (v) => typeof v === "number",
) as ColorTheme[];
const usableFontScales = [50, 67, 75, 80, 90, 100, 110, 125, 133, 140, 150, 175, 200];

const store = useStore();
const adaptiveLayout = configToComputed<boolean>("adaptiveLayout");
const fontScale = configToComputed<number>("fontScale");
const grayscale = configToComputed<boolean>("grayscale");
const colorSync = configToComputed<boolean>("colorSync");
// const colorMode = configToComputed<ColorMode>("colorMode");
// const colorTheme = configToComputed<ColorTheme>("colorTheme");

const colorMode = computed({
  get() {
    return store.config.colorMode;
  },
  async set(colorMode) {
    await store.writeConfig("colorMode", colorMode);

    if (store.config.colorSync) {
      await axios.post("/api/v1/users/me", {
        colorMode,
      });
    }
  },
});

const colorTheme = computed({
  get() {
    return store.config.colorTheme;
  },
  async set(colorTheme) {
    await store.writeConfig("colorTheme", colorTheme);

    if (store.config.colorSync) {
      await axios.post("/api/v1/users/me", {
        colorTheme,
      });
    }
  },
});

const formatColorTheme = (val: ColorTheme) => {
  return `${ColorTheme[val][0].toUpperCase()}${ColorTheme[val].slice(1)}`;
};

const formatColorMode = (val: ColorMode) => {
  return {
    [ColorMode.Light + ""]: "Light",
    [ColorMode.Dark + ""]: "Dark",
    [ColorMode.DarkOLED + ""]: "Dark (OLED)",
    [ColorMode.DarkMocha + ""]: "Dark (Mocha)",
  }[val + ""];
};
</script>
