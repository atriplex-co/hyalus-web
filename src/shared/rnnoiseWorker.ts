interface RnnoiseExports {
  malloc(n: number): number;
  free(n: number): number;
  rnnoise_create(): number;
  rnnoise_process_frame(pState: number, pIn: number, pOut: number): number;
  memory: WebAssembly.Memory;
}

registerProcessor(
  "rnnoise-processor",
  class extends AudioWorkletProcessor {
    wasmEnabled = false;
    wasmState?: {
      i: number;
      pState: number;
      pData: number;
      inputBuffer: number[];
      outputBuffer: number[];
      heap: Float32Array;
      exports: RnnoiseExports;
    };

    constructor(init: AudioWorkletProcessorInit) {
      super(init);

      if (init.processorOptions.wasm) {
        this.wasmEnabled = true;
        (async () => {
          const { instance } = await WebAssembly.instantiate(
            init.processorOptions.wasm as Uint8Array,
          );

          const exports = instance.exports as unknown as RnnoiseExports;

          this.wasmState = {
            i: 0,
            pState: exports.rnnoise_create(),
            pData: exports.malloc(480 * 4),
            inputBuffer: [],
            outputBuffer: [],
            heap: new Float32Array(exports.memory.buffer),
            exports,
          };
        })();
      }
    }

    process([inputs]: Float32Array[][], [outputs]: Float32Array[][]) {
      if (!this.wasmState && !this.wasmEnabled) {
        outputs[0].set(inputs[0]);
        outputs[1].set(inputs[1]);
        this.port.postMessage(0);
      }

      if (!this.wasmState) {
        return true;
      }

      for (let i = 0; i < 128; ++i) {
        this.wasmState.inputBuffer.push(inputs[0][i]);
      }

      while (this.wasmState.inputBuffer.length >= 480) {
        for (let i = 0; i < 480; ++i) {
          this.wasmState.heap[(this.wasmState.pData >> 2) + i] =
            this.wasmState.inputBuffer[i] * 0x7fff;
        }
        this.wasmState.inputBuffer = this.wasmState.inputBuffer.slice(480);

        const ret = this.wasmState.exports.rnnoise_process_frame(
          this.wasmState.pState,
          this.wasmState.pData,
          this.wasmState.pData,
        );

        if (ret > 0.8) {
          this.port.postMessage(0);
        }

        for (let i = 0; i < 480; i++) {
          this.wasmState.outputBuffer.push(
            this.wasmState.heap[(this.wasmState.pData >> 2) + i] / 0x7fff,
          );
        }
      }

      if (this.wasmState.outputBuffer.length > 128) {
        outputs[0].set(this.wasmState.outputBuffer.slice(0, 128));
        outputs[1].set(this.wasmState.outputBuffer.slice(0, 128));
        this.wasmState.outputBuffer = this.wasmState.outputBuffer.slice(128);
      }

      return true;
    }
  },
);
