import type { ImgHTMLAttributes } from "react";

/** Shared aspect ratio keeps every logo placement stable while the asset loads. */
export function BrandLogo({ className = "", alt = "Taxi B&B Essen", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}bb-logo-v9.webp`}
      srcSet={[160, 320, 480, 640, 960].map(width => `${import.meta.env.BASE_URL}bb-logo-v9-${width}w.webp ${width}w`).join(", ")}
      sizes="160px"
      alt={alt}
      width={960}
      height={431}
      decoding="async"
      className={`block h-auto shrink-0 object-contain ${className}`}
      {...props}
    />
  );
}
