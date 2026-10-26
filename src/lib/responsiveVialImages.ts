const vialAssets = import.meta.glob<string>(
  "/src/assets/vials/*.{avif,webp}",
  { eager: true, import: "default" },
);

function vialAsset(filename: string): string {
  const asset = vialAssets[`/src/assets/vials/${filename}`];
  if (!asset) throw new Error(`Missing responsive vial asset: ${filename}`);
  return asset;
}

export function responsiveVialSources(stem: string, fullWidth = 1024) {
  const avif = vialAsset(`${stem}.avif`);
  const webp = vialAsset(`${stem}.webp`);

  return {
    avif: {
      src: avif,
      srcSet: `${vialAsset(`${stem}-320.avif`)} 320w, ${vialAsset(`${stem}-640.avif`)} 640w, ${avif} ${fullWidth}w`,
    },
    webp: {
      src: webp,
      srcSet: `${vialAsset(`${stem}-320.webp`)} 320w, ${vialAsset(`${stem}-640.webp`)} 640w, ${webp} ${fullWidth}w`,
    },
    sizes: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  };
}
