import { useQueryClient } from "@tanstack/react-query";
import {
  useListBookings,
  useCreateBooking as useApiCreateBooking,
  useUpdateBookingStatus as useApiUpdateBookingStatus,
  getListBookingsQueryKey,
  type BookingStatus
} from "@workspace/api-client-react";

const FETCH_TIMEOUT_MS = 8000;

export type NetworkError =
  | { kind: "offline" }
  | { kind: "timeout" }
  | { kind: "server"; status: number }
  | { kind: "unknown"; message: string };

export function parseNetworkError(err: unknown): NetworkError {
  if (!navigator.onLine) return { kind: "offline" };
  if (err instanceof DOMException && err.name === "AbortError") return { kind: "timeout" };
  if (err instanceof TypeError && err.message.toLowerCase().includes("fetch"))
    return { kind: "offline" };
  if (err instanceof Error) return { kind: "unknown", message: err.message };
  return { kind: "unknown", message: String(err) };
}

export function networkErrorMessage(err: NetworkError): string {
  switch (err.kind) {
    case "offline": return "Keine Internetverbindung. Bitte prüfen Sie Ihre Verbindung.";
    case "timeout": return "Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es erneut.";
    case "server": return `Serverfehler (${err.status}). Bitte versuchen Sie es später erneut.`;
    case "unknown": return `Unbekannter Fehler: ${err.message}`;
  }
}

export function useRealtimeBookings() {
  return useListBookings({
    query: {
      queryKey: getListBookingsQueryKey(),
      refetchInterval: 3000,
      staleTime: 0,
      retry: (failureCount, error) => {
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      networkMode: "offlineFirst",
    }
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const mutation = useApiCreateBooking();

  return {
    ...mutation,
    mutateAsync: async (data: Parameters<typeof mutation.mutateAsync>[0]) => {
      try {
        const result = await mutation.mutateAsync(data);
        await queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        return result;
      } catch (err) {
        throw parseNetworkError(err);
      }
    }
  };
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const mutation = useApiUpdateBookingStatus();

  return {
    ...mutation,
    mutateAsync: async ({ id, status }: { id: number; status: BookingStatus }) => {
      try {
        const result = await mutation.mutateAsync({ id, data: { status } });
        await queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        return result;
      } catch (err) {
        throw parseNetworkError(err);
      }
    }
  };
}

export async function fetchDistanceEstimate(
  pickup: string,
  destination: string
): Promise<{ distance: number | null; duration: number | null; error?: NetworkError }> {
  if (!pickup || !destination || pickup.length < 3 || destination.length < 3) {
    return { distance: null, duration: null };
  }

  if (!navigator.onLine) {
    return { distance: null, duration: null, error: { kind: "offline" } };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({ origins: pickup, destinations: destination });
    const res = await fetch(`/api/distance?${params}`, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      return { distance: null, duration: null, error: { kind: "server", status: res.status } };
    }

    const data = await res.json();
    return {
      distance: typeof data.distanceKm === "number" ? data.distanceKm : null,
      duration: typeof data.durationMinutes === "number" ? data.durationMinutes : null,
    };
  } catch (err) {
    clearTimeout(timer);
    return { distance: null, duration: null, error: parseNetworkError(err) };
  }
}

const BASE_FEE = 4.40;

function getPerKmRate(distanceKm: number): number {
  if (distanceKm <= 2) return 2.80;
  if (distanceKm <= 4) return 2.70;
  return 2.50;
}

export interface TaxiPriceBreakdown {
  baseFee: number;
  distanceKm: number;
  perKmRate: number;
  distanceCost: number;
  totalPrice: number;
}

export function calculateTaxiPrice(distanceKm: number): TaxiPriceBreakdown | null {
  if (!distanceKm || distanceKm <= 0) return null;
  const perKmRate = getPerKmRate(distanceKm);
  const distanceCost = Math.round(distanceKm * perKmRate * 100) / 100;
  const totalPrice = Math.round((BASE_FEE + distanceCost) * 100) / 100;
  return { baseFee: BASE_FEE, distanceKm, perKmRate, distanceCost, totalPrice };
}
