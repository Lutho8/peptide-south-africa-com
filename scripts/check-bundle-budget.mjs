import { readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const assetsDirectory = resolve("dist/assets");
const maximumJavaScriptBytes = 300 * 1024;

const javascriptAssets = readdirSync(assetsDirectory)
  .filter((filename) => filename.endsWith(".js"))
  .map((filename) => ({
    filename,
    bytes: statSync(resolve(assetsDirectory, filename)).size,
  }))
  .sort((left, right) => right.bytes - left.bytes);

const oversizedAssets = javascriptAssets.filter(
  ({ bytes }) => bytes > maximumJavaScriptBytes,
);

if (oversizedAssets.length > 0) {
  const details = oversizedAssets
    .map(({ filename, bytes }) => `  ${filename}: ${(bytes / 1024).toFixed(2)} kB`)
    .join("\n");

  console.error(
    `Bundle budget failed. JavaScript assets must remain at or below 300 kB:\n${details}`,
  );
  process.exit(1);
}

const largestAssets = javascriptAssets.slice(0, 5)
  .map(({ filename, bytes }) => `${filename} ${(bytes / 1024).toFixed(2)} kB`)
  .join(", ");

console.log(`✓ Bundle budget passed. Largest assets: ${largestAssets}`);
