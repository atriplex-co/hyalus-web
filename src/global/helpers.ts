import axios, { AxiosError } from "axios";
import { computed } from "vue";
import sodium from "libsodium-wrappers";
import {
  CallStreamType,
  ColorTheme,
  MessageType,
  SpaceChannelOverrideType,
  SpacePermission,
  Status,
} from "@/src/global/constants";
import SoundNotification from "../assets/sounds/notification_simple-01.ogg";
import ImageIcon from "../assets/images/icon-background.png";
import {
  ICallPersist,
  IChannel,
  IChannelMember,
  IHTMLMediaElement,
  IMessage,
  ISelf,
  ICachedUser,
  IChannelState,
  ISpaceRole,
} from "./types";
import { messageFormatter } from "./config";
import { store } from "./store";
import msgpack from "msgpack-lite";

export const prettyError = (e: unknown): string => {
  return (
    (
      (e as AxiosError).response?.data as {
        error?: string;
      }
    )?.error || (e as Error).message
  );
};

export const configToComputed = <T>(k: string) => {
  return computed({
    get() {
      return (store.config as Record<string, unknown>)[k] as T;
    },
    async set(v: T) {
      await store.writeConfig(k, v);
    },
  });
};

export const getWorkerUrl = (val: new () => Worker) => {
  return String(val).split('("')[1].split('"')[0].replace("?worker_file", "");
};

export const processMessage = async (opts: {
  channel: IChannel;
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  type: MessageType;
  createdAt: number | Date;
  updatedAt: number | Date;
  data?: Uint8Array | string | null;
}): Promise<IMessage | undefined> => {
  let publicKey: Uint8Array | null = null;
  let dataString: string | null = null;
  let dataFormatted: string | null = null;
  let data: Uint8Array | null = null;
  let key: Uint8Array | null = null;

  if (!store.self || !store.config.publicKey || !store.config.privateKey) {
    return;
  }

  if (opts.data && typeof opts.data === "string") {
    data = sodium.from_base64(opts.data);
  }

  if (opts.data && opts.data instanceof Uint8Array) {
    data = opts.data;
  }

  if (
    data &&
    [
      MessageType.PrivateText,
      MessageType.PrivateUpload,
      MessageType.PrivateUploadOld,
    ].includes(opts.type)
  ) {
    const msg = msgpack.decode(data);
    data = msg.data;
    key = msg.keys[store.self.id];
  }

  if (data && !key) {
    try {
      dataString = sodium.to_string(data);
    } catch {
      //
    }
  }

  if (data && key) {
    if (opts.author.id === store.self.id) {
      publicKey = store.config.publicKey;
    } else {
      const member =
        opts.channel.members.find((member) => member.id === opts.author.id) ||
        null;
      publicKey = member?.publicKey || null;
    }

    if (!publicKey) {
      console.warn(
        `processMessageVersions for invalid member: ${opts.author.name}`
      );
      return;
    }

    try {
      dataString = sodium.to_string(
        sodium.crypto_secretbox_open_easy(
          new Uint8Array(data.buffer, sodium.crypto_secretbox_NONCEBYTES),
          new Uint8Array(data.buffer, 0, sodium.crypto_secretbox_NONCEBYTES),
          sodium.crypto_box_open_easy(
            new Uint8Array(key.buffer, sodium.crypto_box_NONCEBYTES),
            new Uint8Array(key.buffer, 0, sodium.crypto_box_NONCEBYTES),
            publicKey,
            store.config.privateKey
          )
        )
      );
    } catch (e) {
      console.warn(e);
      console.warn(`failed to decrypt message: ${opts.id}`);
    }
  } else {
    let target: IChannelMember | ISelf | ICachedUser | undefined;

    if ([MessageType.GroupAdd, MessageType.GroupRemove].includes(opts.type)) {
      if (store.self && dataString === store.self?.id) {
        target = store.self;
      } else {
        target = opts.channel.members.find(
          (member) => member.id === dataString
        );
      }

      if (!target && dataString) {
        target = (await getCachedUser(dataString)) || undefined;
      }

      if (!target) {
        console.warn(`processMessage error geting target: ${dataString}`);
        return;
      }

      if (opts.type === MessageType.GroupAdd && target) {
        dataString = `${opts.author.name} added ${target.name}`;
      }

      if (opts.type === MessageType.GroupRemove && target) {
        dataString = `${opts.author.name} removed ${target.name}`;
      }
    }

    if (opts.type === MessageType.GroupName && dataString) {
      dataString = `${opts.author.name} set the group name to "${dataString}"`;
    }

    if (opts.type === MessageType.GroupCreate) {
      dataString = `${opts.author.name} created a group`;
    }

    if (opts.type === MessageType.FriendAccept) {
      if (opts.author.id === store.self?.id) {
        dataString = `You accepted ${opts.channel.members[0].name}'s friend request`;
      } else {
        dataString = `${opts.channel.members[0].name} accepted your friend request`;
      }
    }

    if (opts.type === MessageType.GroupAvatar) {
      dataString = `${opts.author.name} set the group avatar`;
    }

    if (opts.type === MessageType.GroupLeave) {
      dataString = `${opts.author.name} left the group`;
    }
  }

  if (
    dataString &&
    [MessageType.PrivateText, MessageType.SpaceText].includes(opts.type)
  ) {
    dataFormatted = messageFormatter.render(dataString).trim();
  }

  return {
    id: opts.id,
    author: opts.author,
    type: opts.type,
    createdAt: new Date(opts.createdAt),
    updatedAt: new Date(opts.updatedAt),
    data,
    dataString,
    dataFormatted,
    key,
  };
};

export const notifySend = (opts: {
  icon: string;
  title: string;
  body: string;
}) => {
  if (store.self?.preferredStatus === Status.Busy) {
    return;
  }

  if (store.config.notifySound) {
    playSound(SoundNotification);
  }

  if (store.config.notifySystem) {
    try {
      new Notification(opts.title, {
        icon: opts.icon,
        body: opts.body,
        silent: true,
      });
    } catch {
      //
    }
  }
};

export const notifyGetAvatarUrl = (avatar: string | null): string => {
  if (!avatar) {
    return ImageIcon;
  }

  return `/api/v1/avatars/${avatar.split("+")[0]}`;
};

export const callUpdatePersist = async () => {
  await store.writeConfig(
    "callPersist",
    store.call &&
      JSON.stringify({
        // idk why we JSON'd it but otherwise, IDB will shit itself.
        // update (2022.11.27): i figured it out, and we aren't fixing this.
        updated: +new Date(),
        channelId: store.call.channelId,
        localStreams: store.call.localStreams.map((stream) => stream.type),
      } as ICallPersist)
  );
};

export const isDesktop = !!window.HyalusDesktop;
export const isMobile = navigator.userAgent.includes("Mobile");

export const playSound = (url: string) => {
  try {
    const el = document.createElement("audio") as IHTMLMediaElement;
    el.src = url;
    el.volume = 0.5;
    el.setSinkId(store.config.audioOutput);
    el.play();
  } catch {
    //
  }
};

export const updateIcon = async () => {
  (document.querySelector("link[rel='icon']") as HTMLLinkElement).href = (
    await import(
      `../assets/images/icon-standalone-${ColorTheme[
        store.config.colorTheme
      ].toLowerCase()}.png`
    )
  ).default;
};

export const getCachedUser = async (
  id: string
): Promise<ICachedUser | null> => {
  let user: ICachedUser | undefined = store.cachedUsers.find(
    (cachedUser) => cachedUser.id === id
  );

  if (user && +new Date() - +user.time > 30 * 60 * 1000) {
    store.cachedUsers = store.cachedUsers.filter((user2) => user2 !== user);
    user = undefined;
  }

  if (user) {
    return user;
  }

  try {
    const { data } = await axios.get(`/api/v1/users/by-id/${id}`);
    return store.cachedUsers[
      store.cachedUsers.push({
        time: new Date(),
        ...data,
      }) - 1
    ];
  } catch {
    console.warn(`getCachedUser error: ${id}`);
    return null;
  }
};

export const getCachedUserByUsername = async (
  username: string
): Promise<ICachedUser | null> => {
  const cachedUser = store.cachedUsers.find(
    (cachedUser) => cachedUser.username === username
  );

  if (cachedUser) {
    return cachedUser;
  }

  try {
    const { data } = await axios.get(`/api/v1/users/by-username/${username}`);
    store.cachedUsers.push(data);
    return data;
  } catch {
    console.warn(`getCachedUserByUsername error: ${username}`);
    return null;
  }
};

export const getUserOutputGain = (type: CallStreamType, userId: string) => {
  let userGainDefault = 100;

  if (type === CallStreamType.DisplayAudio) {
    userGainDefault = 70;
  }

  const userGain =
    (store.config[`userGain:${userId}:${type}`] as number) ?? userGainDefault;
  const userMuted =
    (store.config[`userMuted:${userId}:${type}`] as boolean) ?? false;

  return (
    (store.config.audioOutputGain / 100) *
    (userGain / 100) *
    (userMuted ? 0 : 1)
  );
};

export const checkSpacePermissions = (opts: {
  permissions: number;
  spaceId: string;
  memberId?: string;
  channelId?: string;
}) => {
  if (!store.self) {
    return;
  }

  const space = store.spaces.find(({ id }) => id === opts.spaceId);

  if (!space) {
    console.warn(`checkSpacePermissions: missing space ${opts.spaceId}`);
    return false;
  }

  if (!opts.memberId) {
    opts.memberId = store.self.id;
  }

  const member = space.members.find(({ id }) => id === opts.memberId);
  const channel = store.channels.find(
    (channel) => channel.id === opts.channelId
  );

  if (!member) {
    console.warn(`checkSpacePermissions: missing member ${opts.memberId}`);
    return false;
  }

  if (opts.channelId && !channel) {
    console.warn(`checkSpacePermissions: missing channel ${opts.channelId}`);
    return false;
  }

  // calc begin

  let allow = space.defaultAllow;

  for (const id of member.roleIds) {
    const role = space.roles.find((role) => role.id === id);
    if (!role) {
      continue;
    }

    allow |= role.allow;
  }

  if (channel) {
    let overrides = channel.overrides;

    if (!overrides.length && channel.parentId) {
      const parent = store.channels.find(
        (channel2) => channel2.id === channel.parentId
      );

      if (parent) {
        overrides = parent.overrides;
      }
    }

    overrides = overrides.sort((a, b) => (a.type > b.type ? 1 : -1));
    overrides = overrides.filter(
      (override) =>
        override.type === SpaceChannelOverrideType.Everyone ||
        (override.type === SpaceChannelOverrideType.Role &&
          override.scope &&
          member.roleIds.includes(override.scope)) ||
        (override.type === SpaceChannelOverrideType.Member &&
          override.scope &&
          override.scope === opts.memberId)
    );

    for (const override of overrides) {
      allow &= ~override.deny;
      allow |= override.allow;
    }
  }

  if (
    space.ownerId === opts.memberId ||
    (allow & SpacePermission.Admin) === SpacePermission.Admin
  ) {
    return true;
  }

  return (allow & opts.permissions) === opts.permissions;
};

export const getChannelState = (channel: IChannel): IChannelState => {
  const state = store.channelStates.find((state) => state.id === channel.id);

  if (state) {
    return state;
  } else {
    store.channelStates.push({
      id: channel.id,
      readAt: channel.addedAt,
      mentionCount: 0,
      muted: false,
    });

    return getChannelState(channel);
  }
};

export const cleanObject = <T>(val: T): T => {
  const _val = val as Record<string, unknown>;

  for (const [k, v] of Object.entries(_val)) {
    if (v === undefined) {
      delete _val[k];
    }
  }

  return val;
};

export const getSpaceMemberPosition = (opts: {
  spaceId: string;
  memberId: string;
}) => {
  const space = store.spaces.find((space) => space.id === opts.spaceId);

  if (!space) {
    return Infinity;
  }

  const member = space.members.find((member) => member.id === opts.memberId);

  if (!member) {
    return Infinity;
  }

  const roles = member.roleIds
    .map((id) => space.roles.find((role) => role.id === id))
    .filter((role) => role) as ISpaceRole[];

  return Math.min(...roles.map((role) => role.position));
};
