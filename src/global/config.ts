import MarkdownIt from "markdown-it";
import highlight from "highlight.js";
import type Renderer from "markdown-it/lib/renderer";
import type { IExperiment } from "./types";
import { emojis } from "hyalus-fluentui-emoji/dist/metadata.json";
import { b32ToUUID } from "./helpers";

export const MaxFileSize = 1024 * 1024 * 50;
export const MaxFileChunkSize = 1024 * 256;

export const iceServers = [
  {
    urls: ["stun:stun.l.google.com:19302"],
  },
];

export const MarkdownItEmojiPlugin = (md: MarkdownIt) => {
  const renderEm: Renderer.RenderRule = (tokens, idx, opts, _, self) => {
    const token = tokens[idx];
    if (token.markup === "__") {
      token.tag = "u";
    }
    return self.renderToken(tokens, idx, opts);
  };

  md.renderer.rules.strong_open = renderEm;
  md.renderer.rules.strong_close = renderEm;

  md.core.ruler.after("linkify", "emoji", (state) => {
    for (let i = state.tokens.length - 1; i >= 0; --i) {
      const token = state.tokens[i];
      if (token.type !== "inline" || !token.children) {
        continue;
      }
      for (let j = token.children.length - 1; j >= 0; --j) {
        const token2 = token.children[j];
        if (token2.type !== "text") {
          continue;
        }
        for (const emoji of emojis) {
          if (!token2.content.includes(emoji.glyph)) {
            continue; // speeds things up
          }
          token2.content = token2.content.replaceAll(emoji.glyph, `:${emoji.id}:`);
        }
        const regex = /:[a-zA-Z0-9-_]+:/g;
        let pos = 0;
        const tokens = [];
        for (;;) {
          const exec = regex.exec(token2.content);
          if (!exec) {
            break;
          }
          const before = token2.content.slice(pos, exec.index);
          if (before.length) {
            const token = new state.Token("text", "", 0);
            token.content = before;
            tokens.push(token);
          }
          const token = new state.Token("emoji", "", 0);
          token.content = exec[0];
          tokens.push(token);
          pos = exec.index + exec[0].length;
        }
        if (pos !== token2.content.length) {
          const token = new state.Token("text", "", 0);
          token.content = token2.content.slice(pos);
          tokens.push(token);
        }
        token.children.splice(j, 1, ...tokens);
      }
    }
  });

  md.renderer.rules.emoji = (tokens, idx, options, env, self) => {
    const id = tokens[idx].content.slice(1).slice(0, -1);
    const appEmoji = emojis.find((emoji) => emoji.id === id);
    if (appEmoji) {
      return `<MessageEmoji type="system" id="${id}" />`;
    }
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
      return `<MessageEmoji type="user" id="${id}" />`;
    }
    if (/^[1iIlL0o23456789aAbBcCdDeEfFhHgGjJkKmMnNpPqQrRsStTvVwWxXyYzZ]{26}$/.test(id)) {
      return `<MessageEmoji type="user" id="${b32ToUUID(id)}" />`;
    }
    // if (asset) {
    //   return `<img src="${asset}" style="width:16px;height:16px;display:inline;margin-top:-2px;margin-left:1px;margin-right:1px" alt="${alt}"/>`;
    // }
    return tokens[idx].content;
  };

  const renderLink =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    tokens[idx].attrPush(["target", "_blank"]); // add new attribute
    tokens[idx].attrPush(["rel", "noopener noreferrer"]);
    tokens[idx].attrPush(["class", "underline font-medium"]);

    // pass token to default renderer.
    return renderLink(tokens, idx, options, env, self);
  };
};

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
  .use(MarkdownItEmojiPlugin);

export const statusFormatter = new MarkdownIt("zero", {
  html: false,
})
  .enable(["emphasis", "strikethrough", "block", "escape"])
  .use(MarkdownItEmojiPlugin);

export const availableExperiments: IExperiment[] = [
  {
    id: "enable_wgc_screen_capture",
    default: "on",
    options: ["off", "on"],
  },
  {
    id: "enable_wgc_window_capture",
    default: "on",
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
  {
    id: "windows_scrolling_personality",
    default: "off",
    options: ["off", "on"],
  },
];
