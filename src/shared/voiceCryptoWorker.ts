const IV_SIZE = 12;
const H264_NALU_SKIP = 1;

const getNaluOffsets = (data: Uint8Array) => {
  const offsets = [];
  let zc = 0;
  for (let i = 0; i < data.length; ++i) {
    if (data[i] === 1 && zc >= 2) {
      zc = 0;
      offsets.push(i + 1);
    }
    if (data[i] === 0) {
      zc++;
    } else {
      zc = 0;
    }
  }
  return offsets;
};

const packNalu = (data: Uint8Array) => {
  let zc = 0;
  const offsets = [];
  for (let i = 0; i < data.length; ++i) {
    if (zc >= 2 && [0x00, 0x01, 0x02, 0x03].includes(data[i])) {
      offsets.push(i);
      zc = 0;
    }

    if (data[i] == 0) {
      zc++;
    } else {
      zc = 0;
    }
  }
  if (!offsets.length) {
    return data;
  }
  const data2 = new Uint8Array(data.length + offsets.length);
  let data2Pos = 0;
  for (let i = 0; i < data.length; ++i) {
    if (offsets.includes(i)) {
      data2[data2Pos++] = 0x03;
    }
    data2[data2Pos++] = data[i];
  }
  return data2;
};

const unpackNalu = (data: Uint8Array) => {
  let zc = 0;
  const offsets = [];
  for (let i = 0; i < data.length; ++i) {
    if (zc >= 2 && data[i] === 0x03 && [0x00, 0x01, 0x02, 0x03].includes(data[i + 1])) {
      offsets.push(i);
    }

    if (data[i] === 0) {
      zc++;
    } else {
      zc = 0;
    }
  }
  if (!offsets.length) {
    return data;
  }
  const data2 = new Uint8Array(data.length - offsets.length);
  let data2Pos = 0;
  for (let i = 0; i < data.length; ++i) {
    if (!offsets.includes(i)) {
      data2[data2Pos++] = data[i];
    }
  }
  return data2;
};

// (for AV1 support later)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const readLEB128 = (data: Uint8Array, offset: number) => {
  let ret = 0;
  let shift = 0;
  for (let i = offset; i < data.length; ++i) {
    ret |= (data[i] & 0x7f) << shift;
    if (!(data[i] & 0x80)) {
      break;
    }
    shift += 7;
  }
  return ret;
};

const state = {
  payloadCodecs: {} as Record<string, string>,
  localKeys: new Map<number, CryptoKey>(),
  localKeyId: 0,
  remoteKeys: new Map<string, CryptoKey>(),
  remoteUserId: "",
  speaking: false,
};

const encryptChunk: TransformerTransformCallback<
  RTCEncodedVideoFrame | RTCEncodedAudioFrame,
  RTCEncodedVideoFrame | RTCEncodedAudioFrame
> = async (chunk, controller) => {
  try {
    const _data = new Uint8Array(chunk.data);
    chunk.data = new ArrayBuffer(0); // prevent leaking frames for unsupported codecs
    const codec = state.payloadCodecs[chunk.getMetadata().payloadType];
    if (!codec) {
      return console.warn("voice_crypto_enc: missing codec");
    }
    const key = state.localKeys.get(state.localKeyId);
    if (!key) {
      console.log(state);
      return console.warn("voice_crypto_enc: missing key");
    }

    if (["opus", "vp8", "vp9"].includes(codec)) {
      let skip = 0;
      if (codec === "opus" && _data.length === 3) {
        // return; // opus frame (silent)
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
        key,
        new Uint8Array(_data.buffer, skip),
      );
      const data = new Uint8Array(skip + encrypted.byteLength + 2 + IV_SIZE);
      data.set(new Uint8Array(_data.buffer, 0, skip), 0);
      data.set(new Uint8Array([state.localKeyId, 0]), skip);
      data.set(new Uint8Array(iv), skip + 2);
      data.set(new Uint8Array(encrypted), skip + 2 + IV_SIZE);
      chunk.data = data.buffer;
    }

    if (codec === "h264") {
      const offsets = getNaluOffsets(_data);
      const packedNalus: Uint8Array[] = [];
      for (let i = 0; i < offsets.length; ++i) {
        const offset = offsets[i];
        const length = (offsets[i + 1] - 4 || _data.length) - offsets[i];
        const nalu = new Uint8Array(_data.buffer, offset, length);
        const naluType = nalu[0] & 0x1f;
        if ([7, 8].includes(naluType)) {
          packedNalus.push(nalu); // skip encrypting SPS & PPS NALUs (no video data)
          continue;
        }
        const iv = new Uint8Array(IV_SIZE);
        crypto.getRandomValues(iv);
        const encrypted = await crypto.subtle.encrypt(
          {
            name: "AES-GCM",
            iv,
          },
          key,
          new Uint8Array(
            nalu.buffer,
            nalu.byteOffset + H264_NALU_SKIP,
            nalu.byteLength - H264_NALU_SKIP,
          ),
        );
        const naluOut = new Uint8Array(H264_NALU_SKIP + 2 + IV_SIZE + encrypted.byteLength);
        let naluOutPos = 0;
        naluOut.set(new Uint8Array(nalu.buffer, nalu.byteOffset, H264_NALU_SKIP), naluOutPos);
        naluOutPos += H264_NALU_SKIP;
        naluOut.set(new Uint8Array([state.localKeyId, 0]), naluOutPos);
        naluOutPos += 2;
        naluOut.set(iv, naluOutPos);
        naluOutPos += IV_SIZE;
        naluOut.set(new Uint8Array(encrypted), naluOutPos);
        naluOutPos += encrypted.byteLength;
        packedNalus.push(packNalu(naluOut));
      }
      const data = new Uint8Array(
        packedNalus.length * 4 + packedNalus.map((nalu) => nalu.length).reduce((a, b) => a + b, 0),
      );
      let dataPos = 0;
      for (const nalu of packedNalus) {
        data.set(new Uint8Array([0x00, 0x00, 0x00, 0x01]), dataPos);
        dataPos += 4;
        data.set(nalu, dataPos);
        dataPos += nalu.length;
      }
      chunk.data = data.buffer;
    }

    if (codec === "av1") {
      // TODO: add AV1 encryption support
    }

    controller.enqueue(chunk);
  } catch (e) {
    console.warn("error encrypting frame");
    console.warn(e);
  }
};

const decryptChunk: TransformerTransformCallback<
  RTCEncodedVideoFrame | RTCEncodedAudioFrame,
  RTCEncodedVideoFrame | RTCEncodedAudioFrame
> = async (chunk, controller) => {
  try {
    const _data = new Uint8Array(chunk.data);
    const codec = state.payloadCodecs[chunk.getMetadata().payloadType];
    if (!codec) {
      return console.warn("voice_crypto_dec: missing codec");
    }

    if (["vp8", "vp9", "opus"].includes(codec)) {
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
      const key = state.remoteKeys.get(`${state.remoteUserId}:${_data[skip + 0]}`);
      if (!key) {
        return console.warn(
          `voice_crypto_dec: missing key for ${state.remoteUserId}:${_data[skip + 0]}`,
        );
      }
      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: new Uint8Array(chunk.data, skip + 2, IV_SIZE),
        },
        key,
        new Uint8Array(chunk.data, skip + 2 + IV_SIZE),
      );
      const data = new Uint8Array(decrypted.byteLength + skip);
      data.set(new Uint8Array(chunk.data, 0, skip), 0);
      data.set(new Uint8Array(decrypted), skip);
      chunk.data = data.buffer;
      // if (stream.speaking !== !!_data[skip + 1]) {
      //   stream.speaking = !!_data[skip + 1];
      // }
      if (codec === "opus") {
        const speaking = data.length > 3;
        if (state.speaking !== speaking) {
          state.speaking = speaking;
          self.postMessage({
            t: "set_speaking",
            d: {
              speaking: state.speaking,
            },
          });
        }
      }
    }

    if (codec === "h264") {
      const offsets = getNaluOffsets(_data);
      const unpackedNalus: Uint8Array[] = [];
      for (let i = 0; i < offsets.length; ++i) {
        const offset = offsets[i];
        const length = (offsets[i + 1] - 4 || _data.length) - offsets[i];
        const nalu = new Uint8Array(_data.buffer, offset, length);
        const naluType = nalu[0] & 0x1f;
        if ([7, 8].includes(naluType)) {
          unpackedNalus.push(nalu);
          continue;
        }
        const unpackedNalu = unpackNalu(nalu);
        const key = state.remoteKeys.get(
          `${state.remoteUserId}:${unpackedNalu[H264_NALU_SKIP + 0]}`,
        );
        if (!key) {
          return console.warn(
            `voice_crypto_dec: missing key for ${state.remoteUserId}:${
              unpackedNalu[H264_NALU_SKIP + 0]
            }`,
          );
        }
        const decrypted = await crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: new Uint8Array(
              unpackedNalu.buffer,
              unpackedNalu.byteOffset + H264_NALU_SKIP + 2,
              IV_SIZE,
            ),
          },
          key,
          new Uint8Array(
            unpackedNalu.buffer,
            unpackedNalu.byteOffset + H264_NALU_SKIP + 2 + IV_SIZE,
            unpackedNalu.byteLength - (H264_NALU_SKIP + 2 + IV_SIZE),
          ),
        );
        const unpackedNaluOut = new Uint8Array(H264_NALU_SKIP + decrypted.byteLength);
        unpackedNaluOut.set(
          new Uint8Array(unpackedNalu.buffer, unpackedNalu.byteOffset, H264_NALU_SKIP),
          0,
        );
        unpackedNaluOut.set(new Uint8Array(decrypted), H264_NALU_SKIP);
        unpackedNalus.push(unpackedNaluOut);
      }
      const data = new Uint8Array(
        unpackedNalus.length * 4 +
          unpackedNalus.map((nalu) => nalu.length).reduce((a, b) => a + b, 0),
      );
      let dataPos = 0;
      for (const nalu of unpackedNalus) {
        data.set(new Uint8Array([0x00, 0x00, 0x00, 0x01]), dataPos);
        dataPos += 4;
        data.set(nalu, dataPos);
        dataPos += nalu.length;
      }
      chunk.data = data.buffer;
    }

    if (codec === "av1") {
      // TODO: add AV1 decryption support
    }

    controller.enqueue(chunk);
  } catch (e) {
    console.warn("error decrypting frame");
    console.warn(e);
  }
};

self.onmessage = async (e) => {
  if (e.data.t === "init_encrypt") {
    e.data.d.readable
      .pipeThrough(
        new TransformStream({
          transform: encryptChunk,
        }),
      )
      .pipeTo(e.data.d.writable);
  }

  if (e.data.t === "init_decrypt") {
    e.data.d.readable
      .pipeThrough(
        new TransformStream({
          transform: decryptChunk,
        }),
      )
      .pipeTo(e.data.d.writable);
  }

  if (e.data.t === "set_payload_codecs") {
    state.payloadCodecs = e.data.d.payloadCodecs;
  }

  if (e.data.t === "set_local_key") {
    state.localKeys.set(e.data.d.id, e.data.d.key);
  }

  if (e.data.t === "set_local_key_id") {
    state.localKeyId = e.data.d.localKeyId;
  }

  if (e.data.t === "set_remote_key") {
    state.remoteKeys.set(e.data.d.id, e.data.d.key);
  }

  if (e.data.t === "set_remote_user_id") {
    state.remoteUserId = e.data.d.remoteUserId;
  }
};
