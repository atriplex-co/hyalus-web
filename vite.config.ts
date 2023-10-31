import { fileURLToPath, URL } from "node:url";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { getManifest } from "workbox-build";
import fs from "node:fs";
import child_process from "node:child_process";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "prebuild",
      buildStart() {
        console.log("copying deps (prebuild)");
        child_process.execSync("rm -rf public/fluentui-emoji");
        child_process.execSync(
          "cp -ar node_modules/hyalus-fluentui-emoji/dist/assets public/fluentui-emoji",
        );
      },
    },
    vue(),
    splitVendorChunkPlugin(),
    {
      name: "headers",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader("service-worker-allowed", "/");
          // res.setHeader("cross-origin-opener-policy", "same-origin");
          // res.setHeader("cross-origin-embedder-policy", "require-corp");
          next();
        });
      },
    },
    {
      name: "serviceWorker",
      async writeBundle() {
        const assets = `${__dirname}/dist/assets`;
        const file = `${assets}/${fs
          .readdirSync(assets)
          .find((f) => f.startsWith("serviceWorker"))}`;
        const { manifestEntries } = await getManifest({
          globDirectory: "dist/assets",
          globPatterns: ["*"],
          modifyURLPrefix: {
            "": "/assets/",
          },
        });

        fs.writeFileSync(
          file,
          fs
            .readFileSync(file)
            .toString()
            .replace("self.__WB_MANIFEST", JSON.stringify(manifestEntries)),
        );
      },
    },
  ],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        ws: true,
      },
    },
  },
  build: {
    target: "esnext",
    reportCompressedSize: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "libsodium-wrappers": "libsodium-wrappers-sumo",
    },
  },
});
