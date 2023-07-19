<template>
  <div>
    <p class="text-2xl">Roles</p>
    <div class="mt-8 flex min-h-0 space-x-4">
      <div class="w-48 space-y-2.5">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-gray-400">
            {{ space.roles.length + 1 }} Role{{
              space.roles.length + 1 === 1 ? "" : "s"
            }}
          </p>
          <button
            class="h-4 w-4 transition hover:text-white"
            @click="createModal = true"
          >
            <PlusIcon />
          </button>
        </div>
        <div class="space-y-0.5 overflow-auto">
          <div
            v-for="role in space.roles"
            :key="role.id"
            class="relative"
            draggable="true"
            dropzone="true"
            @dragover="onDragOver($event, role)"
            @dragleave="onDragLeave($event)"
            @dragstart="onDragStart($event, role)"
            @drop="onDrop($event, role)"
          >
            <div
              v-if="
                dropRoleId === role.id && draggedRolePosition < role.position
              "
              class="border-primary-500 absolute bottom-0 w-full border-t-2"
            />
            <div
              v-if="
                dropRoleId === role.id && draggedRolePosition > role.position
              "
              class="border-primary-500 absolute top-0 w-full border-t-2"
            />
            <button
              class="hover:bg-dark-800 flex w-full items-center space-x-2 rounded-md py-1.5 px-2 text-sm transition"
              :class="{
                'bg-dark-800': id === role.id,
              }"
              @click="id = role.id"
            >
              <div
                class="h-2.5 w-2.5 rounded-full bg-gray-500"
                :style="
                  role.color
                    ? `background: #${role.color
                        .toString(16)
                        .padStart(6, '0')};`
                    : ''
                "
              ></div>
              <p>{{ role.name }}</p>
            </button>
          </div>
          <button
            class="hover:bg-dark-800 flex w-full items-center space-x-2 rounded-md py-1.5 px-2 text-sm transition"
            :class="{
              'bg-dark-800': id === '',
            }"
            @click="id = ''"
          >
            <div class="h-2.5 w-2.5 rounded-full bg-gray-500"></div>
            <p>@everyone</p>
          </button>
        </div>
      </div>
      <div class="flex-1 space-y-4 overflow-auto">
        <div v-if="id" class="w-full space-y-2.5">
          <p class="text-sm font-semibold text-gray-400">Name</p>
          <input
            v-model="name"
            type="text"
            class="ring-primary-500 dark:border-dark-500 dark:bg-dark-800 w-full resize-none rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm transition focus:outline-none focus:ring dark:text-gray-400"
          />
        </div>
        <div v-if="id" class="w-full space-y-2.5">
          <p class="text-sm font-semibold text-gray-400">
            Color (Hex, 000000 = Default)
          </p>
          <input
            v-model="color"
            type="text"
            class="ring-primary-500 dark:border-dark-500 dark:bg-dark-800 w-full resize-none rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm transition focus:outline-none focus:ring dark:text-gray-400"
          />
          <div
            class="bg-dark-800 border-dark-500 flex items-center justify-center space-x-4 border p-2"
          >
            <div
              class="h-10 w-10 rounded-full"
              :class="{
                'bg-gray-500': !color,
              }"
              :style="color ? `background: #${color};` : ''"
            ></div>
            <div class="space-y-2">
              <div class="flex w-full space-x-2">
                <button
                  class="h-6 w-6 rounded-md bg-red-400 transition hover:bg-opacity-80"
                  @click="color = 'f87171'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-orange-400 transition hover:bg-opacity-80"
                  @click="color = 'fb923c'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-yellow-400 transition hover:bg-opacity-80"
                  @click="color = 'facc15'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-lime-400 transition hover:bg-opacity-80"
                  @click="color = 'a3e635'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-green-400 transition hover:bg-opacity-80"
                  @click="color = '4ade80'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-teal-400 transition hover:bg-opacity-80"
                  @click="color = '2dd4bf'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-cyan-400 transition hover:bg-opacity-80"
                  @click="color = '22d3ee'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-sky-400 transition hover:bg-opacity-80"
                  @click="color = '38bdf8'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-indigo-400 transition hover:bg-opacity-80"
                  @click="color = '818cf8'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-violet-400 transition hover:bg-opacity-80"
                  @click="color = 'a78bfa'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-fuchsia-400 transition hover:bg-opacity-80"
                  @click="color = 'e879f9'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-pink-400 transition hover:bg-opacity-80"
                  @click="color = 'f472b6'"
                ></button>
              </div>
              <div class="flex w-full space-x-2">
                <button
                  class="h-6 w-6 rounded-md bg-red-500 transition hover:bg-opacity-80"
                  @click="color = 'f87171'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-orange-500 transition hover:bg-opacity-80"
                  @click="color = 'fb923c'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-yellow-500 transition hover:bg-opacity-80"
                  @click="color = 'facc15'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-lime-500 transition hover:bg-opacity-80"
                  @click="color = 'a3e635'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-green-500 transition hover:bg-opacity-80"
                  @click="color = '4ade80'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-teal-500 transition hover:bg-opacity-80"
                  @click="color = '2dd4bf'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-cyan-500 transition hover:bg-opacity-80"
                  @click="color = '22d3ee'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-sky-500 transition hover:bg-opacity-80"
                  @click="color = '38bdf8'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-indigo-500 transition hover:bg-opacity-80"
                  @click="color = '818cf8'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-violet-500 transition hover:bg-opacity-80"
                  @click="color = 'a78bfa'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-fuchsia-500 transition hover:bg-opacity-80"
                  @click="color = 'e879f9'"
                ></button>
                <button
                  class="h-6 w-6 rounded-md bg-pink-500 transition hover:bg-opacity-80"
                  @click="color = 'f472b6'"
                ></button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="id" class="flex w-full items-center justify-between">
          <p class="text-sm font-semibold text-gray-400">Seperate</p>
          <InputBoolean v-model="seperate" />
        </div>
        <div v-if="id" class="flex w-full items-center justify-between">
          <p class="text-sm font-semibold text-gray-400">Mentionable</p>
          <InputBoolean v-model="mentionable" />
        </div>
        <SpacePermissionsEditor
          :show-general="true"
          :show-members="true"
          :show-special="true"
          :show-text-channels="true"
          :show-voice-channels="true"
          :space="space"
          :allow="allow"
          @update:allow="allow = $event"
        />
        <div class="space-x-4">
          <button
            class="bg-dark-400 hover:bg-dark-200 rounded-md py-2 px-6 text-sm transition"
            @click="save"
          >
            Save
          </button>
          <button
            v-if="id"
            class="bg-dark-400 hover:bg-dark-200 rounded-md py-2 px-6 text-sm transition"
            @click="deleteModal = true"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    <SpaceRoleCreateModal
      v-if="createModal"
      :space="space"
      @close="createModal = false"
    />
    <SpaceRoleDeleteModal
      v-if="deleteModal && selectedRole"
      :space="space"
      :role="selectedRole"
      @close="deleteModal = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { PlusIcon } from "@heroicons/vue/20/solid";
import axios from "axios";
import { PropType, ref, watch, computed, onBeforeMount } from "vue";
import { ISpace, ISpaceRole } from "../global/types";
import InputBoolean from "./InputBoolean.vue";
import SpacePermissionsEditor from "./SpacePermissionsEditor.vue";
import SpaceRoleCreateModal from "./SpaceRoleCreateModal.vue";
import SpaceRoleDeleteModal from "./SpaceRoleDeleteModal.vue";

const props = defineProps({
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
const id = ref("");
const name = ref("");
const color = ref("");
const allow = ref(0);
const seperate = ref(false);
const mentionable = ref(false);
const createModal = ref(false);
const deleteModal = ref(false);
const error = ref("");
const draggedRoleId = ref("");
const draggedRolePosition = ref(0);
const dropRoleId = ref("");

const update = () => {
  const role = props.space.roles.find((role) => role.id === id.value);

  if (role) {
    name.value = role.name;
    color.value = role.color.toString(16).padStart(6, "0");
    allow.value = role.allow;
    seperate.value = role.seperate;
    mentionable.value = role.mentionable;
  } else {
    name.value = "";
    color.value = "";
    allow.value = props.space.defaultAllow;
    seperate.value = false;
    mentionable.value = false;
  }

  error.value = "test";
};

const save = async () => {
  if (id.value) {
    await axios.patch(`/api/v1/spaces/${props.space.id}/roles/${id.value}`, {
      name: name.value,
      color: parseInt(color.value, 16),
      seperate: seperate.value,
      mentionable: mentionable.value,
      allow: allow.value,
    });
  } else {
    await axios.patch(`/api/v1/spaces/${props.space.id}`, {
      defaultAllow: allow.value,
    });
  }
};

const onDragStart = (e: DragEvent, role: ISpaceRole) => {
  if (!e.dataTransfer) {
    return;
  }

  e.dataTransfer.setData("text/plain", role.id);

  draggedRoleId.value = role.id;
  draggedRolePosition.value = role.position;
};

const onDragOver = (e: DragEvent, role: ISpaceRole) => {
  e.preventDefault();
  dropRoleId.value = role.id;
};

const onDragLeave = (e: DragEvent) => {
  e.preventDefault();
  dropRoleId.value = "";
};

const onDrop = async (e: DragEvent, role: ISpaceRole) => {
  if (!e.dataTransfer) {
    return;
  }

  draggedRoleId.value = "";
  draggedRolePosition.value = 0;
  dropRoleId.value = "";

  await axios.patch(
    `/api/v1/spaces/${props.space.id}/roles/${e.dataTransfer.getData(
      "text/plain",
    )}`,
    {
      position: role.position,
    },
  );
};

const selectedRole = computed(() => {
  return props.space.roles.find((role) => role.id === id.value);
});

onBeforeMount(() => {
  const openRole = props.space.roles[0];
  if (openRole) {
    id.value = openRole.id;
  }
  update();
});

watch(
  () => id.value,
  () => {
    update();
  },
);
</script>
