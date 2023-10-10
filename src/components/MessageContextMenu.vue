<template>
  <ContextMenu ref="menu">
    <ContextMenuItem v-if="canReply" @click="reply">
      <p>Reply</p>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="canEdit"
      @click="
        menu!.close();
        $emit('edit');
      "
    >
      <p>Edit Message</p>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="canDelete"
      @click="
        menu!.close();
        $emit('delete');
      "
    >
      <p>Delete Message</p>
    </ContextMenuItem>
    <ContextMenuItem v-if="hasText" @click="copyText">
      <p>Copy Text</p>
    </ContextMenuItem>
    <ContextMenuItem @click="copyUserId">
      <p>Copy User ID</p>
    </ContextMenuItem>
    <ContextMenuItem @click="copyMessageId">
      <p>Copy Message ID</p>
    </ContextMenuItem>
  </ContextMenu>
</template>

<script lang="ts">
import { defineComponent, ref, type Ref, type PropType } from "vue";
import type { IChannel, IMessage } from "@/global/types";
import ContextMenu from "./ContextMenu.vue";
import ContextMenuItem from "./ContextMenuItem.vue";
import { MessageType } from "../../../hyalus-server/src/types";
import { store } from "@/global/store";

export default defineComponent({
  setup() {
    return {
      menu: ref(null) as Ref<typeof ContextMenu | null>,
    };
  },
  data() {
    return {
      editModal: false,
      deleteModal: false,
    };
  },
  computed: {
    canReply() {
      return [
        // repliable message types:
        MessageType.PrivateText,
        MessageType.SpaceText,
      ].includes(this.message.type);
    },
    canEdit() {
      return (
        this.message.author.id === store.self!.id &&
        [
          // editable message types:
          MessageType.PrivateText,
          MessageType.SpaceText,
        ].includes(this.message.type)
      );
    },
    canDelete() {
      return (
        this.message.author.id === store.self!.id && // TODO: support ManageMessages permission in spaces
        [
          // deletable message types:
          MessageType.PrivateText,
          MessageType.PrivateUpload,
          MessageType.SpaceText,
          MessageType.SpaceUpload,
        ].includes(this.message.type)
      );
    },
    hasText() {
      return [
        // copyable message types:
        MessageType.PrivateText,
        MessageType.SpaceText,
      ].includes(this.message.type);
    },
  },
  props: {
    message: {
      type: Object as PropType<IMessage>,
      required: true,
    },
    channel: {
      type: Object as PropType<IChannel>,
      required: true,
    },
  },
  methods: {
    open(e: MouseEvent) {
      this.menu!.open(e);
    },
    copyUserId() {
      this.menu!.close();
      navigator.clipboard.writeText(this.message.author.id);
    },
    copyMessageId() {
      this.menu!.close();
      navigator.clipboard.writeText(this.message.id);
    },
    reply() {
      this.menu!.close();
      this.$emit("reply");
    },
    copyText() {
      this.menu!.close();
      if (this.message.dataString) {
        navigator.clipboard.writeText(this.message.dataString);
      }
    },
  },
  emits: ["reply", "edit", "delete"],
  components: {
    ContextMenu,
    ContextMenuItem,
  },
});
</script>
