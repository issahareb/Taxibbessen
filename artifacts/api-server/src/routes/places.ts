import { Router, type IRouter } from "express";

const router: IRouter = Router();

/**
 * Address suggestions for the booking form.
 *
 * The Google key stays on the server, same as for /api/distance. Results are
 * biased towards Essen and restricted to Germany, which is where every fare
 * starts.
 *
 * Failure is always silent: an unset key, a disabled API or an upstream
 * hiccup returns an empty list rather than an error, so the address input in
 * the form simply behaves like a normal text field instead of breaking the
 * booking flow.
 */

const ESSEN = { latitude: 51.4556, longitude: 7.0116 };
const BIAS_RADIUS_METRES = 40_000;
const MIN_QUERY_LENGTH = 3;
const MAX_SUGGESTIONS = 6;

type AutocompleteResponse = {
  suggestions?: {
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }[];
};

router.get("/places/autocomplete", async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (query.length < MIN_QUERY_LENGTH || query.length > 200) {
    return res.json({ suggestions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.json({ suggestions: [] });
  }

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
      },
      body: JSON.stringify({
        input: query,
        languageCode: "de",
        regionCode: "DE",
        includedRegionCodes: ["de"],
        locationBias: {
          circle: { center: ESSEN, radius: BIAS_RADIUS_METRES },
        },
      }),
    });

    if (!response.ok) {
      console.warn("[PLACES] upstream responded", response.status);
      return res.json({ suggestions: [] });
    }

    const data = (await response.json()) as AutocompleteResponse;

    const suggestions = (data.suggestions ?? [])
      .map((entry) => {
        const prediction = entry.placePrediction;
        if (!prediction) return null;
        const label = prediction.text?.text ?? prediction.structuredFormat?.mainText?.text;
        if (!label) return null;
        return {
          label,
          mainText: prediction.structuredFormat?.mainText?.text ?? label,
          secondaryText: prediction.structuredFormat?.secondaryText?.text ?? null,
        };
      })
      .filter((entry): entry is { label: string; mainText: string; secondaryText: string | null } => entry !== null)
      .slice(0, MAX_SUGGESTIONS);

    return res.json({ suggestions });
  } catch (error) {
    console.warn("[PLACES] autocomplete failed", error);
    return res.json({ suggestions: [] });
  }
});

export default router;
