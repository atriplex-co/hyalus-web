const ASSETS_PATH = "src/vendor/fluentui-emoji/assets";
const ASSETS_OUT_PATH = "public/fluentui-emoji";
const METADATA_OUT_PATH = "build/fluentui-emoji";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const os = require("node:os");
const sharp = require("sharp");
const { Promise } = require("bluebird");

(async () => {
  const emojis = [];
  fs.rmSync(ASSETS_OUT_PATH, { recursive: true, force: true });
  fs.rmSync(METADATA_OUT_PATH, { recursive: true, force: true });
  fs.mkdirSync(ASSETS_OUT_PATH, { recursive: true });
  fs.mkdirSync(METADATA_OUT_PATH, { recursive: true });
  const ids = fs.readdirSync(ASSETS_PATH);
  await Promise.map(
    ids,
    async (id) => {
      const metadata = JSON.parse(fs.readFileSync(path.join(ASSETS_PATH, id, "metadata.json")));
      let asset = "";
      for (const dir of [
        path.join(ASSETS_PATH, id, "3D"),
        path.join(ASSETS_PATH, id, "Default", "3D"),
      ]) {
        if (fs.existsSync(dir)) {
          const assetName = fs.readdirSync(dir)[0];
          const assetPath = path.join(dir, assetName);
          const scaled = await sharp(assetPath).resize(128).webp({ lossless: true }).toBuffer();
          const hash = crypto.createHash("sha256").update(scaled).digest("base64url");
          asset = `${hash}.webp`;
          fs.writeFileSync(path.join(ASSETS_OUT_PATH, asset), scaled);
        }
      }
      if (!asset) {
        return console.log(`missing image for emoji: ${id}`);
      }
      emojis.push({
        id: id.replaceAll(" ", "_").toLowerCase(),
        asset,
        name: metadata.cldr,
        glyph: metadata.glyph,
        keywords: metadata.keywords,
        group: metadata.group,
      });
    },
    {
      concurrency: os.cpus().length,
    },
  );
  fs.writeFileSync(path.join(METADATA_OUT_PATH, "metadata.json"), JSON.stringify({ emojis }));
})();
