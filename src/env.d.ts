/// <reference types="vite/client" />
/// <reference types="emscripten" />

// Vite

declare module "*.vue" {
  import { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// App stuff

declare interface IHyalusDesktopStartupSettings {
  enabled: boolean;
  minimized: boolean;
}

declare interface IHyalusDesktop {
  close(): void;
  maximize(): void;
  minimize(): void;
  restart(): void;
  quit(): void;
  getSources(): Promise<
    {
      id: string;
      name: string;
      thumbnail: string;
      appIcon?: string;
    }[]
  >;
  osPlatform: string;
  osRelease: string;
  getStartupSettings(): Promise<IHyalusDesktopStartupSettings>;
  setStartupSettings(val: IHyalusDesktopStartupSettings): Promise<void>;
  resetKeybinds(): void;
  setKeybinds(
    keybinds: {
      keys: string;
      cb: () => void;
    }[],
  ): void;
  win32?: IHyalusDesktopWin32;
  checkForUpdates(): Promise<void>;
  setContentProtection(v: boolean): Promise<void>;
  setExperiments(v: Record<string, string>): Promise<void>;
  moveTop(): void;
  flushStorageData(): void;
}

declare interface IHyalusDesktopWin32 {
  startCapture(opts: HyalusWin32CaptureOpts, cb: (data?: HyalusWin32CaptureData) => void): void;
  stopCapture(): void;
  startEvents(cb: (e: string) => void): void;
  stopEvents(): void;
}

declare interface Window {
  HyalusDesktop?: IHyalusDesktop;
  IdleDetector?: typeof IdleDetector;
}

// IdleDetector support

declare class IdleDetector {
  constructor();
  static requestPermission(): Promise<string>;
  start(opts: { threshold: number; signal: AbortSignal }): Promise<void>;
  addEventListener(event: string, cb: () => void): void;
  userState: "active" | "idle";
  screenState: "unlocked" | "locked";
}

// WebCodecs support

declare interface MediaStreamTrackProcessorInit {
  track: MediaStreamTrack;
}

declare interface MediaStreamTrackGeneratorInit {
  kind: string;
}

declare interface MediaEncoderInit {
  output(frame: EncodedMediaChunk, info: MediaEncoderOutputInfo): void;
  error(): void;
}

declare interface MediaDecoderInit {
  output(frame: MediaData): void;
  error(): void;
}

declare interface MediaEncoderConfig {
  codec?: string;
  sampleRate?: number;
  numberOfChannels?: number;
  bitrate?: number;
  bitrateMode?: string;
  width?: number;
  height?: number;
  latencyMode?: string;
  hardwareAcceleration?: string;
  framerate?: number;
  avc?: {
    format?: string;
  };
}

declare interface MediaDecoderConfig {
  codec?: string;
  sampleRate?: number;
  numberOfChannels?: number;
  description?: ArrayBuffer;
  hardwareAcceleration?: string;
  optimizeForLatency?: boolean;
  avc?: {
    format?: string;
  };
}

declare interface MediaEncoderOutputInfo {
  decoderConfig?: MediaDecoderConfig;
}

declare class MediaData {
  close(): void;
  timestamp: number;
  duration: number;
  codedWidth: number;
  codedHeight: number;
}

declare class MediaEncoder {
  constructor(init: MediaEncoderInit);
  configure(config: MediaEncoderConfig): void;
  encode(frame: MediaData, opts?: MediaEncoderEncodeOpts): void;
  close(): void;
  state: string;
  encodeQueueSize: number;
}

declare class MediaDecoder {
  constructor(init: MediaDecoderInit);
  configure(config: MediaDecoderConfig): void;
  decode(chunk: EncodedMediaChunk): void;
  close(): void;
  state: string;
  decodeQueueSize: number;
}

declare class VideoFrame extends MediaData {
  constructor(data: Uint8Array, init: VideoFrameInit);
  codedWidth: number;
  codedHeight: number;
}

declare class VideoFrameInit {
  format: string;
  codedWidth: number;
  codedHeight: number;
  timestamp: number;
}

declare class AudioData extends MediaData {
  constructor(init: AudioDataInit);
}

declare interface AudioDataInit {
  format: string;
  sampleRate: number;
  numberOfFrames: number;
  numberOfChannels: number;
  timestamp: number;
  data: Uint8Array;
}

declare interface MediaEncoderEncodeOpts {
  keyFrame?: boolean;
}

declare interface EncodedMediaChunkInit {
  type: string;
  timestamp: number;
  duration: number;
  data: Uint8Array;
}

declare class MediaStreamTrackProcessor {
  constructor(init: MediaStreamTrackProcessorInit);
  readable: ReadableStream<MediaData>;
}

declare class MediaStreamTrackGenerator extends MediaStreamTrack {
  constructor(init: MediaStreamTrackGeneratorInit);
  writable: WritableStream<MediaData>;
}

declare class VideoEncoder extends MediaEncoder {}
declare class AudioEncoder extends MediaEncoder {}
declare class VideoDecoder extends MediaDecoder {}
declare class AudioDecoder extends MediaDecoder {}

declare class EncodedMediaChunk {
  constructor(init: EncodedMediaChunkInit);
  type: string;
  timestamp: number;
  duration: number;
  byteLength: number;
  copyTo(buf: Uint8Array): void;
}

declare class EncodedAudioChunk extends EncodedMediaChunk {}
declare class EncodedVideoChunk extends EncodedMediaChunk {}

// AudioWorklet support

declare interface AudioWorkletProcessorInit {
  processorOptions: {
    wasm?: Uint8Array;
  };
}

declare class AudioWorkletProcessor {
  constructor(init: AudioWorkletProcessorInit);
  port: {
    postMessage(data: unknown): void;
    onmessage: (e: { data: unknown }) => void;
  };
}

declare function registerProcessor(name: string, proc: unknown): void;

declare interface HyalusWin32CaptureOpts {
  id: string;
  video: boolean;
  videoWidth: number;
  videoHeight: number;
  videoFps: number;
  videoBitrate: number;
  audio: boolean;
}

declare interface HyalusWin32CaptureData {
  t: string;
  d: {
    channels: number;
    sampleSize: number;
    sampleRate: number;
    frames: number;
    timestamp: number;
    data: ArrayBuffer;
  };
}

declare interface RTCConfiguration extends RTCConfiguration {
  encodedInsertableStreams?: boolean;
}

declare interface RTCRtpSender extends RTCRtpSender {
  createEncodedStreams(): {
    readable: ReadableStream<RTCEncodedAudioFrame | RTCEncodedVideoFrame>;
    writable: WritableStream<RTCEncodedAudioFrame | RTCEncodedVideoFrame>;
  };
}

declare interface RTCRtpReceiver extends RTCRtpSender {
  createEncodedStreams(): {
    readable: ReadableStream<RTCEncodedAudioFrame | RTCEncodedVideoFrame>;
    writable: WritableStream<RTCEncodedAudioFrame | RTCEncodedVideoFrame>;
  };
}

declare interface RTCEncodedVideoFrameMetadata extends RTCEncodedVideoFrameMetadata {
  payloadType: number;
}

declare interface RTCEncodedAudioFrameMetadata extends RTCEncodedAudioFrameMetadata {
  payloadType: number;
}
