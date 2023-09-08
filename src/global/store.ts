import { idbDel, idbGet } from "./idb";
import { iceServers } from "./config";
import sodium from "libsodium-wrappers";
import {
  CallStreamType,
  ColorMode,
  ColorTheme,
  SocketMessageType,
  VoiceStateFlags,
} from "@/../../hyalus-server/src/types";
import RnnoiseWasm from "../vendor/rnnoise.wasm?url";
import RnnoiseWorker from "../shared/rnnoiseWorker?worker";
import SoundStateUp from "../assets/sounds/state-change_confirm-up.ogg";
import SoundStateDown from "../assets/sounds/state-change_confirm-down.ogg";
import SoundNavigateBackward from "../assets/sounds/navigation_backward-selection.ogg";
import SoundNavigateBackwardMin from "../assets/sounds/navigation_backward-selection-minimal.ogg";
import SoundNavigateForward from "../assets/sounds/navigation_forward-selection.ogg";
import SoundNavigateForwardMin from "../assets/sounds/navigation_forward-selection-minimal.ogg";
import {
  type ICallLocalStream,
  type IConfig,
  type IState,
  SideBarState,
  type IChannelMember,
  type ISpaceMember,
} from "./types";
import {
  callUpdatePersist,
  getUserOutputGain,
  getWorkerUrl,
  playSound,
  updateIcon,
  wcImportKey,
} from "./helpers";
import { Socket } from "./socket";
import { createPinia, defineStore } from "pinia";
import axios from "axios";
import msgpack from "msgpack-lite";
import { watch } from "vue";

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
        streamerModeEnabled: false,
        streamerModeAuto: true,
        streamerModeHideWindow: true,
        streamerModeHideAccount: true,
        streamerModeHideInviteLinks: true,
        streamerModeDisableNotifications: true,
        streamerModeDisableSounds: true,
        recentChannelIds: [],
        experimentsEnabled: false,
        experiments: {},
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
      quickSwitcherOpen: false,
      cachedUsers: new Map(),
      userStatuses: new Map(),
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
            ...(msgpack.decode(sodium.from_base64(localStorage.config)) as IConfig),
          };
        } catch (e) {
          console.warn(e);
          console.warn("error loading config");
        }
      }

      if (this.config.streamerModeAuto && this.config.streamerModeEnabled) {
        await this.writeConfig("streamerModeEnabled", false);
      }

      if (window.HyalusDesktop && window.HyalusDesktop.win32) {
        const updateContentProtection = async () => {
          if (this.config.streamerModeEnabled && this.config.streamerModeHideWindow) {
            await window.HyalusDesktop!.setContentProtection(true);
          } else {
            await window.HyalusDesktop!.setContentProtection(false);
          }
        };

        await updateContentProtection();
        watch(
          () => [this.config.streamerModeEnabled, this.config.streamerModeHideWindow],
          updateContentProtection,
        );

        window.HyalusDesktop.win32.startEvents((e: string) => {
          if (e === "streamer_mode_enable" && this.config.streamerModeAuto) {
            this.config.streamerModeEnabled = true;
          }

          if (e === "streamer_mode_disable" && this.config.streamerModeAuto) {
            this.config.streamerModeEnabled = false;
          }
        });
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

        const root = (await navigator.storage.getDirectory()) as FileSystemDirectoryHandle &
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
            stream.gain.gain.value = getUserOutputGain(stream.type, stream.userId);
          }
        }
      }

      if (
        ["audioInput", "voiceRtcEcho", "voiceRtcGain", "voiceRtcNoise", "voiceRnnoise"].includes(
          k,
        ) &&
        this.call &&
        this.call.localStreams.find((stream) => stream.type === CallStreamType.Audio)
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
        this.call.localStreams.find((stream) => stream.type === CallStreamType.Video)
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

      if ((k.startsWith("userGain:") || k.startsWith("userMuted:")) && this.call) {
        const stream = this.call.remoteStreams.find(
          (stream) => stream.userId === k.split(":")[1] && stream.type === +k.split(":")[2],
        );

        if (stream && stream.gain) {
          stream.gain.gain.value = getUserOutputGain(stream.type, stream.userId);
        }
      }

      if (k === "colorSync" && v) {
        await axios.post("/api/v1/users/me", {
          colorMode: store.config.colorMode,
          colorTheme: store.config.colorTheme,
        });
      }

      if (k === "experiments" && window.HyalusDesktop && window.HyalusDesktop.setExperiments) {
        window.HyalusDesktop.setExperiments(v as Record<string, string>);
      }

      return v;
    },
    async callAddLocalStream(opts: {
      type: CallStreamType;
      track?: MediaStreamTrack;
      silent?: boolean;
    }) {
      if (!this.call) {
        console.warn("callAddLocalTrack missing call");
        return;
      }

      let stream: ICallLocalStream | null = null;
      let context: AudioContext | null = null;
      let gain1: GainNode | null = null;
      let gain2: GainNode | null = null;

      if (!opts.track && opts.type === CallStreamType.Audio) {
        const _stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: {
              ideal: this.config.audioInput,
            },
            channelCount: 1,
            autoGainControl: {
              ideal: this.config.voiceRtcGain,
            },
            echoCancellation: {
              ideal: this.config.voiceRtcEcho,
            },
            noiseSuppression: {
              ideal: this.config.voiceRtcNoise && !this.config.voiceRnnoise,
            },
          },
        });

        context = new AudioContext({
          latencyHint: "interactive", // this probably improves latency or some shit.
          sampleRate: 48000,
        });
        gain1 = context.createGain(); // for audio mute
        gain2 = context.createGain(); // for audio input volume & VAD
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
            if (!stream.speaking && gain2) {
              stream.speaking = true;
              gain2.gain.value = store.config.audioInputGain / 100;
            }

            clearTimeout(closeTimeout);
            closeTimeout = +setTimeout(() => {
              if (stream && stream.speaking && gain2) {
                stream.speaking = false;
                gain2.gain.value = 0;
              }
            }, 200);
          }
        };

        gain1.gain.value = 1;
        gain2.gain.value = 0;

        src.connect(gain1);
        gain1.connect(worklet);
        worklet.connect(analyser);
        worklet.connect(gain2);
        gain2.connect(dest);

        opts.track = dest.stream.getTracks()[0];
        const _stop = opts.track.stop.bind(opts.track);
        opts.track.stop = () => {
          _stop();
          context!.close();
        };
      }

      if (!opts.track && opts.type === CallStreamType.Video) {
        const [height, frameRate] = this.config.videoMode.split("p");

        opts.track = (
          await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: {
                ideal: this.config.videoInput,
              },
              height: {
                ideal: +height,
              },
              frameRate: {
                ideal: +frameRate,
              },
            },
          })
        ).getTracks()[0];
      }

      if (!opts.track && opts.type === CallStreamType.DisplayVideo) {
        const height = +this.config.videoMode.split("p")[0];
        const fps = +this.config.videoMode.split("p")[1];
        const width = {
          360: 640,
          540: 960,
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
            channelCount: 2,
            autoGainControl: false,
            echoCancellation: false,
            noiseSuppression: false,
          },
        });

        for (const track of stream.getTracks()) {
          console.log(track);
          await this.callAddLocalStream({
            type:
              track.kind === "video" ? CallStreamType.DisplayVideo : CallStreamType.DisplayAudio,
            track,
            silent: track.kind !== "video",
          });
        }

        return; // we called this function again with the tracks, it's fine.
      }

      const channel = this.channels.find((channel) => channel.id === this.call!.channelId);
      if (!channel) {
        console.warn("callAddLocalStream: missing channel");
        return;
      }

      if (!opts.track) {
        console.warn("callAddLocalStream: missing track");
        return;
      }

      if (opts.type === CallStreamType.DisplayVideo) {
        // opts.track.contentHint = "motion";
      }

      let sender: RTCRtpSender | undefined;
      if (opts.track.kind === "audio") {
        sender = this.call.usedSenders.audio.pop();
      }
      if (opts.track.kind === "video") {
        sender = this.call.usedSenders.video.pop();
      }
      if (sender) {
        sender.replaceTrack(opts.track);
      } else {
        sender = this.call.pc.addTrack(opts.track);
      }

      stream =
        this.call.localStreams[
          this.call.localStreams.push({
            type: opts.type,
            track: opts.track || null,
            gain1,
            gain2,
            speaking: false,
            sender,
          }) - 1 // keeps things reactive, stop removing this thinking you're smart.
        ];

      if (!opts.silent) {
        playSound(SoundNavigateForward);
      }

      if (opts.type === CallStreamType.Audio) {
        this.call.muted = false;
      }

      await callUpdatePersist();
      await this.callUpdateStreams();
      await this.callUpdateFlags();

      opts.track.addEventListener("ended", async () => {
        await this.callRemoveLocalStream({
          type: stream!.type,
        });
      });
    },
    async callRemoveLocalStream(opts: { type: CallStreamType; silent?: boolean }): Promise<void> {
      if (!this.call) {
        console.warn("callRemoveLocalStream missing call");
        return;
      }

      const stream = this.call.localStreams.find((stream) => stream.type === opts.type);
      if (!stream) {
        console.warn("callRemoveLocalStream missing stream");
        return;
      }

      this.call.localStreams = this.call.localStreams.filter((stream2) => stream2 !== stream);
      stream.track.stop();
      stream.sender.replaceTrack(null);
      if (stream.track.kind === "audio") {
        this.call.usedSenders.audio.push(stream.sender);
      }
      if (stream.track.kind === "video") {
        this.call.usedSenders.video.push(stream.sender);
      }

      if (opts.type === CallStreamType.DisplayVideo) {
        window.HyalusDesktop?.win32?.stopCapture();
        // TODO: remove this and set up an event for when we shut down the track (on creating it).
      }

      if (
        opts.type === CallStreamType.DisplayVideo &&
        this.call!.localStreams.find((stream) => stream.type === CallStreamType.DisplayAudio)
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
      await this.callUpdateStreams();
      await this.callUpdateFlags();
    },
    async callStart(channelId: string): Promise<void> {
      const pc = new RTCPeerConnection({
        iceServers,
        bundlePolicy: "max-bundle",
        encodedInsertableStreams: true,
      });

      pc.onicecandidate = ({ candidate }) => {
        if (!candidate) {
          return;
        }

        this.socket!.send({
          t: SocketMessageType.CCallICECandidate,
          d: {
            candidate: candidate.candidate,
          },
        });
      };

      pc.onconnectionstatechange = () => {
        console.log(`voice: connectionState -> ${pc.connectionState}`);
        if (pc.connectionState === "disconnected") {
          pc.restartIce();
          this.socket!.send({
            t: SocketMessageType.CCallRequestRestartICE,
            d: {},
          });
        }
      };

      this.call = {
        channelId,
        start: new Date(),
        muted: true,
        mutedBeforeDeaf: false,
        deaf: false,
        updatePersistInterval: +setInterval(callUpdatePersist, 1000 * 30),
        pc,
        localKeyId: 0,
        localKeyCounter: 0,
        localKeySwapTarget: 0,
        localKeySwapTimeout: 0,
        localKeyAcks: [],
        localKeyAcksNeeded: 0,
        localKeys: new Map(),
        remoteKeys: new Map(),
        localStreams: [],
        remoteStreams: [],
        usedSenders: {
          audio: [],
          video: [],
        },
        flags: 0,
        initComplete: false,
        encryptWorkers: new Map(),
        decryptWorkers: new Map(),
      };

      this.socket!.send({
        t: SocketMessageType.CCallJoin,
        d: {
          channelId,
          audioMode: "default",
          videoMode: this.config.videoMode,
        },
      });

      playSound(SoundStateUp);

      await callUpdatePersist();
    },
    async callSetMuted(val: boolean, silent = false) {
      if (!this.call || this.call.muted === val) {
        return;
      }

      const stream = this.call.localStreams.find((stream) => stream.type === CallStreamType.Audio);

      if (!stream && !val) {
        await this.callAddLocalStream({
          type: CallStreamType.Audio,
          silent,
        });
      }

      if (stream && val) {
        stream.gain1!.gain.value = 0;
        if (!silent) {
          playSound(SoundNavigateBackward);
        }
      }

      if (stream && !val) {
        stream.gain1!.gain.value = 1;
        if (!silent) {
          playSound(SoundNavigateForward);
        }
      }

      this.call.muted = val;
      this.callUpdateFlags();
      callUpdatePersist();

      if (!val && this.call.deaf) {
        await this.callSetDeaf(false, true);
      }
    },
    async callSetDeaf(val: boolean, silent = false) {
      if (!this.call || this.call.deaf === val) {
        return;
      }

      for (const stream of this.call.remoteStreams) {
        if (stream.element) {
          stream.element.volume = val ? 0 : 1;
        }
      }

      this.call.deaf = val;
      this.callUpdateFlags();
      callUpdatePersist();
      if (!silent) {
        playSound(val ? SoundNavigateBackwardMin : SoundNavigateForwardMin);
      }

      if (val) {
        this.call.mutedBeforeDeaf = this.call.muted;
      }

      if (val && !this.call.muted) {
        await this.callSetMuted(true, true);
      }

      if (!val && !this.call.mutedBeforeDeaf && this.call.muted) {
        await this.callSetMuted(false, true);
      }
    },
    async callUpdateKeys() {
      if (!this.call) {
        return;
      }

      console.debug("voice: updating call keys");
      const id =
        this.call.localKeyCounter < 255
          ? this.call.localKeyCounter++
          : (this.call.localKeyCounter = 0);
      const _key = new Uint8Array(16); // AES-128
      crypto.getRandomValues(_key);
      const key = await wcImportKey(_key);
      this.call.localKeys.set(id, key);
      for (const worker of this.call.encryptWorkers.values()) {
        worker.postMessage({
          t: "set_local_key",
          d: {
            id,
            key,
          },
        });
      }

      const channel = store.channels.find((channel) => channel.id === this.call!.channelId);
      if (!channel) {
        return console.warn("callUpdateKeys: missing channel");
      }
      let members: IChannelMember[] | ISpaceMember[] = channel.members;
      if (channel.spaceId) {
        const space = store.spaces.find((space) => space.id === channel.spaceId);
        if (!space) {
          return console.warn("callUpdateKeys: missing space");
        }
        members = space.members;
      }
      members = members.filter((member) =>
        store.voiceStates.find((state) => state.id === member.id && state.channelId === channel.id),
      );
      members = members.filter((member) => member.id !== this.self!.id);

      this.call.localKeySwapTarget = id;
      if (!this.call.localKeyId) {
        console.debug("voice: swapping call key (no key present)");
        this.callSwapKeys();
      } else {
        clearTimeout(this.call.localKeySwapTimeout);
        this.call.localKeySwapTimeout = +setTimeout(() => {
          console.debug("voice: swapping call key (3s timeout)");
          this.callSwapKeys();
        }, 3000);
        this.call.localKeyAcks = [];
        this.call.localKeyAcksNeeded = members.length;
      }

      const boxes: Record<string, Uint8Array> = {};
      for (const member of members) {
        const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
        boxes[member.id] = new Uint8Array([
          ...nonce,
          ...sodium.crypto_box_easy(_key, nonce, member.publicKey, this.config.privateKey!),
        ]);
      }

      this.socket!.send({
        t: SocketMessageType.CCallUpdateKeys,
        d: {
          id,
          keys: sodium.to_base64(msgpack.encode(boxes)),
        },
      });
    },
    async callSwapKeys() {
      if (!this.call || this.call.localKeyId === this.call.localKeySwapTarget) {
        return;
      }
      this.call.localKeyId = this.call.localKeySwapTarget;
      for (const worker of this.call.encryptWorkers.values()) {
        worker.postMessage({
          t: "set_local_key_id",
          d: {
            localKeyId: this.call.localKeyId,
          },
        });
      }
    },
    async callUpdateStreams() {
      if (!this.call || !this.call.initComplete) {
        return; // don't update until we have received our first SCallOffer.
      }

      const streams = [];
      for (const stream of this.call.localStreams) {
        const transceiver = this.call.pc
          .getTransceivers()
          .find((trans) => trans.sender === stream.sender);
        if (!transceiver || !transceiver.mid) {
          continue;
        }
        streams.push({
          mid: transceiver.mid,
          type: stream.type,
        });
      }
      this.socket!.send({
        t: SocketMessageType.CCallUpdateStreams,
        d: {
          streams,
        },
      });
    },
    async callUpdateFlags() {
      if (!this.socket || !this.call) {
        return;
      }
      let flags = 0;
      if (this.call.muted) {
        flags |= VoiceStateFlags.Muted;
      }
      if (this.call.deaf) {
        flags |= VoiceStateFlags.Deaf;
      }
      if (this.call.localStreams.find((stream) => stream.type === CallStreamType.Video)) {
        flags |= VoiceStateFlags.VideoEnabled;
      }
      if (this.call.localStreams.find((stream) => stream.type === CallStreamType.DisplayVideo)) {
        flags |= VoiceStateFlags.DisplayEnabled;
      }
      this.call.flags = flags;
      this.socket.send({
        t: SocketMessageType.CCallUpdateFlags,
        d: {
          flags,
        },
      });
    },
    async callReset(): Promise<void> {
      if (this.socket) {
        this.socket.send({
          t: SocketMessageType.CCallLeave,
        });
      }

      if (this.call) {
        this.call.pc.close();
        for (const stream of this.call.localStreams) {
          stream.track.stop();
        }
        for (const worker of this.call.encryptWorkers.values()) {
          worker.terminate();
        }
        for (const worker of this.call.decryptWorkers.values()) {
          worker.terminate();
        }
        clearInterval(this.call.updatePersistInterval);
        this.call = null;
        await callUpdatePersist();
        playSound(SoundStateDown);
      }
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
                    store.call.localStreams.find((stream) => stream.type === CallStreamType.Audio)
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
                    store.call.localStreams.find((stream) => stream.type === CallStreamType.Audio)
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
