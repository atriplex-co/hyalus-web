import sodium from "libsodium-wrappers";
import { router } from "../router";
import {
  CallStreamType,
  ChannelType,
  ColorMode,
  ColorTheme,
  MessageType,
  PushProtocol,
  SocketMessageType,
  SocketProtocol,
  NotificationMode,
  Status,
} from "@/../../hyalus-server/src/types";
import type {
  ICallPersist,
  IChannel,
  IChannelMember,
  IHTMLMediaElement,
  ISocketHook,
  ISocketMessage,
  ISpaceMember,
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
  wcImportKey,
} from "./helpers";
import { store } from "../global/store";
import axios from "axios";
import SoundStateUp from "../assets/sounds/state-change_confirm-up.ogg";
import SoundStateDown from "../assets/sounds/state-change_confirm-down.ogg";
import msgpack from "msgpack-lite";

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
    this.ws.binaryType = "arraybuffer";

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
        },
      });
    });

    this.ws.addEventListener("message", async ({ data: _msg }) => {
      // const msg = JSON.parse(_msg) as ISocketMessage;
      const msg = msgpack.decode(new Uint8Array(_msg)) as ISocketMessage;
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
              publicKey: string;
              status: Status;
              roleIds: string[];
              alias: string | null;
            }[];
          }[];
          voiceStates: {
            id: string;
            channelId: string;
            flags: number;
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
            members: space.members.map((member) => ({
              id: member.id,
              alias: member.alias,
              avatar: member.avatar,
              flags: member.flags,
              name: member.name,
              publicKey: sodium.from_base64(member.publicKey),
              roleIds: member.roleIds,
              status: member.status,
              username: member.username,
            })),
          });
        }

        for (const voiceState of data.voiceStates) {
          store.voiceStates.push(voiceState);
        }

        store.ready = true;

        if (store.call) {
          this.send({
            t: SocketMessageType.CCallJoin,
            d: {
              channelId: store.call.channelId,
            },
          });
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
          parent?: {
            id: string;
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
        };

        const channel = store.channels.find((channel) => channel.id === data.channelId);

        if (!channel) {
          console.warn(`SMessageCreate for invalid channel: ${data.channelId}`);
          return;
        }

        const message = await processMessage({
          ...data,
          channel,
          parent: data.parent && {
            ...data.parent,
            channel,
          },
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
          return console.warn(`SMessageUpdate for invalid channel: ${data.channelId}`);
        }

        const message = channel.messages.find((message) => message.id === data.id);

        if (!message) {
          return console.warn(`SMessageUpdate for invalid message: ${data.id}`);
        }

        const message2 = await processMessage({
          channel,
          ...message,
          ...data,
          parent: undefined, // this is shitty and messy
        });

        if (!message2) {
          console.warn(`error processing message for SMessageUpdate: ${data.id}`);
          return;
        }

        Object.assign(message, message2, {
          parent: message.parent,
        });
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
            publicKey: string;
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
          members: data.members.map((member) => ({
            alias: member.alias,
            avatar: member.avatar,
            flags: member.flags,
            id: member.id,
            roleIds: member.roleIds,
            name: member.name,
            publicKey: sodium.from_base64(member.publicKey),
            status: member.status,
            username: member.username,
          })),
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
          publicKey: string;
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
          publicKey: sodium.from_base64(data.publicKey),
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
          channelId?: string | null;
          flags?: number;
        };

        if (data.id === store.self!.id) {
          return; // don't process voice state updates from ourself.
        }

        const handleUserJoin = async () => {
          playSound(SoundStateUp);
          console.debug("voice: updating call keys (reason: user joined)");
          await store.callUpdateKeys();
        };

        const handleUserLeave = async () => {
          playSound(SoundStateDown);
          console.debug("voice: updating call keys (reason: user left)");
          await store.callUpdateKeys();
        };

        const state = store.voiceStates.find((state) => state.id === data.id);

        if (!state && data.channelId) {
          store.voiceStates.push({
            id: data.id,
            channelId: data.channelId,
            flags: data.flags!,
          });

          if (store.call && data.channelId === store.call.channelId) {
            handleUserJoin();
          }
        }

        if (state && state.flags !== undefined) {
          state.flags = data.flags!;
        }

        if (state && data.channelId === null) {
          store.voiceStates = store.voiceStates.filter((state2) => state2 !== state);

          if (store.call && state.channelId === store.call.channelId) {
            handleUserLeave();
          }
        }
      }

      if (msg.t === SocketMessageType.SCallOffer && store.call) {
        const data = msg.d as {
          sdp: string;
          streams: {
            uid: string;
            mid: string;
            type: number;
          }[];
        };

        try {
          await store.call.pc.setRemoteDescription(
            new RTCSessionDescription({
              type: "offer",
              sdp: data.sdp,
            }),
          );
          await store.call.pc.setLocalDescription(await store.call.pc.createAnswer());
          store.socket!.send({
            t: SocketMessageType.CCallAnswer,
            d: {
              sdp: store.call.pc.localDescription!.sdp,
            },
          });
        } catch {
          return store.callUpdateStreams();
        }

        store.call.pc
          .localDescription!.sdp.trim()
          .split("\r\n")
          .filter((l) => l.startsWith("a=rtpmap:"))
          .map((l) => {
            const k = +l.split(" ")[0].split(":")[1].trim();
            const v = l.split(" ")[1].split("/")[0].toLowerCase().trim();
            if (store.call!.payloadCodecs[k] !== v) {
              store.call!.payloadCodecs[k] = v;
              console.debug("updated payload codecs: %o", {
                payloadCodecs: store.call!.payloadCodecs,
              });
            }
          });

        if (!store.call.initComplete) {
          await store.callUpdateKeys(); // set up keys/streams after we receive our first offer.
          await store.callUpdateStreams();
          await store.callUpdateFlags();
          store.call.initComplete = true;
        }

        for (const trans of store.call.pc.getTransceivers()) {
          if (store.call.configuredTransceivers.includes(trans)) {
            continue;
          }

          const senderStreams = trans.sender.createEncodedStreams();
          const receiverStreams = trans.receiver.createEncodedStreams();
          const IV_SIZE = 12;

          senderStreams.readable
            .pipeThrough(
              new TransformStream({
                async transform(frame, controller) {
                  try {
                    if (!store.call) {
                      return;
                    }
                    const stream = store.call.localStreams.find(
                      (stream) => stream.sender === trans.sender,
                    );
                    if (!stream) {
                      return;
                    }
                    const codec = store.call.payloadCodecs[frame.getMetadata().payloadType];
                    const _data = new Uint8Array(frame.data);
                    const key = store.call.localKeys[store.call.localKeyId];
                    let skip = 0;
                    if (codec === "opus" && _data.length === 3) {
                      return; // opus frame (empty)
                    }
                    if (codec === "opus") {
                      skip = 1; // opus frame
                    }
                    if ((codec === "vp8" || codec === "vp9") && (_data[0] & 0x01) === 1) {
                      skip = 3; // VP8/VP9 frame (normal)
                    }
                    if ((codec === "vp8" || codec === "vp9") && (_data[0] & 0x01) === 0) {
                      skip = 10; // VP8/VP9 frame (keyframe)
                    }
                    const iv = new Uint8Array(IV_SIZE);
                    crypto.getRandomValues(iv);
                    const encrypted = await crypto.subtle.encrypt(
                      {
                        name: "AES-GCM",
                        iv,
                      },
                      key.key,
                      new Uint8Array(frame.data, skip),
                    );
                    const data = new Uint8Array(skip + encrypted.byteLength + 2 + IV_SIZE);
                    data.set(new Uint8Array(frame.data, 0, skip), 0);
                    data.set(new Uint8Array([key.id, +stream.speaking]), skip);
                    data.set(new Uint8Array(iv), skip + 2);
                    data.set(new Uint8Array(encrypted), skip + 2 + IV_SIZE);
                    frame.data = data.buffer;

                    // asineth's experimental H264 NALU parser/encrypter:
                    // TODO: doesn't work well so it's diabled for now, making H264 work later.

                    // const _data = new Uint8Array(frame.data);
                    // const starts: number[] = [];
                    // let zc = 0;
                    // for (let i = 0; i < _data.length; ++i) {
                    //   if (zc === 3 && _data[i] === 1) {
                    //     starts.push(i + 1);
                    //   }
                    //   if (_data[i] === 0) {
                    //     zc++;
                    //   } else {
                    //     zc = 0;
                    //   }
                    // }
                    // // const data = new Uint8Array(_data.length + starts.length * (IV_SIZE + 16));
                    // const data = new Uint8Array(_data.length + starts.length * 16);
                    // let offset = 0;
                    // for (let i = 0; i < starts.length; ++i) {
                    //   const naluSkipped = new Uint8Array(frame.data, starts[i], skip);
                    //   const nalu = new Uint8Array(
                    //     frame.data,
                    //     starts[i] + skip,
                    //     starts[i + 1] ? starts[i + 1] - starts[i] - 4 - skip : undefined,
                    //   );
                    //   const iv = new Uint8Array(IV_SIZE);
                    //   crypto.getRandomValues(iv);
                    //   const encrypted = new Uint8Array(
                    //     await crypto.subtle.encrypt(
                    //       {
                    //         name: "AES-GCM",
                    //         // iv,
                    //         iv: new Uint8Array(IV_SIZE),
                    //       },
                    //       key,
                    //       nalu,
                    //     ),
                    //   );
                    //   data.set(new Uint8Array([0x00, 0x00, 0x00, 0x01]), offset); // NALU header
                    //   offset += 4;
                    //   data.set(naluSkipped, offset);
                    //   offset += naluSkipped.length;
                    //   // data.set(iv, offset);
                    //   // offset += iv.length;
                    //   data.set(encrypted, offset);
                    //   offset += encrypted.length;
                    // }
                    // frame.data = data.buffer;

                    controller.enqueue(frame);
                  } catch (e) {
                    console.warn("error encrypting frame");
                    console.warn(e);
                  }
                },
              }),
            )
            .pipeTo(senderStreams.writable);

          receiverStreams.readable
            .pipeThrough(
              new TransformStream({
                async transform(frame, controller) {
                  try {
                    if (!store.call) {
                      return;
                    }
                    const stream = store.call.remoteStreams.find(
                      (stream) => stream.receiver === trans.receiver,
                    );
                    if (!stream) {
                      return;
                    }
                    const codec = store.call!.payloadCodecs[frame.getMetadata().payloadType];
                    const _data = new Uint8Array(frame.data);
                    let skip = 0;
                    if (codec === "opus") {
                      skip = 1; // opus frame
                    }
                    if ((codec === "vp8" || codec === "vp9") && (_data[0] & 0x01) === 1) {
                      skip = 3; // VP8/VP9 frame (normal)
                    }
                    if ((codec === "vp8" || codec === "vp9") && (_data[0] & 0x01) === 0) {
                      skip = 10; // VP8/VP9 frame (keyframe)
                    }
                    const key = store.call.remoteKeys.find(
                      (key) => key.userId === stream.userId && key.id === _data[skip + 0],
                    );
                    if (!key) {
                      return console.warn(`missing key for ${stream.userId} (${stream.type})`);
                    }
                    const decrypted = await crypto.subtle.decrypt(
                      {
                        name: "AES-GCM",
                        iv: new Uint8Array(frame.data, skip + 2, IV_SIZE),
                      },
                      key.key,
                      new Uint8Array(frame.data, skip + 2 + IV_SIZE),
                    );
                    const data = new Uint8Array(decrypted.byteLength + skip);
                    data.set(new Uint8Array(frame.data, 0, skip), 0);
                    data.set(new Uint8Array(decrypted), skip);
                    frame.data = data.buffer;

                    if (stream.speaking !== !!_data[skip + 1]) {
                      stream.speaking = !!_data[skip + 1];
                    }

                    // asineth's experimental H264 NALU parser/decrypter:
                    // TODO: doesn't work well so it's diabled for now, making H264 work later.

                    // const _data = new Uint8Array(frame.data);
                    // const starts: number[] = [];
                    // let zc = 0;
                    // for (let i = 0; i < _data.length; ++i) {
                    //   if (zc === 3 && _data[i] === 1) {
                    //     starts.push(i + 1);
                    //   }
                    //   if (_data[i] === 0) {
                    //     zc++;
                    //   } else {
                    //     zc = 0;
                    //   }
                    // }
                    // // const data = new Uint8Array(_data.length - starts.length * (IV_SIZE + 16));
                    // const data = new Uint8Array(_data.length - starts.length * 16);
                    // let offset = 0;
                    // for (let i = 0; i < starts.length; ++i) {
                    //   const naluSkipped = new Uint8Array(frame.data, starts[i], skip);
                    //   const nalu = new Uint8Array(
                    //     frame.data,
                    //     starts[i] + skip,
                    //     starts[i + 1] ? starts[i + 1] - starts[i] - 4 - skip : undefined,
                    //   );
                    //   const decrypted = new Uint8Array(
                    //     await crypto.subtle.decrypt(
                    //       {
                    //         name: "AES-GCM",
                    //         // iv: nalu.slice(0, IV_SIZE),
                    //         iv: new Uint8Array(IV_SIZE),
                    //       },
                    //       key,
                    //       // nalu.slice(IV_SIZE),
                    //       nalu,
                    //     ),
                    //   );
                    //   data.set(new Uint8Array([0x00, 0x00, 0x00, 0x01]), offset); // NALU header
                    //   offset += 4;
                    //   data.set(naluSkipped, offset);
                    //   offset += naluSkipped.length;
                    //   data.set(decrypted, offset);
                    //   offset += decrypted.length;
                    // }
                    // frame.data = data.buffer;

                    // const decrypted = await crypto.subtle.decrypt(
                    //   {
                    //     name: "AES-GCM",
                    //     iv: new Uint8Array(frame.data, 4, IV_SIZE),
                    //   },
                    //   key,
                    //   new Uint8Array(frame.data, 4 + IV_SIZE),
                    // );
                    // const data = new Uint8Array(decrypted.byteLength + 4);
                    // data.set(new Uint8Array([0x00, 0x00, 0x00, 0x01]), 0);
                    // data.set(new Uint8Array(decrypted), 4);
                    // frame.data = data.buffer;

                    controller.enqueue(frame);
                  } catch (e) {
                    console.warn("error decrypting frame");
                    console.warn(e);
                  }
                },
              }),
            )
            .pipeTo(receiverStreams.writable);

          console.debug(`debug: enabled encryption for mid: ${trans.mid}`);
          store.call.configuredTransceivers.push(trans);
        }

        // the SFU i built uses a different ID format. (honestly it's for easier-to-read logs)
        for (const info of data.streams) {
          const hex = sodium.to_hex(sodium.from_base64(info.uid));
          info.uid = `${hex.slice(0, 8)}`;
          info.uid += `-${hex.slice(8, 8 + 4)}`;
          info.uid += `-${hex.slice(12, 12 + 4)}`;
          info.uid += `-${hex.slice(16, 16 + 4)}`;
          info.uid += `-${hex.slice(20, 20 + 12)}`;
        }

        // remove any dead streams
        for (const stream of store.call.remoteStreams) {
          if (
            !data.streams.find((info) => info.uid === stream.userId && info.type === stream.type)
          ) {
            console.debug(`voice: removing stream: %o`, { uid: stream.userId, type: stream.type });
            store.call.remoteStreams = store.call.remoteStreams.filter(
              (stream2) => stream2 !== stream,
            );
          }
        }

        // add new streams
        for (const info of data.streams) {
          const transceiver = store.call.pc
            .getTransceivers()
            .find((trans) => trans.mid === info.mid);
          if (!transceiver) {
            console.warn(`SCallOffer: missing transceiver for ${info.uid} type ${info.type}`);
            continue;
          }
          const receiver = transceiver.receiver;
          const stream = store.call.remoteStreams.find(
            (stream) => stream.userId === info.uid && stream.type === info.type,
          );
          if (stream) {
            continue;
          }
          console.debug(`voice: adding stream %o`, info);
          let element: IHTMLMediaElement | null = null;
          let gain: GainNode | null = null;
          if (receiver.track.kind === "audio") {
            // this wasted over an hour of my time.
            // chrome requires something to be reading the MediaStreamTrack for AudioContext to work.
            const tmpElement = document.createElement("audio");
            tmpElement.srcObject = new MediaStream([receiver.track]);
            tmpElement.muted = true;
            tmpElement.play();
            const context = new AudioContext({
              latencyHint: "interactive", // this probably improves latency or some shit.
              sampleRate: 48000,
            });
            const source = context.createMediaStreamSource(tmpElement.srcObject);
            const dest = context.createMediaStreamDestination();
            gain = context.createGain();
            source.connect(gain);
            gain.connect(dest);
            gain.gain.value = getUserOutputGain(info.type, info.uid);
            element = document.createElement("audio") as IHTMLMediaElement;
            element.srcObject = dest.stream;
            element.volume = !store.call.deaf ? 1 : 0;
            try {
              element.setSinkId(store.config.audioOutput);
            } catch {
              //
            }
            element.play();
          }
          store.call.remoteStreams.push({
            userId: info.uid,
            type: info.type,
            speaking: false,
            track: receiver.track,
            element,
            gain,
            receiver,
          });
        }
      }

      if (msg.t === SocketMessageType.SCallICECandidate && store.call) {
        const data = msg.d as {
          candidate: string;
        };

        await store.call.pc.addIceCandidate(
          new RTCIceCandidate({
            candidate: data.candidate,
            sdpMid: "0",
            sdpMLineIndex: 0,
            usernameFragment: null,
          }),
        );
      }

      if (msg.t === SocketMessageType.SCallUpdateKeys && store.call) {
        const data = msg.d as {
          userId: string;
          id: number;
          keys: string;
        };

        if (!store.call) {
          return;
        }

        const boxes = msgpack.decode(sodium.from_base64(data.keys));
        const box: Uint8Array = boxes[store.self!.id];
        if (!box) {
          return console.warn(`SCallUpdateKeys: missing key box from ${data.userId}`);
        }

        const channel = store.channels.find((channel) => channel.id === store.call!.channelId);
        if (!channel) {
          return console.warn(`SCallUpdateKeys: missing channel ${store.call.channelId}`);
        }
        let members: IChannelMember[] | ISpaceMember[] = channel.members;
        if (channel.spaceId) {
          const space = store.spaces.find((space) => space.id === channel.spaceId);
          if (!space) {
            return console.warn(`SCallUpdateKeys: missing space ${channel.spaceId}`);
          }
          members = space.members;
        }
        const member = members.find((member) => member.id === data.userId);
        if (!member) {
          return console.warn(`SCallUpdateKeys: missing member ${data.userId}`);
        }

        const key = sodium.crypto_box_open_easy(
          new Uint8Array(box.buffer, sodium.crypto_secretbox_NONCEBYTES),
          new Uint8Array(box.buffer, 0, sodium.crypto_secretbox_NONCEBYTES),
          member.publicKey,
          store.config.privateKey!,
        );

        store.call.remoteKeys.push({
          userId: data.userId,
          id: data.id,
          key: await wcImportKey(key),
        });

        this.send({
          t: SocketMessageType.CCallUpdateKeysACK,
          d: {
            userId: data.userId,
            id: data.id,
          },
        });
      }

      if (msg.t === SocketMessageType.SCallUpdateKeysACK && store.call) {
        const data = msg.d as {
          userId: string;
          id: number;
        };

        if (
          data.id !== store.call.localKeySwapTarget ||
          store.call.localKeyAcks.includes(data.userId)
        ) {
          return;
        }

        store.call.localKeyAcks.push(data.userId);
        if (store.call.localKeyAcks.length === store.call.localKeyAcksNeeded) {
          store.call.localKeyAcks = [];
          clearInterval(store.call.localKeySwapTimeout);
          console.debug("voice: swapping call key (all members ACKed)");
          store.call.localKeyId = store.call.localKeySwapTarget;
        }
      }

      // add new WS message types here!
    });

    this.ws.addEventListener("close", async () => {
      store.ready = false;

      if (store.call) {
        store.call.initComplete = false;
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
    // this.ws.send(JSON.stringify(msg));
    this.ws.send(msgpack.encode(msg));
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
