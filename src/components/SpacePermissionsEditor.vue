<template>
  <div class="w-full space-y-4 text-sm">
    <div v-if="showGeneral" class="space-y-2">
      <div class="text-sm font-semibold text-gray-400">
        Permissions (General)
      </div>
      <SpacePermissionEditorItem
        name="ViewChannels"
        :permission="SpacePermission.ViewChannels"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="ManageChannels"
        :permission="SpacePermission.ManageChannels"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="ManageRoles"
        :permission="SpacePermission.ManageRoles"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="ManageSpace"
        :permission="SpacePermission.ManageSpace"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
    </div>

    <div v-if="showMembers" class="space-y-2">
      <div class="text-sm font-semibold text-gray-400">
        Permissions (Members)
      </div>
      <SpacePermissionEditorItem
        name="CreateInvite"
        :permission="SpacePermission.CreateInvite"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="SetAlias"
        :permission="SpacePermission.SetAlias"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="ManageAliases"
        :permission="SpacePermission.ManageAliases"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="KickMember"
        :permission="SpacePermission.KickMember"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="BanMember"
        :permission="SpacePermission.BanMember"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
    </div>

    <div v-if="showChannels" class="space-y-2">
      <div class="text-sm font-semibold text-gray-400">
        Permissions (Channels)
      </div>
      <SpacePermissionEditorItem
        name="ViewChannels"
        :permission="SpacePermission.ViewChannels"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="ManageChannels"
        :permission="SpacePermission.ManageChannels"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="ManageRoles"
        :permission="SpacePermission.ManageRoles"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
    </div>

    <div v-if="showTextChannels" class="space-y-2">
      <div class="text-sm font-semibold text-gray-400">
        Permissions (Text Channels)
      </div>
      <SpacePermissionEditorItem
        name="CreateMessage"
        :permission="SpacePermission.CreateMessage"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="CreateMessageLink"
        :permission="SpacePermission.CreateMessageLink"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="CreateMessageUpload"
        :permission="SpacePermission.CreateMessageUpload"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="MentionAny"
        :permission="SpacePermission.MentionAny"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="ManageMessages"
        :permission="SpacePermission.ManageMessages"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="GetMessages"
        :permission="SpacePermission.GetMessages"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
    </div>

    <div v-if="showVoiceChannels" class="space-y-2">
      <div class="text-sm font-semibold text-gray-400">
        Permissions (Voice Channels)
      </div>
      <SpacePermissionEditorItem
        name="VoiceConnect"
        :permission="SpacePermission.VoiceConnect"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="VoiceUseAudio"
        :permission="SpacePermission.VoiceUseAudio"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="VoiceUseAudioOpen"
        :permission="SpacePermission.VoiceUseAudioOpen"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="VoiceUseVideo"
        :permission="SpacePermission.VoiceUseVideo"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="VoiceUseDisplay"
        :permission="SpacePermission.VoiceUseDisplay"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="VoiceMuteMembers"
        :permission="SpacePermission.VoiceMuteMembers"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="VoiceDeafenMembers"
        :permission="SpacePermission.VoiceDeafenMembers"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
      <SpacePermissionEditorItem
        name="VoiceMoveMembers"
        :permission="SpacePermission.VoiceMoveMembers"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
    </div>

    <div v-if="showSpecial" class="space-y-2">
      <p class="text-sm font-semibold text-gray-400">Permissions (Special)</p>
      <SpacePermissionEditorItem
        name="Admin"
        :permission="SpacePermission.Admin"
        :allow="allow"
        :deny="deny"
        :space="space"
        @update:allow="$emit('update:allow', $event)"
        @update:deny="$emit('update:deny', $event)"
      />
    </div>

    <div class="flex space-x-2 text-sm font-semibold text-gray-400">
      <p v-if="allow !== null">Allow: +{{ allow }}</p>
      <p v-if="deny !== null">Deny: +{{ deny }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SpacePermission } from "@/../hyalus-server/src/types";
import { PropType } from "vue";
import { ISpace } from "../global/types";
import SpacePermissionEditorItem from "./SpacePermissionEditorItem.vue";

defineProps({
  allow: {
    type: Number,
    default: null,
  },
  deny: {
    type: Number,
    default: null,
  },
  showGeneral: {
    type: Boolean,
  },
  showMembers: {
    type: Boolean,
  },
  showChannels: {
    type: Boolean,
  },
  showTextChannels: {
    type: Boolean,
  },
  showVoiceChannels: {
    type: Boolean,
  },
  showSpecial: {
    type: Boolean,
  },
  space: {
    type: Object as PropType<ISpace>,
    default() {
      //
    },
  },
});
defineEmits(["update:allow", "update:deny"]);
</script>
