import {
  CallStreamType,
  ChannelType,
  ColorMode,
  ColorTheme,
  MessageType,
  SocketMessageType,
  SpaceChannelOverrideType,
  NotificationMode,
  Status,
  VoiceStateFlags,
} from "@/../../hyalus-server/src/types";
import { Socket } from "./socket";

export interface IState {
  ready: boolean;
  away: boolean;
  config: IConfig;
  socket: Socket | null;
  updateAvailable: boolean;
  updateRequired: boolean;
  self: ISelf | null;
  friends: IFriend[];
  channels: IChannel[];
  channelStates: IChannelState[];
  typingStates: ITypingState[];
  voiceStates: IVoiceState[];
  spaces: ISpace[];
  call: ICall | null;
  expectedEvent: SocketMessageType | null;
  invite: string | null;
  sideBarOpen: boolean;
  sideBarState: SideBarState;
  quickSwitcherOpen: boolean;
  cachedUsers: Map<string, ICachedUser>;
  userStatuses: Map<string, IUserStatus>;
}

export type IConfig = _IConfig & Record<string, unknown>;

export interface _IConfig {
  v: number;
  colorMode: ColorMode;
  colorTheme: ColorTheme;
  colorSync: boolean;
  fontScale: number;
  grayscale: boolean;
  adaptiveLayout: boolean;
  audioOutput: string;
  audioInput: string;
  videoInput: string;
  videoMode: string;
  audioOutputGain: number;
  audioInputGain: number;
  audioInputTrigger: number;
  voiceRtcEcho: boolean;
  voiceRtcGain: boolean;
  voiceRtcNoise: boolean;
  voiceRnnoise: boolean;
  notifySound: boolean;
  notifySystem: boolean;
  betaBanner: boolean;
  token: Uint8Array | null;
  salt: Uint8Array | null;
  publicKey: Uint8Array | null;
  privateKey: Uint8Array | null;
  callPersist: string | null;
  searchKeys: string;
  openAppKeys: string;
  toggleMuteKeys: string;
  toggleDeafenKeys: string;
  joinCallKeys: string;
  leaveCallKeys: string;
  openCurrentCallKeys: string;
  uploadFileKeys: string;
  appDownloadBanner: boolean;
  showChannelMembers: boolean;
  streamerModeEnabled: boolean;
  streamerModeAuto: boolean;
  streamerModeHideWindow: boolean;
  streamerModeHideAccount: boolean;
  streamerModeHideInviteLinks: boolean;
  streamerModeDisableNotifications: boolean;
  streamerModeDisableSounds: boolean;
  recentChannelIds: string[];
  experimentsEnabled: boolean;
  experiments: Record<string, string>;
}

export interface ICachedUser {
  time: Date;
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  bio: string;
  flags: number;
}

export interface ICall {
  channelId: string;
  start: Date;
  muted: boolean;
  mutedBeforeDeaf: boolean;
  deaf: boolean;
  updatePersistInterval: number;
  pc: RTCPeerConnection;
  localKeyId: number;
  localKeyCounter: number;
  localKeySwapTarget: number;
  localKeySwapTimeout: number;
  localKeyAcks: string[];
  localKeyAcksNeeded: number;
  localKeys: Map<number, CryptoKey>;
  remoteKeys: Map<string, CryptoKey>;
  localStreams: ICallLocalStream[];
  remoteStreams: ICallRemoteStream[];
  usedSenders: {
    audio: RTCRtpSender[];
    video: RTCRtpSender[];
  };
  flags: number;
  initComplete: boolean;
  encryptWorkers: Map<string, Worker>;
  decryptWorkers: Map<string, Worker>;
}

export interface ICallPersist {
  updated: number;
  channelId: string;
  localStreams: CallStreamType[];
}

export interface ICallLocalStream {
  type: CallStreamType;
  track: MediaStreamTrack;
  gain1: GainNode | null; // for audio mute
  gain2: GainNode | null; // for audio input volume
  speaking: boolean;
  sender: RTCRtpSender;
}

export interface ICallRemoteStream {
  userId: string;
  type: CallStreamType;
  track: MediaStreamTrack;
  context: AudioContext;
  gain: GainNode | null;
  speaking: boolean;
  receiver: RTCRtpReceiver;
  element: IHTMLMediaElement | null;
}

export interface ICallTile {
  id: string;
  user: ISelf | IChannelMember;
  localTrack: ICallLocalStream | null;
  remoteTrack: ICallRemoteStream | null;
}

export interface ISelf {
  id: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean | null;
  name: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  preferredStatus: Status;
  preferredStatusText: string;
  bio: string;
  authKeyUpdatedAt: Date;
  typingEvents: boolean;
  totpEnabled: boolean;
  currentSessionId: string;
  flags: number;
}

export interface ISession {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  ip: string;
  userAgent: string;
}

export interface IFriend {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  flags: number;
  accepted: boolean;
  acceptable: boolean;
}

export interface IChannel {
  id: string;
  type: ChannelType;
  name: string | null;
  avatar: string | null;
  position: number | null;
  ownerId: string | null;
  spaceId: string | null;
  parentId: string | null;
  activeAt: Date;
  addedAt: Date;
  members: IChannelMember[];
  overrides: IChannelOverride[];
  messages: IMessage[];
}

export interface IChannelMember {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  flags: number;
  publicKey: Uint8Array;
}

export interface IChannelOverride {
  id: string;
  type: SpaceChannelOverrideType;
  scope: string | null;
  allow: number;
  deny: number;
}

export interface IChannelState {
  id: string;
  readAt: Date;
  mentionCount: number;
  muted: boolean;
}

export interface IMessage {
  id: string;
  type: MessageType;
  createdAt: Date;
  updatedAt: Date;
  author: IMessageAuthor;
  data: Uint8Array | null;
  dataString: string | null;
  dataFormatted: string | null;
  key: Uint8Array | null;
  parent?: IMessage;
}

export interface IMessageAuthor {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
}

export interface ISocketMessage {
  t: SocketMessageType;
  d?: unknown;
}

export interface ISocketHook {
  ttl: number;
  ttlTimeout: number | null;
  type: SocketMessageType;
  hook(msg: ISocketMessage): void;
}

export interface IHTMLMediaElement extends HTMLMediaElement {
  setSinkId(sinkId: string): void;
}

export enum SideBarState {
  NONE,
  HOME,
  FRIENDS,
  SETTINGS,
  SPACE,
}

export interface ISpace {
  id: string;
  name: string;
  avatar: string | null;
  defaultAllow: number;
  defaultNotificationMode: NotificationMode;
  ownerId: string;
  self: ISpaceSelf;
  roles: ISpaceRole[];
  members: ISpaceMember[];
}

export interface ISpaceMember {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  flags: number;
  publicKey: Uint8Array;
  roleIds: string[];
  alias: string | null;
}

export interface ISpaceRole {
  id: string;
  name: string;
  color: number;
  position: number;
  seperate: boolean;
  mentionable: boolean;
  allow: number;
}

export interface ISpaceSelf {
  notificationMode: NotificationMode;
  addedAt: Date;
  position: number;
}

export interface ITypingState {
  id: string;
  channelId: string;
  time: Date;
}

export interface IVoiceState {
  id: string;
  channelId: string;
  flags: VoiceStateFlags;
}

export interface ISpaceBan {
  createdAt: Date;
  reason: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    flags: number;
  };
}

export interface ISpaceInvite {
  createdAt: Date;
  expiresAt: Date | null;
  code: string;
  uses: number;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    flags: number;
  };
}

export enum SettingsPage {
  Account,
  Profile,
  Sessions,
  Appearance,
  Notifications,
  AudioVideo,
  Keybinds,
  Development,
  Desktop,
  StreamerMode,
  Experiments,
  Changelog,
}

export interface IUserStatus {
  status: Status;
  statusText: string;
}

export interface IExperiment {
  id: string;
  default: string;
  options: string[];
}
