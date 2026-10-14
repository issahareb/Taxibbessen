import type { ImgHTMLAttributes } from "react";

/** Shared aspect ratio keeps every logo placement stable while the asset loads. */
export function BrandLogo({ className = "", alt = "Taxi B&B Essen", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}bb-logo-v8.svg`}
      alt={alt}
      width={842}
      height={440}
      decoding="async"
      className={`block h-auto shrink-0 object-contain ${className}`}
      {...props}
    />
  );
}
