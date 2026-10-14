/** Descriptive dispatch notes only; these do not promise availability or a price. */
export function inferRideServices({
  pickup,
  destination,
  passengers,
  requestedService = "",
}: {
  pickup: string;
  destination: string;
  passengers: number;
  requestedService?: string;
}): string[] {
  const services = new Set<string>();
  // Preserve explicit intent from links on the corresponding service pages.
  if (["Flughafentransfer", "Großraumtaxi", "Krankenfahrt", "Kurierfahrt"].includes(requestedService)) {
    services.add(requestedService);
  }
  // A city alone is not enough evidence for an airport transfer.
  if (/\b(?:flughafen\w*|airport|DUS|CGN|FRA|DTM|NRN|FMO|PAD)\b/i.test(`${pickup} ${destination}`)) {
    services.add("Flughafentransfer");
  }
  if (passengers > 4) services.add("Großraumtaxi");
  return [...services];
}
