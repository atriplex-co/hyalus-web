export const SocketProtocol = 8;
export const PushProtocol = 1;
export const MaxSpacesPerUser = 100;
export const MaxMembersPerSpace = 5000;
export const MaxRolesPerSpace = 250;
export const MaxInvitesPerSpace = 500;
export const MaxChannelsPerSpace = 500;
export const MaxOverridesPerSpaceChannel = 250;

export enum ChannelType {
  DM = 0,
  Group = 1,
  SpaceCategory = 2,
  SpaceText = 3,
  SpaceVoice = 4,
}

export enum MessageType {
  PrivateText = 0,
  PrivateUpload = 11,
  PrivateUploadOld = 1,
  FriendAccept = 2,
  GroupCreate = 3,
  GroupAdd = 4,
  GroupRemove = 5,
  GroupName = 6,
  GroupAvatar = 7,
  GroupLeave = 8,
  SpaceText = 9,
  SpaceUpload = 10,
}

export enum SocketMessageType {
  CStart = 0,
  CChannelTyping = 1,
  CFileChunkOwned = 2,
  CFileChunkLost = 3,
  CFileChunkRequest = 4,
  CFileChunkRTC = 5,
  CCallStart = 6,
  CCallStop = 7,
  CCallRTC = 8,
  CSetAway = 9,
  CSetPushInfo = 10,
  SReset = 11,
  SReady = 12,
  SSelfUpdate = 13,
  SSessionCreate = 14,
  SSessionUpdate = 15,
  SSessionDelete = 16,
  SFriendCreate = 17,
  SFriendUpdate = 18,
  SFriendDelete = 19,
  SChannelCreate = 20,
  SChannelUpdate = 21,
  SChannelDelete = 22,
  SChannelMemberCreate = 23,
  SChannelMemberUpdate = 24,
  SChannelMemberDelete = 34,
  SMessageCreate = 26,
  SMessageDelete = 27,
  SMessageUpdate = 29,
  SFileChunkRequest = 30,
  SFileChunkRTC = 31,
  SCallReset = 32,
  SCallRTC = 33,
  SSpaceCreate = 35,
  SSpaceUpdate = 36,
  SSpaceDelete = 37,
  SSpaceMemberCreate = 41,
  SSpaceMemberUpdate = 42,
  SSpaceMemberDelete = 43,
  SSpaceRoleCreate = 44,
  SSpaceRoleUpdate = 45,
  SSpaceRoleDelete = 46,
  SUserUpdate = 48,
  SChannelStateUpdate = 52,
  STypingStateUpdate = 50,
  SVoiceStateUpdate = 51,
}

export enum ColorMode {
  Light = 0,
  Dark = 1,
  DarkOLED = 2,
}

export enum ColorTheme {
  Red = 0,
  Orange = 1,
  Amber = 2,
  Yellow = 3,
  Lime = 4,
  Green = 5,
  Emerald = 6,
  Teal = 7,
  Cyan = 8,
  Sky = 9,
  Blue = 10,
  Indigo = 11,
  Violet = 12,
  Purple = 13,
  Fuchsia = 14,
  Pink = 15,
  Rose = 16,
}

export enum Status {
  Online = 0,
  Away = 1,
  Busy = 2,
  Offline = 3,
}

export enum FileChunkRTCType {
  SDP = 0,
  ICECandidate = 1,
}

export enum CallRTCDataType {
  RemoteStreamOffer = 0,
  RemoteStreamICECandidate = 1, // (for tx's localTrack, rx's remoteTrack)
  LocalStreamAnswer = 2,
  LocalStreamICECandidate = 3, // (for tx's remoteTrack, rx's localTrack)
}

export enum CallStreamType {
  Audio = 0,
  Video = 1,
  DisplayVideo = 2,
  DisplayAudio = 3,
}

export enum NotificationMode {
  All = 0,
  MentionsOnly = 1,
  None = 2,
  Default = 3,
}

export enum SpacePermission {
  // meta
  Admin = 1 << 0,
  // general
  ViewChannels = 1 << 2,
  ManageChannels = 1 << 3,
  ManageRoles = 1 << 4,
  ManageSpace = 1 << 5,
  // members
  CreateInvite = 1 << 6,
  SetAlias = 1 << 7,
  ManageAliases = 1 << 8,
  KickMember = 1 << 9,
  BanMember = 1 << 10,
  // text channels
  CreateMessage = 1 << 11,
  CreateMessageLink = 1 << 12,
  CreateMessageUpload = 1 << 13,
  MentionAny = 1 << 14,
  ManageMessages = 1 << 15,
  GetMessages = 1 << 16,
  // voice channels
  VoiceConnect = 1 << 17,
  VoiceUseAudio = 1 << 18,
  VoiceUseAudioOpen = 1 << 19,
  VoiceUseVideo = 1 << 20,
  VoiceUseDisplay = 1 << 21,
  VoiceMuteMembers = 1 << 22,
  VoiceDeafenMembers = 1 << 23,
  VoiceMoveMembers = 1 << 24,
}

export enum SpaceChannelOverrideType {
  Everyone = 0,
  Role = 1,
  Member = 2,
}

export enum UserFlag {
  System = 1 << 0,
  Staff = 1 << 1,
  Tester = 1 << 2,
  EarlySupporter = 1 << 3,
  BugReporter = 1 << 4,
  Bot = 1 << 5,
}
