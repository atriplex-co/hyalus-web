<template>
  <ModalBase
    v-if="parent"
    :title="channel.overrides.length ? 'Sync Permissions' : 'Unsync Permissions'"
    :submit-text="channel.overrides.length ? 'Sync' : 'Unsync'"
    @close="$emit('close')"
    @submit="submit"
  >
    <template #icon>
      <ArrowPathIcon />
    </template>
    <template #main>
      <ModalError v-if="error" :error="error" />
      <p v-if="channel.overrides.length">
        Are you sure you want to sync the permissions for
        <strong>{{ channel.type === ChannelType.SpaceText ? "#" : "" }}{{ channel.name }}</strong>
        with <strong>{{ parent.name }}</strong
        >?
      </p>
      <p v-if="!channel.overrides.length">
        Are you sure you want to unsync the permissions for
        <strong>{{ channel.type === ChannelType.SpaceText ? "#" : "" }}{{ channel.name }}</strong
        >? This will copy the permissions from the parent.
      </p>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import { ArrowPathIcon } from "@heroicons/vue/20/solid";
import axios from "axios";
import { ChannelType, SpaceChannelOverrideType } from "@/../../hyalus-server/src/types";
import { type PropType, computed, ref } from "vue";
import { prettyError } from "@/global/helpers";
import { useStore } from "@/global/store";
import type { IChannel } from "@/global/types";
import ModalBase from "./ModalBase.vue";
import ModalError from "./ModalError.vue";

const store = useStore();
const props = defineProps({
  channel: {
    type: Object as PropType<IChannel>,
    default() {
      //
    },
  },
});
const emit = defineEmits(["close"]);
const error = ref("");
const parent = computed(() => {
  return store.channels.find((channel) => channel.id === props.channel.parentId);
});

const submit = async () => {
  error.value = "";
  try {
    if (props.channel.overrides.length) {
      await axios.delete(
        `/api/v1/spaces/${props.channel.spaceId}/channels/${props.channel.id}/overrides/all`,
      );
    } else {
      if (parent.value && parent.value.overrides.length) {
        for (const override of parent.value.overrides) {
          await axios.post(
            `/api/v1/spaces/${props.channel.spaceId}/channels/${props.channel.id}/overrides`,
            {
              type: override.type,
              scope: override.scope,
              allow: override.allow,
              deny: override.deny,
            },
          );
        }
      } else {
        await axios.post(
          `/api/v1/spaces/${props.channel.spaceId}/channels/${props.channel.id}/overrides`,
          {
            type: SpaceChannelOverrideType.Everyone,
            scope: null,
            allow: 0,
            deny: 0,
          },
        );
      }
    }

    emit("close");
  } catch (e) {
    error.value = prettyError(e);
  }
};
</script>
