import MarkdownIt from "markdown-it";
import MarkdownItEmoji from "markdown-it-emoji";
import MarkdownItLinkAttr from "markdown-it-link-attributes";
import highlight from "highlight.js";
import type Renderer from "markdown-it/lib/renderer";
import type { IExperiment } from "./types";

export const MaxFileSize = 1024 * 1024 * 50;
export const MaxFileChunkSize = 1024 * 256;

export const iceServers = [
  {
    urls: ["stun:stun.l.google.com:19302"],
  },
];

export const messageFormatter = new MarkdownIt("zero", {
  html: false,
  linkify: true,
  highlight(str, lang) {
    if (lang && highlight.getLanguage(lang)) {
      try {
        return highlight.highlight(str, {
          language: lang,
          ignoreIllegals: true,
        }).value;
      } catch {
        //
      }
    }

    return "";
  },
})
  .enable(["emphasis", "strikethrough", "backticks", "fence", "linkify", "block", "escape"])
  .use(MarkdownItEmoji)
  .use(MarkdownItLinkAttr, {
    attrs: {
      target: "_blank",
      rel: "noopener noreferrer",
      class: "underline font-medium",
    },
  })
  .use((md) => {
    const renderEm: Renderer.RenderRule = (tokens, idx, opts, _, self) => {
      const token = tokens[idx];
      if (token.markup === "__") {
        token.tag = "u";
      }
      return self.renderToken(tokens, idx, opts);
    };

    md.renderer.rules.strong_open = renderEm;
    md.renderer.rules.strong_close = renderEm;
  });

export const availableExperiments: IExperiment[] = [
  {
    id: "force_audio_codec",
    default: "opus",
    options: ["opus"],
  },
  {
    id: "force_video_codec",
    default: "h264",
    // options: ["h264", "vp8", "vp9"],
    options: ["h264"],
  },
  {
    id: "enable_wgc_screen_capture",
    default: "off",
    options: ["off", "on"],
  },
  {
    id: "enable_wgc_window_capture",
    default: "off",
    options: ["off", "on"],
  },
  {
    id: "enable_wgc_zero_hz",
    default: "on",
    options: ["off", "on"],
  },
  {
    id: "win32_enable_segment_heap",
    default: "off",
    options: ["off", "on"],
  },
  {
    id: "linux_enable_vaapi",
    default: "on",
    options: ["off", "on"],
  },
  {
    id: "mf_d3d11_video_capture",
    default: "on",
    options: ["off", "on"],
  },
  {
    id: "mf_d3d11_video_capture_zero_copy",
    default: "on",
    options: ["off", "on"],
  },
  {
    id: "platform_hevc_decoder",
    default: "on",
    options: ["off", "on"],
  },
  {
    id: "platform_hevc_encoder",
    default: "on",
    options: ["off", "on"],
  },
  {
    id: "disable_background_throttling",
    default: "off",
    options: ["off", "on"],
  },
];
