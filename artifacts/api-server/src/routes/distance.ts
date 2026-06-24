import { Router } from "express";

const router = Router();

router.get("/distance", async (req, res) => {
  const { origins, destinations } = req.query;

  if (!origins || !destinations) {
    return res.status(400).json({ error: "origins und destinations sind erforderlich" });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Google Maps API nicht konfiguriert" });
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.set("origins", String(origins));
    url.searchParams.set("destinations", String(destinations));
    url.searchParams.set("key", apiKey);
    url.searchParams.set("language", "de");
    url.searchParams.set("units", "metric");
    url.searchParams.set("region", "de");

    const response = await fetch(url.toString());
    const data = await response.json() as {
      status: string;
      rows?: { elements?: { status: string; distance?: { value: number; text: string }; duration?: { value: number; text: string } }[] }[];
    };

    if (data.status !== "OK") {
      return res.status(422).json({ error: "Strecke konnte nicht berechnet werden" });
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== "OK") {
      return res.status(422).json({ error: "Keine Route gefunden" });
    }

    return res.json({
      distanceKm: Math.round((element.distance!.value / 1000) * 10) / 10,
      durationMinutes: Math.round(element.duration!.value / 60),
      distanceText: element.distance!.text,
      durationText: element.duration!.text,
    });
  } catch {
    return res.status(500).json({ error: "Fehler bei der Streckenberechnung" });
  }
});

export default router;
