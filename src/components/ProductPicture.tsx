import type { ImgHTMLAttributes } from "react";
import type { ProductImageSources } from "@/data/products";

interface ProductPictureProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  src: string;
  sources?: ProductImageSources;
}

export default function ProductPicture({ src, sources, alt, sizes, ...imageProps }: ProductPictureProps) {
  const responsiveSizes = sizes ?? sources?.sizes;

  return (
    <picture className="contents">
      {sources?.avif && (
        <source
          type="image/avif"
          srcSet={sources.avif.srcSet ?? sources.avif.src}
          sizes={responsiveSizes}
        />
      )}
      {sources?.webp && (
        <source
          type="image/webp"
          srcSet={sources.webp.srcSet ?? sources.webp.src}
          sizes={responsiveSizes}
        />
      )}
      <img src={src} alt={alt} sizes={responsiveSizes} {...imageProps} />
    </picture>
  );
}
