import { useState } from "react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { getPageMeta } from "@/page-meta-manifest";
import { Layout } from "@/components/Layout";
import { Card, Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/i18n/useLanguage";
import {
  Search,
  MapPin,
  Clock,
  Users,
  Euro,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Truck,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

type BookingStatus = "new" | "accepted" | "completed" | "rejected";

interface StatusResult {
  id: number;
  bookingNr: string;
  pickupLocation: string;
  destination: string;
  status: BookingStatus;
  scheduledTime: string | null;
  estimatedDistance: number | null;
  estimatedDuration: number | null;
  estimatedPrice: number | null;
  passengerCount: number;
  customerName: string;
}

type LookupError = "not_found" | "wrong_name" | "error";

const STATUS_ICONS: Record<BookingStatus, React.ReactNode> = {
  new: <Clock className="w-5 h-5 text-yellow-500" />,
  accepted: <Truck className="w-5 h-5 text-blue-500" />,
  completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  rejected: <XCircle className="w-5 h-5 text-destructive" />,
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  new: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  accepted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const { title: _fsTitle, description: _fsDesc, noindex: _fsNoindex } = getPageMeta('/fahrtstatus');

export default function Fahrtstatus() {
  usePageMeta({ title: _fsTitle, description: _fsDesc, noindex: _fsNoindex });
  const { t } = useLanguage();
  const prefill = new URLSearchParams(window.location.search).get("booking_nr") ?? "";
  const [bookingNr, setBookingNr] = useState(prefill);
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LookupError | null>(null);
  const [result, setResult] = useState<StatusResult | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingNr.trim() || !lastName.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(
        `${base}/api/bookings/status?booking_nr=${encodeURIComponent(bookingNr.trim())}&last_name=${encodeURIComponent(lastName.trim())}`
      );

      if (res.status === 404) {
        setError("not_found");
      } else if (res.status === 403) {
        setError("wrong_name");
      } else if (!res.ok) {
        setError("error");
      } else {
        const data = await res.json();
        setResult(data);
      }
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setBookingNr("");
    setLastName("");
  }

  const rideStatusKey = (status: BookingStatus) => {
    const map: Record<BookingStatus, string> = {
      new: t("ride_status_new"),
      accepted: t("ride_status_accepted"),
      completed: t("ride_status_completed"),
      rejected: t("ride_status_rejected"),
    };
    return map[status];
  };

  return (
    <Layout>
      <div className="min-h-[80vh] bg-muted/30 py-10 sm:py-16 px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-5 shadow-xl shadow-primary/10">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">{t("status_page_title")}</h1>
            <p className="text-base text-muted-foreground">{t("status_page_sub")}</p>
          </div>

          {!result ? (
            <Card className="p-6 sm:p-8">
              <form onSubmit={handleCheck} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="bookingNr">{t("status_booking_nr")}</Label>
                  <Input
                    id="bookingNr"
                    value={bookingNr}
                    onChange={(e) => setBookingNr(e.target.value)}
                    placeholder={t("status_booking_nr_placeholder")}
                    className="font-mono"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statusLastName">{t("status_last_name")}</Label>
                  <Input
                    id="statusLastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t("status_last_name_placeholder")}
                    autoComplete="family-name"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">
                      {error === "not_found" ? t("status_not_found") : error === "wrong_name" ? t("status_wrong_name") : t("widget_error")}
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full gap-2" disabled={loading || !bookingNr.trim() || !lastName.trim()}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {t("status_check_btn")}
                </Button>
              </form>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Result Card */}
              <Card className="p-0 overflow-hidden border-2 border-primary/20">
                {/* Header */}
                <div className="bg-primary/5 p-5 sm:p-6 border-b border-border flex justify-between items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">{t("conf_booking_nr_label")}</p>
                    <p className="text-xl font-mono font-bold">{result.bookingNr}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{result.customerName}</p>
                  </div>
                  <div className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-sm font-semibold ${STATUS_COLORS[result.status]}`}>
                    {STATUS_ICONS[result.status]}
                    <span>{rideStatusKey(result.status)}</span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  {/* Route */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{t("status_route")}</p>
                    <div className="relative">
                      <div className="absolute left-2.5 top-4 bottom-4 w-0.5 bg-border z-0" />
                      <div className="space-y-4 relative z-10">
                        <div className="flex gap-3 items-start">
                          <div className="mt-1 w-5 h-5 rounded-full bg-secondary border-[3px] border-background shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold mb-0.5">{t("conf_pickup")}</p>
                            <p className="font-medium text-sm">{result.pickupLocation}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-start">
                          <div className="mt-1 w-5 h-5 rounded-none bg-primary border-[3px] border-background shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold mb-0.5">{t("conf_dest")}</p>
                            <p className="font-medium text-sm">{result.destination}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                    <div className="bg-muted rounded-xl p-3 flex gap-2 items-center">
                      <Clock className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t("status_time")}</p>
                        <p className="text-sm font-semibold">
                          {result.scheduledTime
                            ? format(new Date(result.scheduledTime), "dd.MM.yy HH:mm")
                            : t("conf_asap")}
                        </p>
                      </div>
                    </div>
                    <div className="bg-muted rounded-xl p-3 flex gap-2 items-center">
                      <Users className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t("status_passengers")}</p>
                        <p className="text-sm font-semibold">{result.passengerCount}</p>
                      </div>
                    </div>
                    {result.estimatedDistance != null && (
                      <div className="bg-muted rounded-xl p-3 flex gap-2 items-center">
                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t("status_distance")}</p>
                          <p className="text-sm font-semibold">{result.estimatedDistance} km</p>
                        </div>
                      </div>
                    )}
                    {result.estimatedPrice != null && (
                      <div className="bg-muted rounded-xl p-3 flex gap-2 items-center">
                        <Euro className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t("status_price")}</p>
                          <p className="text-sm font-semibold">{result.estimatedPrice.toFixed(2).replace(".", ",")} €</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Button variant="outline" onClick={handleReset} className="w-full gap-2">
                <RotateCcw className="w-4 h-4" />
                {t("status_back")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
