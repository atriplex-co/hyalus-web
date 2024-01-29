const IV_SIZE = 12;

const state = {
  localKeys: new Map<number, CryptoKey>(),
  localKeyId: 0,
  remoteKeys: new Map<string, CryptoKey>(),
  remoteUserId: "",
  speaking: false,
  speakingTimeout: 0,
};

const updateSpeaking = () => {
  self.postMessage({
    t: "set_speaking",
    d: {
      speaking: state.speaking,
    },
  });
};

const encryptChunk: TransformerTransformCallback<
  RTCEncodedVideoFrame | RTCEncodedAudioFrame,
  RTCEncodedVideoFrame | RTCEncodedAudioFrame
> = async (chunk, controller) => {
  try {
    if (chunk instanceof RTCEncodedAudioFrame && chunk.data.byteLength <= 3) {
      return;
    }

    const key = state.localKeys.get(state.localKeyId);
    if (!key) {
      return console.warn("voice_crypto_enc: missing key");
    }

    const iv = new Uint8Array(IV_SIZE);
    crypto.getRandomValues(iv);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      new Uint8Array(chunk.data),
    );
    const data = new Uint8Array(encrypted.byteLength + 2 + IV_SIZE);
    data.set(new Uint8Array([state.localKeyId, 0]), 0);
    data.set(new Uint8Array(iv), 2);
    data.set(new Uint8Array(encrypted), 2 + IV_SIZE);
    chunk.data = data.buffer;

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
    const key = state.remoteKeys.get(`${state.remoteUserId}:${_data[0]}`);
    if (!key) {
      return console.warn(`voice_crypto_dec: missing key for ${state.remoteUserId}:${_data[0]}`);
    }
    const data = new Uint8Array(
      await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: new Uint8Array(chunk.data, 2, IV_SIZE),
        },
        key,
        new Uint8Array(chunk.data, 2 + IV_SIZE),
      ),
    );
    chunk.data = data.buffer;

    if (chunk instanceof RTCEncodedAudioFrame && data.length > 3) {
      if (!state.speaking) {
        state.speaking = true;
        updateSpeaking();
      }

      clearTimeout(state.speakingTimeout);
      state.speakingTimeout = +setTimeout(() => {
        state.speaking = false;
        updateSpeaking();
      }, 100);
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
