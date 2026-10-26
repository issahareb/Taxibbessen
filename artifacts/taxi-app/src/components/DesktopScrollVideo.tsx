import { useEffect, useState } from "react";

/** CSS hiding alone does not stop browsers fetching a video's source. */
export function DesktopScrollVideo({ name }: { name: "hero" | "city-20261026" | "transfer-20261026" }) {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (!desktop) return null;
  return (
    <video
      aria-hidden="true"
      className="hidden md:block absolute inset-0 w-full h-full object-cover"
      muted
      playsInline
      preload="none"
      poster={`${import.meta.env.BASE_URL}${name}-desktop-poster.webp`}
      style={{ objectPosition: "center" }}
    >
      <source src={`${import.meta.env.BASE_URL}${name}-desktop.mp4`} type="video/mp4" />
      {name === "hero" && <source src={`${import.meta.env.BASE_URL}${name}-desktop.webm`} type='video/webm; codecs="vp9"' />}
    </video>
  );
}
