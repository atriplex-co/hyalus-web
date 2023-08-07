import { idbGet, idbKeys } from "../global/idb";
import { iceServers, RTCMaxMessageSize } from "../global/config";
import sodium from "libsodium-wrappers";
import { router } from "../router";
import {
  CallRTCDataType,
  CallStreamType,
  ChannelType,
  ColorMode,
  ColorTheme,
  FileChunkRTCType,
  MessageType,
  PushProtocol,
  SocketMessageType,
  SocketProtocol,
  NotificationMode,
  Status,
} from "@/../../hyalus-server/src/types";
import type {
  ICallPersist,
  ICallRTCData,
  IChannel,
  IHTMLMediaElement,
  ISocketHook,
  ISocketMessage,
} from "./types";
import {
  cleanObject,
  getChannelState,
  getUserOutputGain,
  isDesktop,
  isMobile,
  notifyGetAvatarUrl,
  notifySend,
  playSound,
  processMessage,
} from "./helpers";
import { store } from "../global/store";
import axios from "axios";
import SoundStateUp from "../assets/sounds/state-change_confirm-up.ogg";
import SoundStateDown from "../assets/sounds/state-change_confirm-down.ogg";

let updateCheck: string;
let awayController: AbortController;
let socketRetries = 0;

export class Socket {
  ws = new WebSocket(`${location.origin.replace("http", "ws")}/api/v1/ws`);
  hooks: ISocketHook[] = [];
  preventReconnect = false;
  meta: {
    proto: number;
    type: string;
    vapidPublic: string;
  } | null = null;

  constructor() {
    // this.ws.binaryType = "arraybuffer";

    this.ws.addEventListener("open", async () => {
      socketRetries = 0;

      if (!store.config.token) {
        this.close();
        return;
      }

      this.send({
        t: SocketMessageType.CStart,
        d: {
          proto: SocketProtocol,
          token: sodium.to_base64(store.config.token),
          away: store.away,
          fileChunks: (await idbKeys())
            .filter((key) => key.startsWith("file:"))
            .map((key) => key.replaceAll("file:", "")),
        },
      });
    });

    this.ws.addEventListener("message", async ({ data: _msg }) => {
      const msg = JSON.parse(_msg) as ISocketMessage;
      // const msg = msgpack.decode(new Uint8Array(_msg)) as/ ISocketMessage;
      console.debug("ws/rx: %o", { t: SocketMessageType[msg.t], d: msg.d });

      for (const hook of this.hooks) {
        if (msg.t !== hook.type) {
          continue;
        }

        clearTimeout(hook.ttlTimeout || undefined);
        hook.ttlTimeout = +setTimeout(() => {
          this.hooks = this.hooks.filter((h) => h !== hook);
        }, hook.ttl);

        hook.hook(msg);
      }

      if (msg.t === SocketMessageType.SReady) {
        const data = msg.d as {
          self: {
            id: string;
            email: string;
            emailVerified: boolean;
            phone: string | null;
            phoneVerified: boolean | null;
            name: string;
            username: string;
            avatar: string | null;
            banner: string | null;
            authKeyUpdatedAt: number;
            colorMode: ColorMode;
            colorTheme: ColorTheme;
            preferredStatus: Status;
            preferredStatusText: string;
            bio: string;
            totpEnabled: boolean;
            typingEvents: boolean;
            currentSessionId: string;
            flags: number;
          };
          friends: {
            id: string;
            name: string;
            username: string;
            avatar: string | null;
            flags: number;
            status: Status;
            accepted: boolean;
            acceptable: boolean;
          }[];
          channels: {
            id: string;
            type: number;
            name: string | null;
            avatar: string | null;
            position: number | null;
            ownerId: string | null;
            spaceId: string | null;
            parentId: string | null;
            activeAt: number;
            addedAt: number;
            members: {
              id: string;
              name: string;
              username: string;
              avatar: string | null;
              flags: number;
              publicKey: string;
            }[];
            overrides: {
              id: string;
              type: number;
              scope: string | null;
              allow: number;
              deny: number;
            }[];
          }[];
          channelStates: {
            id: string;
            readAt: number;
            mentionCount: number;
            muted: boolean;
          }[];
          spaces: {
            id: string;
            name: string;
            avatar: string | null;
            defaultAllow: number;
            defaultNotificationMode: NotificationMode;
            ownerId: string;
            self: {
              notificationMode: NotificationMode;
              addedAt: number;
              position: number;
            };
            roles: {
              id: string;
              name: string;
              color: number;
              position: number;
              seperate: boolean;
              mentionable: boolean;
              allow: number;
            }[];
            members: {
              id: string;
              name: string;
              username: string;
              avatar: string | null;
              flags: number;
              status: Status;
              roleIds: string[];
              alias: string | null;
            }[];
          }[];
          voiceStates: {
            id: string;
            channelId: string;
          }[];
          meta: {
            proto: number;
            type: string;
            vapidPublic: string;
          };
        };

        this.meta = data.meta;

        store.self = {
          id: data.self.id,
          email: data.self.email,
          emailVerified: data.self.emailVerified,
          phone: data.self.phone,
          phoneVerified: data.self.phoneVerified,
          name: data.self.name,
          username: data.self.username,
          avatar: data.self.avatar,
          banner: data.self.banner,
          authKeyUpdatedAt: new Date(data.self.authKeyUpdatedAt),
          typingEvents: data.self.typingEvents,
          preferredStatus: data.self.preferredStatus,
          preferredStatusText: data.self.preferredStatusText,
          bio: data.self.bio,
          totpEnabled: data.self.totpEnabled,
          currentSessionId: data.self.currentSessionId,
          flags: data.self.flags,
        };

        store.friends = [];
        store.channels = [];
        store.channelStates = [];
        store.spaces = [];
        store.voiceStates = [];

        for (const friend of data.friends) {
          store.friends.push({
            id: friend.id,
            name: friend.name,
            username: friend.username,
            avatar: friend.avatar,
            flags: friend.flags,
            status: friend.status,
            accepted: friend.accepted,
            acceptable: friend.acceptable,
          });
        }

        for (const channel of data.channels) {
          const out: IChannel = {
            id: channel.id,
            type: channel.type,
            name: channel.name,
            avatar: channel.avatar,
            position: channel.position,
            ownerId: channel.ownerId,
            spaceId: channel.spaceId,
            parentId: channel.parentId,
            activeAt: new Date(channel.activeAt),
            addedAt: new Date(channel.addedAt),
            members: [],
            overrides: [],
            messages: [],
          };

          for (const member of channel.members) {
            out.members.push({
              id: member.id,
              username: member.username,
              name: member.name,
              avatar: member.avatar,
              flags: member.flags,
              publicKey: sodium.from_base64(member.publicKey),
            });
          }

          for (const override of channel.overrides) {
            out.overrides.push({
              id: override.id,
              type: override.type,
              scope: override.scope,
              allow: override.allow,
              deny: override.deny,
            });
          }

          store.channels.push(out);
        }

        for (const channelState of data.channelStates) {
          store.channelStates.push({
            id: channelState.id,
            readAt: new Date(channelState.readAt),
            mentionCount: channelState.mentionCount,
            muted: channelState.muted,
          });
        }

        for (const space of data.spaces) {
          space.roles.sort((a, b) => (a.position > b.position ? 1 : -1));
          store.spaces.push({
            id: space.id,
            name: space.name,
            avatar: space.avatar,
            defaultAllow: space.defaultAllow,
            defaultNotificationMode: space.defaultNotificationMode,
            ownerId: space.ownerId,
            self: {
              notificationMode: space.self.notificationMode,
              addedAt: new Date(space.self.addedAt),
              position: space.self.position,
            },
            roles: space.roles,
            members: space.members,
          });
        }

        for (const voiceState of data.voiceStates) {
          store.voiceStates.push({
            id: voiceState.id,
            channelId: voiceState.channelId,
          });
        }

        // await new Promise((resolve) =>
        //   setTimeout(resolve, 1000 + Math.random() * 2000)
        // );

        store.ready = true;

        if (store.call) {
          this.send({
            t: SocketMessageType.CCallStart,
            d: {
              channelId: store.call.channelId,
            },
          });

          for (const state of store.voiceStates.filter(
            (state) => state.channelId === store.call?.channelId,
          )) {
            for (const stream of store.call.localStreams) {
              await store.callAddLocalStreamPeer(stream, state.id);
            }
          }
        }

        if (store.config.colorSync) {
          await store.writeConfig("colorMode", data.self.colorMode);
          await store.writeConfig("colorTheme", data.self.colorTheme);
        }

        try {
          const { data } = await axios.get("/", {
            headers: {
              accept: "*/*",
            },
          });

          if (updateCheck && updateCheck !== data) {
            store.updateAvailable = true;
          }

          updateCheck = data;
        } catch {
          //
        }

        const initPermissions = async () => {
          removeEventListener("mousedown", initPermissions);

          try {
            if (isMobile && this.meta && this.meta.vapidPublic) {
              await Notification.requestPermission();

              const { pushManager } = (await navigator.serviceWorker.getRegistrations())[0];

              let sub = await pushManager.getSubscription();

              if (sub?.options.applicationServerKey) {
                let subOk = true;

                const localKey = new Uint8Array(sub.options.applicationServerKey);
                const remoteKey = sodium.from_base64(this.meta.vapidPublic);

                if (localKey.length !== remoteKey.length) {
                  subOk = false;
                } else {
                  for (let i = 0; i < localKey.length; ++i) {
                    if (localKey[i] !== remoteKey[i]) {
                      subOk = false;
                      break;
                    }
                  }
                }

                if (!subOk) {
                  await sub.unsubscribe();
                  sub = null;
                }
              }

              if (!sub) {
                sub = await pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: this.meta.vapidPublic,
                });
              }

              const subJson = JSON.parse(JSON.stringify(sub)); // i forget why we do this.

              this.send({
                t: SocketMessageType.CSetPushInfo,
                d: {
                  proto: PushProtocol,
                  endpoint: subJson.endpoint,
                  p256dh: sodium.to_base64(subJson.keys.p256dh),
                  auth: sodium.to_base64(subJson.keys.auth),
                },
              });
            }
          } catch (e) {
            console.warn("failed to setup notifications");
            console.warn(e);
          }

          try {
            if ((isMobile || isDesktop) && window.IdleDetector) {
              const awayDetector = new IdleDetector();
              awayController = new AbortController();

              awayDetector.addEventListener("change", () => {
                const away = !(
                  awayDetector.userState === "active" && awayDetector.screenState === "unlocked"
                );

                if (store.away === away) {
                  return;
                }

                store.away = away;

                if (store.ready) {
                  store.socket?.send({
                    t: SocketMessageType.CSetAway,
                    d: {
                      away,
                    },
                  });
                }
              });

              await awayDetector.start({
                threshold: 1000 * 60 * 10,
                signal: awayController.signal,
              });
            }
          } catch (e) {
            console.warn("failed to setup idle detection");
            console.warn(e);
          }
        };

        if (isMobile) {
          addEventListener("mousedown", initPermissions);
        }

        if (isDesktop) {
          await initPermissions();
        }

        if (isDesktop && store.config.callPersist && !store.call) {
          const callPersist = JSON.parse(store.config.callPersist) as ICallPersist;

          if (
            +new Date() - callPersist.updated > 1000 * 60 * 5 ||
            !store.channels.find((channel) => channel.id === callPersist.channelId)
          ) {
            return;
          }

          await store.callStart(callPersist.channelId);

          for (const stream of callPersist.localStreams) {
            if (![CallStreamType.Audio].includes(stream)) {
              continue;
            }

            await store.callAddLocalStream({
              type: CallStreamType.Audio,
              silent: true,
            });
          }
        }
      }

      if (msg.t === SocketMessageType.SReset) {
        const data = msg.d as {
          error?: string;
          updateRequired?: boolean;
        };

        if (data && data.updateRequired) {
          store.updateAvailable = true;
          store.updateRequired = true;
          this.close();
          return;
        }

        await store.writeConfig("token", null);
        await router.push("/auth");
      }

      if (msg.t === SocketMessageType.SSelfUpdate) {
        const data = msg.d as {
          email?: string;
          emailVerified?: boolean;
          phone?: string;
          phoneVerified?: boolean;
          preferredStatus?: Status;
          typingEvents?: boolean;
          totpEnabled?: boolean;
          colorMode?: ColorMode;
          colorTheme?: ColorTheme;
          authKeyUpdatedAt?: number;
        };

        if (!store.self) {
          return;
        }

        Object.assign(
          store.self,
          cleanObject({
            email: data.email,
            emailVerified: data.emailVerified,
            phone: data.phone,
            phoneVerified: data.phoneVerified,
            preferredStatus: data.preferredStatus,
            typingEvents: data.typingEvents,
            totpEnabled: data.totpEnabled,
            colorMode: data.colorMode,
            colorTheme: data.colorTheme,
          }),
          data.authKeyUpdatedAt !== undefined && {
            authKeyUpdatedAt: new Date(data.authKeyUpdatedAt),
          },
        );

        if (data.colorMode !== undefined && store.config.colorSync) {
          await store.writeConfig("colorMode", data.colorMode);
        }

        if (data.colorTheme !== undefined && store.config.colorSync) {
          await store.writeConfig("colorTheme", data.colorTheme);
        }
      }

      if (msg.t === SocketMessageType.SFriendCreate) {
        const data = msg.d as {
          id: string;
          name: string;
          username: string;
          avatar: string | null;
          flags: number;
          status: number;
          accepted: boolean;
          acceptable: boolean;
        };

        store.friends.push({
          id: data.id,
          name: data.name,
          username: data.username,
          avatar: data.avatar,
          flags: data.flags,
          status: data.status,
          accepted: data.accepted,
          acceptable: data.acceptable,
        });

        if (data.acceptable) {
          notifySend({
            icon: notifyGetAvatarUrl(data.avatar),
            title: data.name,
            body: `${data.name} sent a friend request`,
          });
        }
      }

      if (msg.t === SocketMessageType.SFriendUpdate) {
        const data = msg.d as {
          id: string;
          accepted?: boolean;
          acceptable?: boolean;
        };

        const friend = store.friends.find((friend) => friend.id === data.id);

        if (!friend) {
          console.warn(`SFriendUpdate for invalid ID: ${data.id}`);
          return;
        }

        if (data.accepted !== undefined) {
          friend.accepted = data.accepted;
        }

        if (data.acceptable !== undefined) {
          friend.acceptable = data.acceptable;
        }
      }

      if (msg.t === SocketMessageType.SFriendDelete) {
        const data = msg.d as {
          id: string;
        };

        store.friends = store.friends.filter((friend) => friend.id !== data.id);
      }

      if (msg.t === SocketMessageType.SChannelCreate) {
        const data = msg.d as {
          id: string;
          type: ChannelType;
          name: string | null;
          avatar: string | null;
          position: number | null;
          ownerId: string | null;
          spaceId: string | null;
          parentId: string | null;
          addedAt: number;
          activeAt: number;
          members: {
            id: string;
            name: string;
            username: string;
            avatar: string | null;
            flags: number;
            publicKey: string;
          }[];
          overrides: {
            id: string;
            type: number;
            scope: string | null;
            allow: number;
            deny: number;
          }[];
        };

        const channel: IChannel = {
          id: data.id,
          type: data.type,
          name: data.name,
          avatar: data.avatar,
          position: data.position,
          ownerId: data.ownerId,
          spaceId: data.spaceId,
          parentId: data.parentId,
          activeAt: new Date(data.activeAt),
          addedAt: new Date(data.addedAt),
          members: [],
          overrides: [],
          messages: [],
        };

        for (const member of data.members) {
          channel.members.push({
            id: member.id,
            name: member.name,
            username: member.username,
            avatar: member.avatar,
            flags: member.flags,
            publicKey: sodium.from_base64(member.publicKey),
          });
        }

        for (const override of data.overrides) {
          channel.overrides.push({
            id: override.id,
            type: override.type,
            scope: override.scope,
            allow: override.allow,
            deny: override.deny,
          });
        }

        store.channels.push(channel);

        if (msg.t === store.expectedEvent) {
          await router.push(`/channels/${data.id}`);
        }
      }

      if (msg.t === SocketMessageType.SChannelUpdate) {
        const data = msg.d as {
          id: string;
          name?: string | null;
          avatar?: string | null;
          position?: number | null;
          ownerId?: string | null;
          spaceId?: string | null;
          parentId?: string | null;
          activeAt?: number;
          addedAt?: number;
          overrides?: {
            id: string;
            type: number;
            scope: string | null;
            allow: number;
            deny: number;
          }[];
        };

        const channel = store.channels.find((channel) => channel.id === data.id);

        if (!channel) {
          console.warn(`SChannelUpdate for invalid channel: ${data.id}`);
          return;
        }

        Object.assign(
          channel,
          cleanObject({
            name: data.name,
            avatar: data.avatar,
            position: data.position,
            ownerId: data.ownerId,
            spaceId: data.spaceId,
            overrides: data.overrides,
          }),
          data.activeAt !== undefined && {
            activeAt: new Date(data.activeAt),
          },
          data.addedAt !== undefined && {
            addedAt: new Date(data.addedAt),
          },
        );
      }

      if (msg.t === SocketMessageType.SChannelDelete) {
        const data = msg.d as {
          id: string;
        };

        store.channels = store.channels.filter((channel) => channel.id !== data.id);
        store.channels
          .filter((channel) => channel.parentId === data.id)
          .forEach((channel) => {
            channel.parentId = null;
          });
      }

      if (msg.t === SocketMessageType.SChannelMemberCreate) {
        const data = msg.d as {
          channelId: string;
          id: string;
          name: string;
          username: string;
          avatar: string | null;
          flags: number;
          publicKey: string;
        };

        const channel = store.channels.find((channel) => channel.id === data.channelId);

        if (!channel) {
          console.warn(`channelUserCreate for invalid channel: ${data.channelId}`);
          return;
        }

        channel.members.push({
          id: data.id,
          name: data.name,
          username: data.username,
          avatar: data.avatar,
          flags: data.flags,
          publicKey: sodium.from_base64(data.publicKey),
        });
      }

      if (msg.t === SocketMessageType.SChannelMemberUpdate) {
        const data = msg.d as {
          id: string;
          channelId: string;
        };

        const channel = store.channels.find((channel) => channel.id === data.channelId);

        if (!channel) {
          console.warn(`SChannelMemberUpdate for invalid channel: ${data.channelId}`);
          return;
        }

        const member = channel.members.find((member) => member.id === data.id);

        if (!member) {
          console.warn(`SChannelMemberUpdate for invalid member: ${data.id}`);
          return;
        }
      }

      if (msg.t === SocketMessageType.SChannelMemberDelete) {
        const data = msg.d as {
          channelId: string;
          id: string;
        };

        const channel = store.channels.find((channel) => channel.id === data.channelId);

        if (!channel) {
          console.warn(`SChannelMemberDelete for invalid channel: ${data.channelId}`);
          return;
        }

        channel.members = channel.members.filter((member) => member.id !== data.id);
      }

      if (msg.t === SocketMessageType.SUserUpdate) {
        const data = msg.d as {
          id: string;
          name?: string;
          username?: string;
          avatar?: string | null;
          banner?: string | null;
          bio?: string;
          flags?: number;
          status?: Status;
        };

        const friend = store.friends.find((friend) => friend.id === data.id);
        if (friend) {
          Object.assign(
            friend,
            cleanObject({
              name: data.name,
              username: data.username,
              avatar: data.avatar,
              flags: data.flags,
              status: data.status,
            }),
          );
        }

        for (const channel of store.channels) {
          const member = channel.members.find((member) => member.id === data.id);

          if (member) {
            Object.assign(
              member,
              cleanObject({
                name: data.name,
                username: data.username,
                avatar: data.avatar,
                flags: data.flags,
              }),
            );
          }
        }

        for (const space of store.spaces) {
          const member = space.members.find((member) => member.id === data.id);

          if (member) {
            Object.assign(
              member,
              cleanObject({
                name: data.name,
                username: data.username,
                avatar: data.avatar,
                flags: data.flags,
                status: data.status,
              }),
            );
          }
        }

        const cachedUser = store.cachedUsers.find((user) => user.id === data.id);

        if (cachedUser) {
          Object.assign(
            cachedUser,
            cleanObject({
              name: data.name,
              username: data.username,
              avatar: data.avatar,
              banner: data.banner,
              bio: data.bio,
              flags: data.flags,
            }),
          );
        }

        if (store.self && store.self.id === data.id) {
          Object.assign(
            store.self,
            cleanObject({
              name: data.name,
              username: data.username,
              avatar: data.avatar,
              banner: data.banner,
              bio: data.bio,
              flags: data.flags,
            }),
          );
        }
      }

      if (msg.t === SocketMessageType.SMessageCreate) {
        const data = msg.d as {
          id: string;
          channelId: string;
          type: MessageType;
          createdAt: number;
          updatedAt: number;
          author: {
            id: string;
            name: string;
            username: string;
            avatar: string | null;
          };
          data: string | null;
        };

        const channel = store.channels.find((channel) => channel.id === data.channelId);

        if (!channel) {
          console.warn(`SMessageCreate for invalid channel: ${data.channelId}`);
          return;
        }

        const message = await processMessage({
          ...data,
          channel,
        });

        if (!message || !store.self) {
          console.warn(`SMessageCreate bad message: ${data.id}`);
          return;
        }

        channel.messages.push(message);
        channel.activeAt = new Date();

        const state = getChannelState(channel);

        if (message.author.id === store.self.id) {
          state.readAt = message.createdAt;
          state.mentionCount = 0;
        }

        if (message.author.id !== store.self.id && !channel.spaceId) {
          state.mentionCount++;
        }

        if (data.author.id !== store.self.id && !document.hasFocus()) {
          let title = data.author.name;
          let body = "";

          if (channel.name) {
            title += ` (${channel.name})`;
          }

          if (message && message.dataString) {
            body = message.dataString;
          }

          if (data.type === MessageType.PrivateUploadOld) {
            try {
              body = JSON.parse(body).name;
            } catch {
              //
            }
          }

          if (!body) {
            return;
          }

          notifySend({
            icon: notifyGetAvatarUrl(data.author.avatar),
            title,
            body,
          });
        }
      }

      if (msg.t === SocketMessageType.SMessageDelete) {
        const data = msg.d as {
          id: string;
          channelId: string;
        };

        const channel = store.channels.find((channel) => channel.id === data.channelId);

        if (!channel) {
          console.warn(`SMessageDelete for invalid channel: ${data.channelId}`);
          return;
        }

        channel.messages = channel.messages.filter((message) => message.id !== data.id);
      }

      if (msg.t === SocketMessageType.SMessageUpdate) {
        const data = msg.d as {
          id: string;
          channelId: string;
          createdAt?: number;
          updatedAt?: number;
          data?: string | null;
        };

        const channel = store.channels.find((channel) => channel.id === data.channelId);

        if (!channel) {
          return console.warn(`messageVerionCreate for invalid channel: ${data.channelId}`);
        }

        const message = channel.messages.find((message) => message.id === data.id);

        if (!message) {
          return;
        }

        const message2 = await processMessage({
          channel,
          ...message,
          ...data,
        });

        if (!message2) {
          console.warn(`error processing message for SMessageUpdate: ${data.id}`);
          return;
        }

        Object.assign(message, message2);
      }

      if (msg.t === SocketMessageType.SFileChunkRequest) {
        const data = msg.d as {
          hash: string;
          tag: string;
          userId: string;
          channelId: string;
        };

        if (!store.friends.find((friend) => friend.id === data.userId && friend.acceptable)) {
          console.warn(`SFileChunkRequest for non-friend: ${data.userId}`);
          return;
        }

        const chunk = (await idbGet(`file:${data.hash}`)) as Uint8Array;

        if (!chunk) {
          console.warn(`SFileChunkRequest for invalid hash: ${data.hash}`);
          return;
        }

        const channel = store.channels.find((channel) => channel.id === data.channelId);

        if (!channel) {
          console.warn(`fileChunkRequest for invalid channel: ${data.channelId}`);
          return;
        }

        let publicKey: Uint8Array | null = null;

        if (store.self && store.self.id === data.userId) {
          publicKey = store.config.publicKey;
        } else {
          publicKey =
            channel.members.find((member) => member.id === data.userId)?.publicKey || null;
        }

        if (!publicKey) {
          console.warn(`SFileChunkRequest for invalid user: ${data.userId}`);
          return;
        }

        const pc = new RTCPeerConnection({ iceServers });
        const dc = pc.createDataChannel("");

        const send = (val: unknown) => {
          const json = JSON.stringify(val);
          console.debug("f_rtc/tx: %o", JSON.parse(json)); // yes, there's a reason for this.
          const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

          this.send({
            t: SocketMessageType.CFileChunkRTC,
            d: {
              hash: data.hash,
              tag: data.tag,
              data: sodium.to_base64(
                new Uint8Array([
                  ...nonce,
                  ...sodium.crypto_box_easy(
                    JSON.stringify(val),
                    nonce,
                    publicKey as unknown as Uint8Array,
                    store.config.privateKey as unknown as Uint8Array,
                  ),
                ]),
              ),
            },
          });
        };

        this.registerHook({
          ttl: 1000 * 10,
          ttlTimeout: null,
          type: SocketMessageType.SFileChunkRTC,
          async hook(msg: ISocketMessage) {
            const data2 = msg.d as {
              hash: string;
              tag: string;
              data: string;
            };

            if (data2.hash !== data.hash || data2.tag !== data.tag) {
              return;
            }

            const dataBytes = sodium.from_base64(data2.data);
            const dataDecrypted = JSON.parse(
              sodium.to_string(
                sodium.crypto_box_open_easy(
                  new Uint8Array(dataBytes.buffer, sodium.crypto_box_NONCEBYTES),
                  new Uint8Array(dataBytes.buffer, 0, sodium.crypto_box_NONCEBYTES),
                  publicKey as unknown as Uint8Array,
                  store.config.privateKey as unknown as Uint8Array,
                ),
              ),
            );

            console.debug("f_rtc/rx: %o", dataDecrypted);

            if (dataDecrypted.t === FileChunkRTCType.SDP) {
              await pc.setRemoteDescription(
                new RTCSessionDescription({
                  type: "answer",
                  sdp: dataDecrypted.d,
                }),
              );
            }

            if (dataDecrypted.t === FileChunkRTCType.ICECandidate) {
              await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(dataDecrypted.d)));
            }
          },
        });

        pc.addEventListener("icecandidate", ({ candidate }) => {
          if (!candidate) {
            return;
          }

          send({
            t: FileChunkRTCType.ICECandidate,
            d: JSON.stringify(candidate),
          });
        });

        pc.addEventListener("connectionstatechange", () => {
          console.debug(`f_rtc/peer: ${pc.connectionState}`);
        });

        let i = 0;
        let eof = false;
        const sendChunkMessage = () => {
          if (i > chunk.length) {
            if (!eof) {
              eof = true;
              dc.send("");
            } else {
              dc.close();
            }

            return;
          }

          dc.send(new Uint8Array(chunk.buffer, i, Math.min(RTCMaxMessageSize, chunk.length - i)));

          i += RTCMaxMessageSize;
        };

        dc.addEventListener("open", () => {
          console.debug("f_rtc/dc: open");
          sendChunkMessage();
        });

        dc.addEventListener("bufferedamountlow", () => {
          console.debug("f_rtc/dc: bufferedamountlow");
          sendChunkMessage();
        });

        dc.addEventListener("close", () => {
          pc.close();
          console.debug("f_rtc/dc: close");
        });

        await pc.setLocalDescription(await pc.createOffer());

        send({
          t: FileChunkRTCType.SDP,
          d: pc.localDescription?.sdp,
        });
      }

      if (msg.t === SocketMessageType.SCallRTC) {
        const data = msg.d as {
          userId: string;
          data: string;
        };

        if (!store.call) {
          return;
        }

        const channel = store.channels.find((channel) => channel.id === store.call?.channelId);

        if (!channel) {
          return;
        }

        const member = channel.members.find((member) => member.id === data.userId);

        if (!member || !store.config.privateKey) {
          return;
        }

        const dataBytes = sodium.from_base64(data.data);
        const dataDecrypted: ICallRTCData = JSON.parse(
          sodium.to_string(
            sodium.crypto_box_open_easy(
              new Uint8Array(dataBytes.buffer, sodium.crypto_box_NONCEBYTES),
              new Uint8Array(dataBytes.buffer, 0, sodium.crypto_box_NONCEBYTES),
              member.publicKey,
              store.config.privateKey,
            ),
          ),
        );

        console.debug("c_rtc/rx: %o", {
          ...dataDecrypted,
          mt: CallRTCDataType[dataDecrypted.mt],
          st: CallStreamType[dataDecrypted.st],
          userId: member.id,
        });

        if (
          [CallRTCDataType.RemoteStreamOffer, CallRTCDataType.RemoteStreamICECandidate].includes(
            dataDecrypted.mt,
          )
        ) {
          const getStream = () => {
            return store.call?.remoteStreams.find(
              (stream) => stream.userId === member.id && stream.type === dataDecrypted.st,
            );
          };

          let existingStream = getStream();

          if (dataDecrypted.mt === CallRTCDataType.RemoteStreamOffer) {
            if (existingStream) {
              existingStream.pc.close();
            }

            const pc = new RTCPeerConnection({ iceServers });

            const pcSend = (val: unknown) => {
              const jsonRaw = JSON.stringify(val);
              const json = JSON.parse(jsonRaw);
              console.debug("c_rtc/tx: %o", {
                ...json,
                mt: CallRTCDataType[json.mt],
                st: CallStreamType[json.st],
                userId: member.id,
              }); // yes, there's a reason for this.
              const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

              this.send({
                t: SocketMessageType.CCallRTC,
                d: {
                  userId: data.userId,
                  data: sodium.to_base64(
                    new Uint8Array([
                      ...nonce,
                      ...sodium.crypto_box_easy(
                        JSON.stringify(val),
                        nonce,
                        member.publicKey,
                        store.config.privateKey as unknown as Uint8Array,
                      ),
                    ]),
                  ),
                },
              });
            };

            let element: IHTMLMediaElement | null = null;
            let writer: WritableStreamDefaultWriter | null = null;
            let context: AudioContext | null = null;
            let gain: GainNode | null = null;
            let decoder: MediaDecoder | null = null;

            if ([CallStreamType.Audio, CallStreamType.DisplayAudio].includes(dataDecrypted.st)) {
              const generator = new MediaStreamTrackGenerator({
                kind: "audio",
              });

              writer = generator.writable.getWriter();
              element = document.createElement("audio") as IHTMLMediaElement;
              context = new AudioContext();
              gain = context.createGain();
              const dest = context.createMediaStreamDestination();

              context.createMediaStreamSource(new MediaStream([generator])).connect(gain);
              gain.connect(dest);
              gain.gain.value = getUserOutputGain(dataDecrypted.st, member.id);
              element.srcObject = dest.stream;
              element.volume = !store.call?.deaf ? 1 : 0;

              try {
                element.setSinkId(store.config.audioOutput);
              } catch {
                //
              }

              element.play();

              const decoderInit = {
                output(frame: MediaData) {
                  if (writer) {
                    writer.write(frame);
                  }
                },
                error() {
                  //
                },
              };

              decoder = new AudioDecoder(decoderInit);
            }

            const stream =
              store.call.remoteStreams[
                store.call.remoteStreams.push({
                  userId: data.userId,
                  type: dataDecrypted.st,
                  element,
                  pc,
                  dc: null,
                  writer,
                  context,
                  gain,
                  decoder,
                  muxer: null,
                  speaking: false,
                }) - 1
              ];

            const close = pc.close.bind(pc);
            pc.close = () => {
              close();

              if (pc.onconnectionstatechange) {
                pc.onconnectionstatechange(new Event(""));
              }
            };

            pc.onicecandidate = ({ candidate }) => {
              if (!candidate) {
                return;
              }

              pcSend({
                mt: CallRTCDataType.LocalStreamICECandidate,
                st: dataDecrypted.st,
                d: JSON.stringify(candidate),
              });
            };

            pc.ondatachannel = ({ channel: dc }) => {
              stream.dc = dc;

              const rxBuffer = new Uint8Array(2 * 1024 * 1024);
              let rxBufferPos = 0;
              let decoderConfig = "";

              dc.addEventListener("message", async ({ data }) => {
                if (typeof data === "string") {
                  const info = JSON.parse(data);

                  if (stream.speaking !== info.speaking) {
                    stream.speaking = info.speaking;
                  }

                  if (decoder) {
                    if (decoder.state === "closed") {
                      pc.close();
                      return;
                    }

                    if (decoderConfig !== info.decoderConfig || decoder.state === "unconfigured") {
                      decoderConfig = info.decoderConfig;
                      const parsedDecoderConfig = JSON.parse(decoderConfig);

                      decoder.configure({
                        ...parsedDecoderConfig,
                        hardwareAcceleration: "prefer-hardware",
                        description:
                          parsedDecoderConfig.description &&
                          sodium.from_base64(parsedDecoderConfig.description),
                        optimizeForLatency: true,
                      });
                    }

                    const chunkInit: EncodedMediaChunkInit = {
                      data: new Uint8Array(rxBuffer.buffer, 0, rxBufferPos),
                      type: info.type,
                      timestamp: info.timestamp,
                      duration: info.duration,
                    };

                    let chunk!: EncodedMediaChunk;

                    if (decoder instanceof AudioDecoder) {
                      chunk = new EncodedAudioChunk(chunkInit);
                    }

                    if (decoder instanceof VideoDecoder) {
                      chunk = new EncodedVideoChunk(
                        chunkInit as EncodedVideoChunkInit,
                      ) as EncodedMediaChunk;
                    }

                    try {
                      decoder.decode(chunk);
                    } catch (e) {
                      dc.send("");
                    }
                  }

                  if (stream.muxer) {
                    stream.muxer.feed({
                      video: new Uint8Array(rxBuffer.buffer, 0, rxBufferPos),
                      duration: 1000 / 60, // TODO: dynamic FPS metadata.
                    });
                  }

                  rxBufferPos = 0;
                  return;
                }

                if (rxBufferPos + data.byteLength > rxBuffer.length) {
                  rxBufferPos = 0;
                  return;
                }

                rxBuffer.set(new Uint8Array(data), rxBufferPos);
                rxBufferPos += data.byteLength;
              });

              dc.addEventListener("close", () => {
                pc.close();
              });
            };

            pc.onconnectionstatechange = () => {
              console.debug(`c_rtc/peer: ${pc.connectionState}`);

              if (pc.connectionState === "failed") {
                pc.close();
              }

              if (
                pc.connectionState === "closed" &&
                store.call &&
                store.call.remoteStreams.find((stream2) => stream2 === stream)
              ) {
                if (stream.gain) {
                  stream.gain.disconnect();
                }

                if (stream.muxer) {
                  stream.muxer.destroy();
                }

                if (stream.context) {
                  stream.context.close();
                }

                if (stream.decoder && stream.decoder.state !== "closed") {
                  stream.decoder.close();
                }

                if (stream.writer && !stream.writer.closed) {
                  stream.writer.close();
                }

                if (!store.call) {
                  return;
                }

                store.call.remoteStreams = store.call.remoteStreams.filter(
                  (stream2) => stream2 !== stream,
                );
              }
            };

            await pc.setRemoteDescription(
              new RTCSessionDescription({
                type: "offer",
                sdp: dataDecrypted.d,
              }),
            );
            await pc.setLocalDescription(await pc.createAnswer());

            pcSend({
              mt: CallRTCDataType.LocalStreamAnswer,
              st: dataDecrypted.st,
              d: pc.localDescription?.sdp,
            });
          }

          if (dataDecrypted.mt === CallRTCDataType.RemoteStreamICECandidate) {
            for (let i = 0; i < 10; ++i) {
              if (existingStream) {
                break;
              }

              existingStream = getStream();
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            if (!existingStream) {
              return;
            }

            await existingStream.pc.addIceCandidate(
              new RTCIceCandidate(JSON.parse(dataDecrypted.d)),
            );
          }
        }

        if (
          [CallRTCDataType.LocalStreamAnswer, CallRTCDataType.LocalStreamICECandidate].includes(
            dataDecrypted.mt,
          )
        ) {
          const stream = store.call.localStreams.find((stream) => stream.type === dataDecrypted.st);

          if (!stream) {
            console.warn("SCallRTC missing stream");
            return;
          }

          const peer = stream.peers.find((peer) => peer.userId === data.userId)?.pc;

          if (!peer) {
            console.warn("SCallRTC missing peer");
            return;
          }

          if (dataDecrypted.mt === CallRTCDataType.LocalStreamAnswer) {
            await peer.setRemoteDescription(
              new RTCSessionDescription({
                type: "answer",
                sdp: dataDecrypted.d,
              }),
            );
          }

          if (dataDecrypted.mt === CallRTCDataType.LocalStreamICECandidate) {
            await peer.addIceCandidate(new RTCIceCandidate(JSON.parse(dataDecrypted.d)));
          }
        }
      }

      if (msg.t === SocketMessageType.SCallReset) {
        await store.callReset();
      }

      if (msg.t === SocketMessageType.SSpaceCreate) {
        const data = msg.d as {
          id: string;
          name: string;
          avatar: string | null;
          defaultAllow: number;
          defaultNotificationMode: number;
          ownerId: string;
          self: {
            notificationMode: number;
            addedAt: number;
            position: number;
          };
          roles: {
            id: string;
            name: string;
            position: number;
            color: number;
            seperate: boolean;
            mentionable: boolean;
            allow: number;
          }[];
          members: {
            id: string;
            name: string;
            username: string;
            avatar: string | null;
            flags: number;
            status: number;
            roleIds: string[];
            alias: string | null;
          }[];
          channels: {
            id: string;
            type: number;
            name: string | null;
            avatar: string | null;
            position: number | null;
            ownerId: string | null;
            spaceId: string | null;
            parentId: string | null;
            activeAt: number;
            addedAt: number;
            members: [];
            overrides: {
              id: string;
              type: number;
              scope: string | null;
              allow: number;
              deny: number;
            }[];
          }[];
        };

        store.spaces.push({
          id: data.id,
          name: data.name,
          avatar: data.avatar,
          defaultAllow: data.defaultAllow,
          defaultNotificationMode: data.defaultNotificationMode,
          ownerId: data.ownerId,
          self: {
            notificationMode: data.self.notificationMode,
            addedAt: new Date(data.self.addedAt),
            position: data.self.position,
          },
          roles: data.roles,
          members: data.members,
        });

        for (const channel of data.channels) {
          store.channels.push({
            id: channel.id,
            type: channel.type,
            name: channel.name,
            avatar: channel.avatar,
            position: channel.position,
            ownerId: channel.ownerId,
            spaceId: channel.spaceId,
            parentId: channel.parentId,
            activeAt: new Date(channel.activeAt),
            addedAt: new Date(channel.addedAt),
            members: [],
            overrides: channel.overrides,
            messages: [],
          });
        }

        // TODO: implement expectedEvent for SSpaceCreate
      }

      if (msg.t === SocketMessageType.SSpaceUpdate) {
        const data = msg.d as {
          id: string;
          name?: string;
          avatar?: string;
          defaultAllow?: number;
          defaultNotificationMode?: number;
          self?: {
            notificationMode?: number;
            addedAt?: number;
            position?: number;
          };
        };

        const space = store.spaces.find((space) => space.id === data.id);

        if (!space) {
          return console.warn(`missing space for SSpaceUpdate: ${data.id}`);
        }

        Object.assign(
          space,
          cleanObject({
            name: data.name,
            avatar: data.avatar,
            defaultAllow: data.defaultAllow,
            defaultNotificationMode: data.defaultNotificationMode,
          }),
        );

        if (data.self) {
          Object.assign(
            space.self,
            cleanObject({
              notificationMode: data.self.notificationMode,
              position: data.self.position,
            }),
            data.self.addedAt !== undefined && {
              addedAt: new Date(data.self.addedAt),
            },
          );
        }
      }

      if (msg.t === SocketMessageType.SSpaceDelete) {
        const data = msg.d as {
          id: string;
        };

        store.spaces = store.spaces.filter((v) => v.id !== data.id);
        store.channels = store.channels.filter((v) => v.spaceId !== data.id);
      }

      if (msg.t === SocketMessageType.SSpaceMemberCreate) {
        const data = msg.d as {
          spaceId: string;
          id: string;
          name: string;
          username: string;
          avatar: string | null;
          flags: number;
          status: number;
          roleIds: string[];
          alias: string | null;
        };

        const space = store.spaces.find((space) => space.id === data.spaceId);

        if (!space) {
          return console.warn(`invalid space for SSpaceMemberCreate: ${data.spaceId}`);
        }

        space.members = space.members.filter((member) => member.id !== data.id);
        space.members.push({
          id: data.id,
          name: data.name,
          username: data.username,
          avatar: data.avatar,
          flags: data.flags,
          status: data.status,
          roleIds: data.roleIds,
          alias: data.alias,
        });
      }

      if (msg.t === SocketMessageType.SSpaceMemberUpdate) {
        const data = msg.d as {
          spaceId: string;
          id: string;
          roleIds: string[];
        };

        const space = store.spaces.find((space) => space.id === data.spaceId);

        if (!space) {
          return console.warn(`invalid space for SSpaceMemberUpdate: ${data.spaceId}`);
        }

        const member = space.members.find((member) => member.id === data.id);

        if (!member) {
          return console.warn(`invalid member for SSpaceMemberUpdate: ${data.id}`);
        }

        Object.assign(
          member,
          cleanObject({
            roleIds: data.roleIds,
          }),
        );
      }

      if (msg.t === SocketMessageType.SSpaceMemberDelete) {
        const data = msg.d as {
          spaceId: string;
          id: string;
        };

        const space = store.spaces.find((space) => space.id === data.spaceId);

        if (!space) {
          return console.warn(`invalid space for SSpaceMemberDelete: ${data.spaceId}`);
        }

        space.members = space.members.filter((member) => member.id !== data.id);
      }

      if (msg.t === SocketMessageType.SSpaceRoleCreate) {
        const data = msg.d as {
          spaceId: string;
          id: string;
          name: string;
          color: number;
          position: number;
          seperate: boolean;
          mentionable: boolean;
          allow: number;
        };

        const space = store.spaces.find((space) => space.id === data.spaceId);

        if (!space) {
          return console.warn(`invalid space for SSpaceRoleCreate: ${data.spaceId}`);
        }

        space.roles = space.roles.filter((role) => role.id !== data.id);
        space.roles.push({
          id: data.id,
          name: data.name,
          color: data.color,
          position: data.position,
          seperate: data.seperate,
          mentionable: data.mentionable,
          allow: data.allow,
        });
        space.roles.sort((a, b) => (a.position > b.position ? 1 : -1));
      }

      if (msg.t === SocketMessageType.SSpaceRoleUpdate) {
        const data = msg.d as {
          spaceId: string;
          id: string;
          name?: string;
          color?: number;
          position?: number;
          seperate?: boolean;
          mentionable?: boolean;
          allow?: number;
        };

        const space = store.spaces.find((space) => space.id === data.spaceId);

        if (!space) {
          return console.warn(`invalid space for SSpaceRoleUpdate: ${data.spaceId}`);
        }

        const role = space.roles.find((role) => role.id === data.id);

        if (!role) {
          return console.warn(`invalid role for SSpaceRoleUpdate: ${data.id}`);
        }

        Object.assign(
          role,
          cleanObject({
            name: data.name,
            color: data.color,
            position: data.position,
            seperate: data.seperate,
            mentionable: data.mentionable,
            allow: data.allow,
          }),
        );
        space.roles.sort((a, b) => (a.position > b.position ? 1 : -1));
      }

      if (msg.t === SocketMessageType.SSpaceRoleDelete) {
        const data = msg.d as {
          spaceId: string;
          id: string;
        };

        const space = store.spaces.find((space) => space.id === data.spaceId);

        if (!space) {
          return console.warn(`invalid space for SSpaceMemberDelete: ${data.spaceId}`);
        }

        space.roles = space.roles.filter((role) => role.id !== data.id);

        for (const member of space.members) {
          member.roleIds = member.roleIds.filter((id) => id !== data.id);
        }
      }

      if (msg.t === SocketMessageType.SChannelStateUpdate) {
        const data = msg.d as {
          id: string;
          readAt: number;
          mentionCount: number;
          muted: boolean;
        };

        const channel = store.channels.find((channel) => channel.id === data.id);

        if (!channel) {
          return console.warn(`missing channel for SChannelStateUpdate: ${data.id}`);
        }

        const state = getChannelState(channel);

        state.readAt = new Date(data.readAt);
        state.mentionCount = data.mentionCount;
        state.muted = data.muted;
      }

      if (msg.t === SocketMessageType.STypingStateUpdate) {
        const data = msg.d as {
          id: string;
          channelId: string;
        };

        const state = store.typingStates.find((state) => state.id === data.id);

        if (state) {
          state.channelId = data.channelId;
          state.time = new Date();
        } else {
          store.typingStates.push({
            id: data.id,
            channelId: data.channelId,
            time: new Date(),
          });
        }
      }

      if (msg.t === SocketMessageType.SVoiceStateUpdate) {
        const data = msg.d as {
          id: string;
          channelId: string | null;
        };

        const handleUserLeave = async () => {
          if (!store.call) {
            return;
          }

          for (const stream of store.call.localStreams) {
            for (const peer of stream.peers) {
              if (peer.userId !== data.id) {
                continue;
              }

              peer.pc.close();
              stream.peers = stream.peers.filter((peer2) => peer2 !== peer);
            }
          }

          for (const stream of store.call.remoteStreams) {
            if (stream.userId !== data.id) {
              continue;
            }

            stream.pc.close();
            store.call.remoteStreams = store.call.remoteStreams.filter(
              (stream2) => stream2 !== stream,
            );
          }

          playSound(data.channelId ? SoundStateUp : SoundStateDown);
        };

        const handleUserJoin = async () => {
          if (!store.call) {
            return;
          }

          handleUserLeave();

          for (const stream of store.call.localStreams) {
            await store.callAddLocalStreamPeer(stream, data.id);
          }
        };

        if (data.channelId) {
          store.voiceStates.push({
            id: data.id,
            channelId: data.channelId,
          });

          if (store.call && store.call.channelId === data.channelId) {
            handleUserJoin();
          }
        }

        if (!data.channelId) {
          const state = store.voiceStates.find((state) => state.id === data.id);
          if (!state) {
            return;
          }

          store.voiceStates = store.voiceStates.filter((state2) => state2 !== state);

          if (store.call && store.call.channelId === state.channelId) {
            handleUserLeave();
          }
        }
      }
    });

    this.ws.addEventListener("close", async () => {
      store.ready = false;

      if (store.call) {
        for (const stream of store.call.localStreams) {
          for (const peer of stream.peers) {
            peer.pc.close();
          }
        }

        for (const stream of store.call.remoteStreams) {
          stream.pc.close();
        }
      }

      if (!this.preventReconnect) {
        if (socketRetries++) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        store.socket = new Socket();
      }
    });
  }

  send(msg: ISocketMessage): void {
    console.debug("ws/tx: %o", { t: SocketMessageType[msg.t], d: msg.d });
    this.ws.send(JSON.stringify(msg));
    // this.ws.send(msgpack.encode(msg));
  }

  close(): void {
    this.preventReconnect = true;
    this.ws.close();
  }

  registerHook(hook: ISocketHook): void {
    this.hooks.push(hook);

    hook.ttlTimeout = +setTimeout(() => {
      this.hooks = this.hooks.filter((h) => h !== hook);
    }, hook.ttl);
  }
}
