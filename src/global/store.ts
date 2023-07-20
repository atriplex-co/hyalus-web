import { idbDel, idbGet } from "./idb";
import { iceServers, RTCMaxMessageSize } from "./config";
import sodium from "libsodium-wrappers";
import {
  CallRTCDataType,
  CallStreamType,
  ColorMode,
  ColorTheme,
  SocketMessageType,
} from "@/../hyalus-server/src/types";
// import RnnoiseWasm from "@atriplex-co/hyalus-rnnoise/dist/rnnoise.wasm?url";
import RnnoiseWorker from "../shared/rnnoiseWorker?worker";
import SoundStateUp from "../assets/sounds/state-change_confirm-up.ogg";
import SoundStateDown from "../assets/sounds/state-change_confirm-down.ogg";
import SoundNavigateBackward from "../assets/sounds/navigation_backward-selection.ogg";
import SoundNavigateBackwardMin from "../assets/sounds/navigation_backward-selection-minimal.ogg";
import SoundNavigateForward from "../assets/sounds/navigation_forward-selection.ogg";
import SoundNavigateForwardMin from "../assets/sounds/navigation_forward-selection-minimal.ogg";
import {
  ICallLocalStream,
  ICallRTCData,
  IConfig,
  IState,
  SideBarState,
} from "./types";
import {
  callUpdatePersist,
  getUserOutputGain,
  getWorkerUrl,
  playSound,
  updateIcon,
} from "./helpers";
import { Socket } from "./socket";
import { createPinia, defineStore } from "pinia";
import axios from "axios";
import msgpack from "msgpack-lite";

const RnnoiseWasm = "TODO: fix rnnoise wasm import";

export const useStore = defineStore("main", {
  state(): IState {
    return {
      ready: false,
      away: false,
      config: {
        v: 0,
        colorMode: ColorMode.Dark,
        colorTheme: ColorTheme.Green,
        colorSync: true,
        fontScale: 100,
        grayscale: false,
        adaptiveLayout: false,
        audioOutput: "default",
        audioInput: "default",
        videoInput: "default",
        videoMode: "720p60",
        videoQuality: 10000000, // 10mbps
        audioOutputGain: 100,
        audioInputGain: 100,
        audioInputTrigger: 60,
        voiceRtcEcho: true,
        voiceRtcGain: true,
        voiceRtcNoise: true,
        voiceRnnoise: true,
        notifySound: true,
        notifySystem: true,
        betaBanner: true,
        searchKeys: "",
        openAppKeys: "",
        toggleMuteKeys: "",
        toggleDeafenKeys: "",
        joinCallKeys: "",
        leaveCallKeys: "",
        openCurrentCallKeys: "",
        uploadFileKeys: "",
        token: null,
        salt: null,
        publicKey: null,
        privateKey: null,
        callPersist: null,
        appDownloadBanner: true,
        showChannelMembers: true,
      },
      updateAvailable: false,
      updateRequired: false,
      friends: [],
      channels: [],
      channelStates: [],
      typingStates: [],
      voiceStates: [],
      spaces: [],
      sideBarOpen: true,
      sideBarState: SideBarState.NONE,
      socket: null,
      call: null,
      expectedEvent: null,
      invite: null,
      self: null,
      cachedUsers: [],
    };
  },
  actions: {
    async start(): Promise<void> {
      await sodium.ready;

      if (window.HyalusDesktop && window.HyalusDesktop.getBoostrapConfig) {
        const config = window.HyalusDesktop.getBoostrapConfig();
        if (config) {
          localStorage.config = config;
        }
      }

      const oldConfig = await idbGet("config");
      if (oldConfig) {
        localStorage.config = sodium.to_base64(msgpack.encode(oldConfig));
        await idbDel("config");
        location.reload();
      }

      if (localStorage.config) {
        try {
          this.config = {
            ...this.config,
            // ...((await idbGet("config")) as IConfig),
            ...(msgpack.decode(
              sodium.from_base64(localStorage.config),
            ) as IConfig),
          };
        } catch (e) {
          console.warn(e);
          console.warn("error loading config");
        }
      }

      await updateIcon();

      if (!this.config.token) {
        return;
      }

      (
        axios.defaults.headers as {
          authorization?: string;
        }
      )["authorization"] = sodium.to_base64(this.config.token);

      this.socket = new Socket();

      (async () => {
        if (!("getDirectory" in navigator.storage)) {
          return;
        }

        const root =
          (await navigator.storage.getDirectory()) as FileSystemDirectoryHandle &
            AsyncIterable<[string, FileSystemFileHandle]>;

        for await (const [name] of root) {
          if (name.startsWith("tmp_")) {
            await root.removeEntry(name);
          }
        }
      })(); // clean
    },
    async writeConfig(k: string, v: unknown): Promise<unknown> {
      this.config[k] = v;
      // await idbSet("config", { ...this.config }); // this.config is reactive, so it's technically a proxy.
      localStorage.config = sodium.to_base64(msgpack.encode(this.config));

      if (k === "colorTheme") {
        await updateIcon();
      }

      if (k === "audioOutput" && this.call) {
        for (const stream of this.call.remoteStreams) {
          if (!stream.element) {
            continue;
          }

          stream.element.setSinkId(this.config.audioOutput);
        }
      }

      if (k === "audioOutputGain" && this.call) {
        for (const stream of this.call.remoteStreams) {
          if (stream.gain) {
            stream.gain.gain.value = getUserOutputGain(
              stream.type,
              stream.userId,
            );
          }
        }
      }

      if (
        [
          "audioInput",
          "voiceRtcEcho",
          "voiceRtcGain",
          "voiceRtcNoise",
          "voiceRnnoise",
        ].includes(k) &&
        this.call &&
        this.call.localStreams.find(
          (stream) => stream.type === CallStreamType.Audio,
        )
      ) {
        await this.callRemoveLocalStream({
          type: CallStreamType.Audio,
          silent: true,
        });
        await this.callAddLocalStream({
          type: CallStreamType.Audio,
          silent: true,
        });
      }

      if (
        ["videoInput"].includes(k) &&
        this.call &&
        this.call.localStreams.find(
          (stream) => stream.type === CallStreamType.Video,
        )
      ) {
        await this.callRemoveLocalStream({
          type: CallStreamType.Video,
          silent: true,
        });

        await this.callAddLocalStream({
          type: CallStreamType.Video,
          silent: true,
        });
      }

      if (["videoMode", "videoQuality"].includes(k) && this.call) {
        const videoStream = this.call.localStreams.find(
          (stream) => stream.type === CallStreamType.Video,
        );

        const displayVideoStream = this.call.localStreams.find(
          (stream) => stream.type === CallStreamType.DisplayVideo,
        );

        if (videoStream) {
          console.debug("requestInit 2 for videoMode/videoQuality update");
          videoStream.requestInit = true;
        }

        if (displayVideoStream) {
          console.debug("requestInit 3 for videoMode/videoQuality update");
          displayVideoStream.requestInit = true;
        }
      }

      if (
        (k.startsWith("userGain:") || k.startsWith("userMuted:")) &&
        this.call
      ) {
        const stream = this.call.remoteStreams.find(
          (stream) =>
            stream.userId === k.split(":")[1] &&
            stream.type === +k.split(":")[2],
        );

        if (stream && stream.gain) {
          stream.gain.gain.value = getUserOutputGain(
            stream.type,
            stream.userId,
          );
        }
      }

      if (k === "colorSync" && v) {
        await axios.post("/api/v1/users/me", {
          colorMode: store.config.colorMode,
          colorTheme: store.config.colorTheme,
        });
      }

      return v;
    },
    async callAddLocalStreamPeer(
      stream: ICallLocalStream,
      userId: string,
    ): Promise<void> {
      const channel = this.channels.find(
        (channel) => channel.id === this.call?.channelId,
      );

      if (!channel) {
        console.warn("callSendLocalStream missing channel");
        return;
      }

      const member = channel.members.find((member) => member.id === userId);

      if (!member) {
        console.warn("callSendLocalStream missing user");
        return;
      }

      const oldPeer = stream.peers.find((peer) => peer.userId === userId);

      if (oldPeer) {
        oldPeer.pc.close();
      }

      const send = (val: unknown) => {
        const jsonRaw = JSON.stringify(val);
        const json = JSON.parse(jsonRaw) as ICallRTCData;
        console.debug("c_rtc/tx: %o", {
          ...json,
          mt: CallRTCDataType[json.mt],
          st: CallStreamType[json.st],
          userId,
        }); // yes, there's a reason for this.
        const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

        this.socket?.send({
          t: SocketMessageType.CCallRTC,
          d: {
            userId,
            data: sodium.to_base64(
              new Uint8Array([
                ...nonce,
                ...sodium.crypto_box_easy(
                  JSON.stringify(val),
                  nonce,
                  member.publicKey,
                  this.config.privateKey as unknown as Uint8Array,
                ),
              ]),
            ),
          },
        });
      };

      const pc = new RTCPeerConnection({ iceServers });
      const dc = pc.createDataChannel("");

      const peer =
        stream.peers[
          stream.peers.push({
            userId,
            pc,
            dc,
            enabled: [
              // audio streams are enabled by default.
              CallStreamType.Audio,
              CallStreamType.DisplayAudio,
            ].includes(stream.type),
          }) - 1
        ]; // retains reactivity this way.

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

        send({
          mt: CallRTCDataType.RemoteStreamICECandidate,
          st: stream.type,
          d: JSON.stringify(candidate),
        });
      };

      pc.onconnectionstatechange = async () => {
        console.debug(`c_rtc/peer: ${pc.connectionState}`);

        if (pc.connectionState === "failed") {
          pc.close();
        }

        if (
          pc.connectionState === "closed" &&
          stream.peers.find((peer2) => peer2.pc === peer.pc)
        ) {
          stream.peers = stream.peers.filter((peer2) => peer2.pc !== peer.pc);
          stream.requestInit = true;

          if (
            this.ready &&
            this.call &&
            this.call.localStreams.find((stream2) => stream2 === stream) &&
            this.voiceStates.find(
              (state) =>
                this.call &&
                state.id === userId &&
                state.channelId === this.call.channelId,
            )
          ) {
            await this.callAddLocalStreamPeer(stream, userId);
          }
        }
      };

      dc.onmessage = ({ data }) => {
        if (data === "") {
          stream.requestKeyFrame = true;
        }

        if (data === "enable") {
          peer.enabled = true;
          stream.requestInit = true;
        }

        if (data === "disable") {
          peer.enabled = false;
          stream.requestInit = true;
        }
      };

      dc.onclose = () => {
        pc.close();
      };

      await pc.setLocalDescription(await pc.createOffer());

      send({
        mt: CallRTCDataType.RemoteStreamOffer,
        st: stream.type,
        d: pc.localDescription?.sdp,
      });

      (async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 10000);
        });

        if (pc.connectionState !== "connected") {
          pc.close();
        }
      })();
    },
    async callAddLocalStream(opts: {
      type: CallStreamType;
      track?: MediaStreamTrack;
      getTrack?: () => Promise<MediaStreamTrack>;
      silent?: boolean;
      procOverride?: boolean;
      submitOverride?: boolean;
    }): Promise<ICallLocalStream | undefined> {
      if (!this.call) {
        console.warn("callAddLocalStream missing call");
        return;
      }

      let stream: ICallLocalStream | null = null;
      let context: AudioContext | null = null;
      let gain: GainNode | null = null;

      if (!opts.track && !opts.getTrack && opts.type === CallStreamType.Audio) {
        const _stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: {
              ideal: this.config.audioInput,
            },
            googAutoGainControl: this.config.voiceRtcGain,
            googExperimentalAutoGainControl: this.config.voiceRtcGain,
            googEchoCancellation: this.config.voiceRtcEcho,
            googExperimentalEchoCancellation: this.config.voiceRtcEcho,
            googNoiseSuppression:
              !this.config.voiceRnnoise && this.config.voiceRtcNoise,
            googExperimentalNoiseSuppression:
              !this.config.voiceRnnoise && this.config.voiceRtcNoise,
          },
        } as unknown as MediaStreamConstraints);

        context = new AudioContext();
        gain = context.createGain();
        const src = context.createMediaStreamSource(_stream);
        const dest = context.createMediaStreamDestination();
        const analyser = context.createAnalyser();
        const analyserData = new Uint8Array(analyser.frequencyBinCount);
        let closeTimeout: number;

        await context.audioWorklet.addModule(getWorkerUrl(RnnoiseWorker));
        const worklet = new AudioWorkletNode(context, "rnnoise-processor", {
          processorOptions: {
            wasm: this.config.voiceRnnoise
              ? new Uint8Array(
                  (
                    await axios.get(RnnoiseWasm, {
                      responseType: "arraybuffer",
                    })
                  ).data,
                )
              : undefined,
          },
        });

        worklet.port.onmessage = () => {
          analyser.getByteFrequencyData(analyserData);

          if (
            stream &&
            // analyserData.reduce((a, b) => a + b) / analyserData.length >
            analyserData.reduce((a, b) => Math.max(a, b)) >
              (this.config.audioInputTrigger / 100) * 255
          ) {
            if (!stream.speaking && gain) {
              stream.speaking = true;
              gain.gain.value = store.config.audioInputGain / 100;
            }

            clearTimeout(closeTimeout);
            closeTimeout = +setTimeout(() => {
              if (stream && stream.speaking && gain) {
                stream.speaking = false;
                gain.gain.value = 0;
              }
            }, 200);
          }
        };

        gain.gain.value = 0;

        src.connect(worklet);
        worklet.connect(analyser);
        worklet.connect(gain);
        gain.connect(dest);

        opts.track = dest.stream.getTracks()[0];
      }

      if (!opts.track && !opts.getTrack && opts.type === CallStreamType.Video) {
        const [height, frameRate] = this.config.videoMode.split("p");

        opts.track = (
          await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: this.config.videoInput,
              height: +height,
              frameRate: +frameRate,
            },
          })
        ).getTracks()[0];
      }

      if (
        !opts.track &&
        !opts.getTrack &&
        opts.type === CallStreamType.DisplayVideo
      ) {
        const height = +this.config.videoMode.split("p")[0];
        const fps = +this.config.videoMode.split("p")[1];
        const width = {
          360: 640,
          480: 854,
          720: 1280,
          900: 1600,
          1080: 1920,
        }[height];

        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width,
            height,
            frameRate: fps,
          },
          audio: {
            autoGainControl: false,
            echoCancellation: false,
            noiseSuppression: false,
          } as unknown as MediaTrackConstraints, // TS is stupid here and complains.
        });

        for (const track of stream.getTracks()) {
          await this.callAddLocalStream({
            type:
              track.kind === "video"
                ? CallStreamType.DisplayVideo
                : CallStreamType.DisplayAudio,
            track,
            silent: track.kind !== "video",
          });
        }
      }

      if (!opts.track && !opts.getTrack && !opts.procOverride) {
        console.warn("callAddLocalStream missing track");
        return;
      }

      const channel = this.channels.find(
        (channel) => channel.id === this.call?.channelId,
      );

      if (!channel) {
        return;
      }

      let decoderConfig = "";
      let lastWidth = 0;
      let lastHeight = 0;

      const submit = (val: Uint8Array | EncodedMediaChunk) => {
        let data: Uint8Array | null = null;
        let chunk: EncodedMediaChunk | null = null;

        if (val instanceof Uint8Array) {
          data = val;
        }

        if (
          val instanceof EncodedVideoChunk ||
          val instanceof EncodedAudioChunk
        ) {
          chunk = val as EncodedMediaChunk;
          data = new Uint8Array(val.byteLength);
          val.copyTo(data);
        }

        if (!data || !stream) {
          return;
        }

        for (const peer of stream.peers) {
          if (peer.dc.readyState !== "open" || !peer.enabled) {
            continue;
          }

          try {
            for (let i = 0; i < data.length; i += RTCMaxMessageSize) {
              peer.dc.send(
                new Uint8Array(
                  data.buffer,
                  i,
                  Math.min(RTCMaxMessageSize, data.length - i),
                ),
              );
            }

            peer.dc.send(
              JSON.stringify({
                type: chunk?.type,
                timestamp: chunk?.timestamp,
                duration: chunk?.duration,
                decoderConfig,
                speaking: stream.speaking,
              }),
            );
          } catch {
            //
          }
        }
      };

      const proc = async (val: MediaData) => {
        if (!stream || !encoder) {
          return;
        }

        if (encoder.encodeQueueSize > 3 || encoder.state === "closed") {
          console.debug("dropping frame @ encoder");
          val.close();
          return;
        }

        if (
          val instanceof AudioData &&
          (encoder.state === "unconfigured" || stream.requestInit)
        ) {
          let sampleRate = 48000;
          let numberOfChannels = 2;

          if (stream.track) {
            const settings = stream.track.getSettings() as {
              sampleRate: number;
              channelCount: number;
            };

            sampleRate = settings.sampleRate;
            numberOfChannels = settings.channelCount;
          }

          encoder.configure({
            codec: "opus",
            bitrate: 160e3,
            sampleRate,
            numberOfChannels,
          });
        }

        if (
          val instanceof VideoFrame &&
          (encoder.state === "unconfigured" ||
            stream.requestInit ||
            lastWidth !== val.codedWidth ||
            lastHeight !== val.codedHeight)
        ) {
          const maxScaledHeight = +this.config.videoMode.split("p")[0];
          const maxScaledWidth =
            {
              360: 640,
              480: 854,
              720: 1280,
              1080: 1920,
            }[maxScaledHeight] || maxScaledHeight;
          const maxFps = +this.config.videoMode.split("p")[1];

          let scaledWidth = val.codedWidth;
          let scaledHeight = val.codedHeight;

          if (scaledWidth > maxScaledWidth) {
            scaledHeight = Math.floor(
              scaledHeight * (maxScaledWidth / scaledWidth),
            );
            scaledWidth = maxScaledWidth;
          }

          if (scaledHeight > maxScaledHeight) {
            scaledWidth = Math.floor(
              scaledWidth * (maxScaledHeight / scaledHeight),
            );
            scaledHeight = maxScaledHeight;
          }

          const maxBitrate =
            {
              ["480p30"]: 3000000,
              ["480p60"]: 3000000,
              ["720p30"]: 3000000,
              ["720p60"]: 4500000,
              ["1080p30"]: 4500000,
              ["1080p60"]: 6000000,
            }[store.config.videoMode] || 4500000;

          let bitrate = store.config.videoQuality;
          if (
            bitrate &&
            stream.peers.filter((peer) => peer.enabled).length &&
            store.call
          ) {
            bitrate /= stream.peers.filter((peer) => peer.enabled).length;
            bitrate /= store.call.localStreams.filter((stream) =>
              [CallStreamType.Video, CallStreamType.DisplayVideo].includes(
                stream.type,
              ),
            ).length;
            bitrate = Math.floor(bitrate);
            bitrate = Math.min(bitrate, maxBitrate);
          } else {
            bitrate = maxBitrate;
          }

          encoder.configure({
            codec: "avc1.42001f",
            width: Math.floor(scaledWidth / 2) * 2,
            height: Math.floor(scaledHeight / 2) * 2,
            framerate: 1,
            latencyMode: "realtime",
            hardwareAcceleration: "prefer-hardware",
            bitrate: bitrate / maxFps,
            bitrateMode: "constant",
            avc: {
              format: "annexb",
            },
          });

          lastWidth = val.codedWidth;
          lastHeight = val.codedHeight;
        }

        try {
          encoder.encode(val, {
            keyFrame: stream.requestInit || stream.requestKeyFrame,
          });

          if (stream.requestInit) {
            stream.requestInit = false;
          }

          if (stream.requestKeyFrame) {
            stream.requestKeyFrame = false;
          }
        } catch (e) {
          //
        }

        val.close();
      };

      const encoderInit = {
        output(chunk: EncodedMediaChunk, info: MediaEncoderOutputInfo) {
          if (!stream) {
            return;
          }

          if (info.decoderConfig) {
            decoderConfig = JSON.stringify({
              ...info.decoderConfig,
              description:
                info.decoderConfig.description &&
                sodium.to_base64(
                  new Uint8Array(info.decoderConfig.description),
                ),
            });
          }

          submit(chunk);
        },
        error() {
          //
        },
      };

      let encoder: MediaEncoder | null = null;

      if (
        !opts.submitOverride &&
        [CallStreamType.Audio, CallStreamType.DisplayAudio].includes(opts.type)
      ) {
        encoder = new AudioEncoder(encoderInit);
      }

      if (
        !opts.submitOverride &&
        [CallStreamType.Video, CallStreamType.DisplayVideo].includes(opts.type)
      ) {
        encoder = new VideoEncoder(
          encoderInit as VideoEncoderInit,
        ) as MediaEncoder;
      }

      stream =
        this.call.localStreams[
          this.call.localStreams.push({
            type: opts.type,
            track: opts.track || null,
            getTrack: opts.getTrack || null,
            peers: [],
            encoder,
            context,
            gain,
            requestKeyFrame: false,
            requestInit: false,
            speaking: false,
            proc,
            submit,
          }) - 1
        ]; // keeps things reactive.

      if (!opts.silent) {
        playSound(SoundNavigateForward);
      }

      await callUpdatePersist();

      for (const state of this.voiceStates.filter(
        (state) => state.channelId === channel.id,
      )) {
        await this.callAddLocalStreamPeer(stream, state.id);
      }

      if (opts.track) {
        opts.track.addEventListener("ended", async () => {
          if (!stream) {
            return;
          }

          await this.callRemoveLocalStream({
            type: stream.type,
          });
        });
      }

      if (!opts.procOverride && !opts.submitOverride) {
        // allows us to return and throw this somewhere else on the event loop.
        (async () => {
          const reader = new MediaStreamTrackProcessor({
            track: opts.track as MediaStreamTrack,
          }).readable.getReader();

          for (;;) {
            const { value } = await reader.read();

            if (!value) {
              break;
            }

            proc(value);
          }
        })();
      }

      return stream;
    },
    async callRemoveLocalStream(opts: {
      type: CallStreamType;
      silent?: boolean;
    }): Promise<void> {
      if (!this.call) {
        console.warn("callRemoveLocalStream missing call");
        return;
      }

      const stream = this.call.localStreams.find(
        (stream) => stream.type === opts.type,
      );

      if (!stream) {
        console.warn("callRemoveLocalStream missing stream");
        return;
      }

      this.call.localStreams = this.call.localStreams.filter(
        (stream2) => stream2 !== stream,
      );

      if (stream.track) {
        stream.track.stop();
      }

      if (stream.encoder && stream.encoder.state !== "closed") {
        stream.encoder.close();
      }

      if (stream.context) {
        stream.context.close();
      }

      for (const { pc } of stream.peers) {
        pc.close();
      }

      if (opts.type === CallStreamType.DisplayVideo) {
        window.HyalusDesktop?.win32?.stopCapture();
      }

      if (
        opts.type === CallStreamType.DisplayVideo &&
        this.call?.localStreams.find(
          (stream) => stream.type === CallStreamType.DisplayAudio,
        )
      ) {
        await this.callRemoveLocalStream({
          type: CallStreamType.DisplayAudio,
          silent: true,
        });
      }

      if (!opts.silent) {
        playSound(SoundNavigateBackward);
      }

      await callUpdatePersist();
    },
    async callStart(channelId: string): Promise<void> {
      this.call = {
        channelId,
        localStreams: [],
        remoteStreams: [],
        start: new Date(),
        deaf: false,
        updatePersistInterval: +setInterval(callUpdatePersist, 1000 * 30),
      };

      this.socket?.send({
        t: SocketMessageType.CCallStart,
        d: {
          channelId,
        },
      });

      playSound(SoundStateUp);

      await callUpdatePersist();
    },
    async callReset(): Promise<void> {
      if (this.call) {
        clearInterval(this.call.updatePersistInterval);

        for (const stream of this.call.localStreams) {
          await this.callRemoveLocalStream({
            type: stream.type,
            silent: true,
          });
        }

        for (const stream of this.call.remoteStreams) {
          stream.pc.close();
        }

        this.call = null;
        await callUpdatePersist();

        playSound(SoundStateDown);
      }

      if (this.socket) {
        this.socket.send({
          t: SocketMessageType.CCallStop,
        });
      }
    },
    async callSetDeaf(val: boolean) {
      if (!this.call) {
        return;
      }

      for (const stream of this.call.remoteStreams) {
        if (!stream.element) {
          continue;
        }

        stream.element.volume = val ? 0 : 1;
      }

      this.call.deaf = val;

      playSound(val ? SoundNavigateBackwardMin : SoundNavigateForwardMin);
    },
    async resetKeybinds() {
      window.HyalusDesktop?.resetKeybinds();
    },
    async setKeybinds() {
      window.HyalusDesktop?.setKeybinds([
        ...(store.config.toggleMuteKeys
          ? [
              {
                keys: store.config.toggleMuteKeys,
                async cb() {
                  if (!store.call) {
                    return;
                  }

                  if (
                    store.call.localStreams.find(
                      (stream) => stream.type === CallStreamType.Audio,
                    )
                  ) {
                    await store.callRemoveLocalStream({
                      type: CallStreamType.Audio,
                    });
                  } else {
                    await store.callAddLocalStream({
                      type: CallStreamType.Audio,
                    });

                    if (store.call.deaf) {
                      await store.callSetDeaf(false);
                    }
                  }
                },
              },
            ]
          : []),
        ...(store.config.toggleDeafenKeys
          ? [
              {
                keys: store.config.toggleDeafenKeys,
                async cb() {
                  if (!store.call) {
                    return;
                  }

                  if (
                    !store.call.deaf &&
                    store.call.localStreams.find(
                      (stream) => stream.type === CallStreamType.Audio,
                    )
                  ) {
                    await store.callRemoveLocalStream({
                      type: CallStreamType.Audio,
                      silent: true,
                    });
                  }

                  await store.callSetDeaf(!store.call.deaf);
                },
              },
            ]
          : []),
      ]);
    },
  },
});

export const pinia = createPinia();

export const store = useStore(pinia);
