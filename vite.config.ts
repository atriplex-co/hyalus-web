import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { getManifest } from "workbox-build";
import fs from "fs";

export default defineConfig({
  plugins: [
    vue(),
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
    minify: "esbuild",
    // assetsInlineLimit: 0,
    polyfillModulePreload: false,
    reportCompressedSize: false,
  },
  resolve: {
    alias: {
      "@": __dirname,
      "libsodium-wrappers": "libsodium-wrappers-sumo",
    },
  },
});
