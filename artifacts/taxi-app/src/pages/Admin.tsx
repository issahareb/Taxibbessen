import { useEffect } from "react";

const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const consoleUrl = `${apiBase}/admin-console`;

export default function Admin() {
  useEffect(() => {
    window.location.assign(consoleUrl);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 text-center">
      <p className="text-muted-foreground">Weiterleitung zum geschützten Bereich...</p>
    </main>
  );
}
