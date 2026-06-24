import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateTaxiPrice,
  parseNetworkError,
  networkErrorMessage,
  fetchDistanceEstimate,
} from "../hooks/use-bookings";

// ── calculateTaxiPrice ────────────────────────────────────────────────────────

describe("calculateTaxiPrice", () => {
  it("returns null for 0 km", () => {
    expect(calculateTaxiPrice(0)).toBeNull();
  });

  it("returns null for negative distance", () => {
    expect(calculateTaxiPrice(-1)).toBeNull();
  });

  it("applies 2.80 €/km rate for ≤ 2 km", () => {
    const result = calculateTaxiPrice(2);
    expect(result).not.toBeNull();
    expect(result!.perKmRate).toBe(2.80);
    expect(result!.baseFee).toBe(4.40);
    expect(result!.totalPrice).toBe(4.40 + 2 * 2.80);
  });

  it("applies 2.70 €/km rate for 2–4 km", () => {
    const result = calculateTaxiPrice(3);
    expect(result!.perKmRate).toBe(2.70);
  });

  it("applies 2.50 €/km rate for > 4 km", () => {
    const result = calculateTaxiPrice(10);
    expect(result!.perKmRate).toBe(2.50);
    expect(result!.totalPrice).toBe(Math.round((4.40 + 10 * 2.50) * 100) / 100);
  });

  it("rounds to 2 decimal places", () => {
    const result = calculateTaxiPrice(7.333);
    expect(result!.totalPrice).toEqual(
      Math.round((4.40 + 7.333 * 2.50) * 100) / 100
    );
  });
});

// ── parseNetworkError ─────────────────────────────────────────────────────────

describe("parseNetworkError", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "onLine", { writable: true, value: true });
  });

  it("detects offline when navigator.onLine is false", () => {
    Object.defineProperty(navigator, "onLine", { writable: true, value: false });
    expect(parseNetworkError(new Error("fail"))).toEqual({ kind: "offline" });
  });

  it("detects AbortError as timeout", () => {
    const err = new DOMException("aborted", "AbortError");
    expect(parseNetworkError(err)).toEqual({ kind: "timeout" });
  });

  it("detects fetch TypeError as offline", () => {
    const err = new TypeError("Failed to fetch");
    expect(parseNetworkError(err)).toEqual({ kind: "offline" });
  });

  it("returns unknown for generic errors", () => {
    const err = new Error("something went wrong");
    const result = parseNetworkError(err);
    expect(result.kind).toBe("unknown");
  });
});

// ── networkErrorMessage ───────────────────────────────────────────────────────

describe("networkErrorMessage", () => {
  it("returns German offline message", () => {
    expect(networkErrorMessage({ kind: "offline" })).toMatch(/Internetverbindung/);
  });

  it("returns German timeout message", () => {
    expect(networkErrorMessage({ kind: "timeout" })).toMatch(/lang/);
  });

  it("includes status code for server errors", () => {
    expect(networkErrorMessage({ kind: "server", status: 503 })).toContain("503");
  });
});

// ── fetchDistanceEstimate ─────────────────────────────────────────────────────

describe("fetchDistanceEstimate", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "onLine", { writable: true, value: true });
  });

  it("returns null without data when inputs are too short", async () => {
    const result = await fetchDistanceEstimate("A", "B");
    expect(result.distance).toBeNull();
    expect(result.duration).toBeNull();
    expect(result.error).toBeUndefined();
  });

  it("returns offline error when navigator.onLine is false", async () => {
    Object.defineProperty(navigator, "onLine", { writable: true, value: false });
    const result = await fetchDistanceEstimate("Essen Hauptbahnhof", "Flughafen Düsseldorf");
    expect(result.error).toEqual({ kind: "offline" });
  });

  it("returns distance and duration on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ distanceKm: 34.2, durationMinutes: 28 }),
    } as Response);

    const result = await fetchDistanceEstimate("Essen Hauptbahnhof", "Flughafen Düsseldorf");
    expect(result.distance).toBe(34.2);
    expect(result.duration).toBe(28);
    expect(result.error).toBeUndefined();
  });

  it("returns server error when response is not ok", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    const result = await fetchDistanceEstimate("Essen Hauptbahnhof", "Flughafen Düsseldorf");
    expect(result.error).toEqual({ kind: "server", status: 500 });
  });
});
