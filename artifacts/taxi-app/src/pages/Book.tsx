import { useEffect } from "react";

const ANFRAGE_URL = `${import.meta.env.BASE_URL}#anfrage`;

export default function Book() {
  useEffect(() => {
    window.location.replace(ANFRAGE_URL);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 text-center"
      style={{ background: "#0b0a08" }}
    >
      <p className="text-white/70 text-sm">
        Weiterleitung zum Buchungsformular …{" "}
        <a href={ANFRAGE_URL} className="text-primary underline">
          Hier klicken
        </a>
      </p>
    </div>
  );
}
