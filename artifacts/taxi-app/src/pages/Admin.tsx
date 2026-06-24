import { Layout } from "@/components/Layout";
import { Card, Badge, Button } from "@/components/ui";
import { useRealtimeBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { format } from "date-fns";
import { Loader2, Check, X, Map as MapIcon, Clock, Phone, Users, MessageSquare, RotateCcw, PhoneCall, Search, BarChart2 } from "lucide-react";
import type { BookingStatus } from "@workspace/api-client-react";
import { useLanguage } from "@/i18n/useLanguage";
import { useMemo } from "react";

const FOUND_VIA_CONFIG: Record<string, { label: string; color: string }> = {
  google:      { label: "Google-Suche",       color: "#4285F4" },
  ki:          { label: "ChatGPT / KI",        color: "#9333ea" },
  empfehlung:  { label: "Empfehlung",          color: "#22c55e" },
  whatsapp:    { label: "WhatsApp",            color: "#25D366" },
  stammkunde:  { label: "Stammkunde",          color: "#f59e0b" },
  sonstiges:   { label: "Sonstiges",           color: "#6b7280" },
};

export default function Admin() {
  const { t } = useLanguage();
  const { data: bookings, isLoading } = useRealtimeBookings();
  const updateStatus = useUpdateBookingStatus();

  const foundViaStats = useMemo(() => {
    if (!bookings) return [];
    const counts: Record<string, number> = {};
    for (const b of bookings) {
      if (b.foundVia) {
        counts[b.foundVia] = (counts[b.foundVia] ?? 0) + 1;
      }
    }
    const total = Object.values(counts).reduce((s, n) => s + n, 0);
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([key, count]) => ({
        key,
        label: FOUND_VIA_CONFIG[key]?.label ?? key,
        color: FOUND_VIA_CONFIG[key]?.color ?? "#6b7280",
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
  }, [bookings]);

  const handleStatusChange = async (id: number, status: BookingStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new": return <Badge variant="warning">{t("status_new")}</Badge>;
      case "accepted": return <Badge variant="success">{t("status_accepted")}</Badge>;
      case "completed": return <Badge variant="neutral">{t("status_completed")}</Badge>;
      case "rejected": return <Badge variant="danger">{t("status_rejected")}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getFoundViaLabel = (fv: string | null | undefined) => {
    switch (fv) {
      case "google": return "Google-Suche";
      case "ki": return "ChatGPT / KI-Assistent";
      case "empfehlung": return "Persönliche Empfehlung";
      case "whatsapp": return "WhatsApp";
      case "stammkunde": return "Stammkunde";
      case "sonstiges": return "Sonstiges";
      default: return null;
    }
  };

  const getLaterPickupLabel = (lp: string | null | undefined) => {
    switch (lp) {
      case "same": return t("admin_later_same");
      case "different": return t("admin_later_different");
      case "callback": return t("admin_later_callback");
      default: return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-[85vh] bg-muted/20 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("admin_title")}</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm sm:text-base">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                {t("admin_live")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Mobile-only: Buchungsquellen stats above bookings */}
              {foundViaStats.length > 0 && (
                <Card className="lg:hidden p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-sm">Buchungsquellen</h3>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {foundViaStats.reduce((s, r) => s + r.count, 0)} mit Angabe
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {foundViaStats.map((row) => (
                      <div key={row.key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{row.label}</span>
                          <span className="text-muted-foreground">{row.count} ({row.pct}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {isLoading && !bookings ? (
                <div className="flex justify-center p-12 bg-card rounded-2xl border">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : bookings?.length === 0 ? (
                <div className="text-center p-12 bg-card rounded-2xl border">
                  <p className="text-muted-foreground">{t("admin_no_bookings")}</p>
                </div>
              ) : (
                bookings?.map((booking) => {
                  const laterLabel = getLaterPickupLabel(booking.laterPickup);
                  return (
                    <Card key={booking.id} className="p-0 overflow-hidden group hover:border-primary/50 transition-colors">
                      <div className="p-4 sm:p-6 flex flex-col gap-4">

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className="text-xs text-muted-foreground font-bold uppercase">ID: #{booking.id.toString().padStart(4, "0")}</p>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-medium">
                            <Clock className="w-4 h-4 text-primary shrink-0" />
                            <span>
                              {booking.scheduledTime
                                ? format(new Date(booking.scheduledTime), "HH:mm")
                                : t("admin_asap")}
                            </span>
                            {booking.scheduledTime && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(booking.scheduledTime), "dd.MM.")}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              <span className="font-bold text-base sm:text-lg">{booking.customerName || t("admin_guest")}</span>
                              {booking.customerPhone && (
                                <a
                                  href={`tel:${booking.customerPhone}`}
                                  className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm bg-muted px-2 py-0.5 rounded-md"
                                >
                                  <Phone className="w-3 h-3" /> {booking.customerPhone}
                                </a>
                              )}
                              {(booking.passengerCount ?? 1) > 1 && (
                                <span className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">
                                  <Users className="w-3 h-3" /> {booking.passengerCount}
                                </span>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex gap-3 items-start">
                                <div className="w-2 h-2 mt-1.5 rounded-full bg-secondary shrink-0" />
                                <p className="text-sm font-medium">{booking.pickupLocation}</p>
                              </div>
                              <div className="flex gap-3 items-start">
                                <div className="w-2 h-2 mt-1.5 bg-primary shrink-0" />
                                <p className="text-sm font-medium">{booking.destination}</p>
                              </div>
                            </div>

                            {(laterLabel || booking.notes || booking.foundVia) && (
                              <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                                {laterLabel && (
                                  <div className="flex items-start gap-2">
                                    {booking.laterPickup === "callback" ? (
                                      <PhoneCall className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                                    ) : (
                                      <RotateCcw className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                                    )}
                                    <div className="text-sm">
                                      <span className="font-medium">{t("admin_later_pickup")}:</span>{" "}
                                      <span className="text-muted-foreground">{laterLabel}</span>
                                      {booking.returnPickupTime && (
                                        <span className="text-muted-foreground ml-1">
                                          – {format(new Date(booking.returnPickupTime), "dd.MM. HH:mm")}
                                        </span>
                                      )}
                                      {booking.callbackTime && (
                                        <span className="text-muted-foreground ml-1">
                                          – {t("admin_callback_time")}: {format(new Date(booking.callbackTime), "dd.MM. HH:mm")}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {booking.laterPickup === "different" && booking.returnPickupLocation && (
                                  <div className="ml-5 space-y-1 text-sm text-muted-foreground">
                                    <p>{t("return_pickup_label")}: {booking.returnPickupLocation}</p>
                                    {booking.returnDestination && <p>{t("return_dest_label")}: {booking.returnDestination}</p>}
                                  </div>
                                )}
                                {booking.foundVia && (
                                  <div className="flex items-start gap-2">
                                    <Search className="w-3.5 h-3.5 mt-0.5 text-blue-400 shrink-0" />
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium text-foreground">Gefunden über:</span>{" "}
                                      {getFoundViaLabel(booking.foundVia) ?? booking.foundVia}
                                    </p>
                                  </div>
                                )}
                                {booking.notes && (
                                  <div className="flex items-start gap-2">
                                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                    <p className="text-sm text-muted-foreground">{booking.notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-row sm:flex-col gap-2 justify-start sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                            {booking.status === "new" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white gap-1 flex-1 sm:flex-none"
                                  onClick={() => handleStatusChange(booking.id, "accepted")}
                                  disabled={updateStatus.isPending}
                                >
                                  <Check className="w-4 h-4" /> {t("admin_accept")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  className="gap-1 flex-1 sm:flex-none"
                                  onClick={() => handleStatusChange(booking.id, "rejected")}
                                  disabled={updateStatus.isPending}
                                >
                                  <X className="w-4 h-4" /> {t("admin_reject")}
                                </Button>
                              </>
                            )}
                            {booking.status === "accepted" && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="w-full sm:w-auto"
                                onClick={() => handleStatusChange(booking.id, "completed")}
                                disabled={updateStatus.isPending}
                              >
                                {t("admin_complete")}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            <div className="hidden lg:flex lg:flex-col sticky top-28 h-[calc(100vh-140px)] gap-4">
              {/* Buchungsquellen Auswertung */}
              <Card className="p-4 shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm">Buchungsquellen</h3>
                  {foundViaStats.length > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {foundViaStats.reduce((s, r) => s + r.count, 0)} mit Angabe
                    </span>
                  )}
                </div>
                {foundViaStats.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    Noch keine Buchungsquellen-Angaben
                  </p>
                ) : (
                  <div className="space-y-3">
                    {foundViaStats.map((row) => (
                      <div key={row.key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{row.label}</span>
                          <span className="text-muted-foreground tabular-nums">
                            {row.count} · {row.pct}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Map placeholder */}
              <Card className="flex-1 overflow-hidden flex flex-col bg-secondary min-h-0">
                <div className="p-4 border-b border-white/10 bg-secondary flex items-center gap-2 text-white">
                  <MapIcon className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">{t("admin_map")}</h3>
                </div>
                <div className="flex-1 relative bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23FFC107' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` }}
                  />
                  <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(255,193,7,0.8)] animate-pulse" />
                  <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(255,193,7,0.8)] animate-pulse delay-700" />
                  <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                  <div className="relative z-10 text-center p-6 backdrop-blur-sm bg-black/40 rounded-xl border border-white/10 m-6">
                    <MapIcon className="w-8 h-8 text-primary mx-auto mb-3 opacity-80" />
                    <p className="text-sm font-medium text-white/90">{t("admin_map_integration")}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
