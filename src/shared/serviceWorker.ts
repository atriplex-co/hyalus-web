import {
  ChannelType,
  MessageType,
  PushProtocol,
  SocketMessageType,
} from "@/../hyalus-server/src/types";
import { idbGet } from "../global/idb";
import { IConfig } from "../global/types";
import sodium from "libsodium-wrappers";
import ImageIcon from "../assets/images/icon-background.png";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();

if (import.meta.env.PROD) {
  cleanupOutdatedCaches();
  precacheAndRoute(self.__WB_MANIFEST);
} else {
  self.addEventListener("fetch", () => {
    //
  });
}

self.addEventListener("push", (e: PushEvent) => {
  const main = async () => {
    const msg = e.data?.json() as {
      t: number;
      d: unknown;
      p: number;
      e: unknown;
    };

    console.debug("push/rx: %o", msg);

    if (msg.p !== PushProtocol) {
      return;
    }

    const config = await idbGet<IConfig>("config");

    if (!config || !config.privateKey) {
      return;
    }

    if (msg.t === SocketMessageType.SMessageCreate) {
      const data = msg.d as {
        id: string;
        channelId: string;
        userId: string;
        type: MessageType;
        created: number;
        data: string;
        key: string;
      };

      const extra = msg.e as {
        channel: {
          type: ChannelType;
          name?: string;
        };
        user: {
          name: string;
          avatar?: string;
          publicKey: string;
        };
      };

      const messageData = sodium.from_base64(data.data);
      const messageKey = sodium.from_base64(data.key);

      const messageKeyDecrypted = sodium.crypto_box_open_easy(
        new Uint8Array(messageKey.buffer, sodium.crypto_secretbox_NONCEBYTES),
        new Uint8Array(
          messageKey.buffer,
          0,
          sodium.crypto_secretbox_NONCEBYTES,
        ),
        sodium.from_base64(extra.user.publicKey),
        config.privateKey,
      );

      const messageDataDecrypted = sodium.crypto_secretbox_open_easy(
        new Uint8Array(messageData.buffer, sodium.crypto_secretbox_NONCEBYTES),
        new Uint8Array(
          messageData.buffer,
          0,
          sodium.crypto_secretbox_NONCEBYTES,
        ),
        messageKeyDecrypted,
        "text",
      );

      let title = extra.user.name;
      if (extra.channel.type === ChannelType.Group) {
        title += ` (${extra.channel.name})`;
      }

      let icon = ImageIcon;
      if (extra.user.avatar) {
        icon = `/api/v1/avatars/${extra.user.avatar.split("+")[0]}`;
      }

      await self.registration.showNotification(title, {
        icon,
        body: messageDataDecrypted,
        silent: !config.notifySound,
        timestamp: data.created,
      });
    }
  };

  e.waitUntil(main());
});
