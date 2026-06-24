import { useLocation, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, Button, Badge } from "@/components/ui";
import { useGetBooking, getGetBookingQueryKey } from "@workspace/api-client-react";
import { CheckCircle2, MapPin, Calendar, ArrowRight, Loader2, Euro, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/i18n/useLanguage";
import { calculateTaxiPrice } from "@/hooks/use-bookings";
import { usePageMeta } from "@/hooks/use-page-meta";
import { getPageMeta } from "@/page-meta-manifest";

export default function Confirmation() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { title, description, noindex } = getPageMeta('/confirmation');
  usePageMeta({ title, description, noindex });

  const searchParams = new URLSearchParams(window.location.search);
  const idParam = searchParams.get("id");
  const id = idParam ? parseInt(idParam, 10) : null;

  const { data: booking, isLoading, isError } = useGetBooking(id as number, {
    query: { queryKey: getGetBookingQueryKey(id as number), enabled: !!id },
  });

  if (!id) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4 px-4">
          <h2 className="text-2xl font-bold text-center">{t("admin_no_bookings")}</h2>
          <Button asChild><Link href="/book">{t("nav_book")}</Link></Button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (isError || !booking) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4 px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-destructive text-center">Buchung nicht gefunden</h2>
          <Button asChild><Link href="/book">{t("conf_new_booking")}</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] bg-muted/30 py-10 sm:py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full mb-5 sm:mb-6 shadow-xl shadow-green-500/20">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3 sm:mb-4">{t("conf_title")}</h1>
            <p className="text-base sm:text-lg text-muted-foreground">{t("conf_sub")}</p>
          </div>

          {/* Booking Card */}
          <Card className="p-0 overflow-hidden border-2 border-primary/20">
            <div className="bg-primary/5 p-5 sm:p-6 border-b border-border flex justify-between items-center gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">{t("conf_booking_nr_label")}</p>
                <p className="text-xl sm:text-2xl font-mono font-bold">TBB-{booking.id.toString().padStart(6, "0")}</p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{t("conf_booking_id")} #{booking.id.toString().padStart(5, "0")}</p>
              </div>
              <Badge variant="warning" className="text-xs sm:text-sm px-3 py-1 uppercase tracking-wider shrink-0">
                {t("conf_status_new")}
              </Badge>
            </div>

            <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
              {/* Route */}
              <div className="relative">
                <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-border z-0"></div>
                <div className="space-y-5 sm:space-y-6 relative z-10">
                  <div className="flex gap-4 items-start">
                    <div className="mt-1 w-6 h-6 rounded-full bg-secondary border-[4px] border-background shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-semibold mb-1">{t("conf_pickup")}</p>
                      <p className="text-base sm:text-lg font-medium">{booking.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="mt-1 w-6 h-6 rounded-none bg-primary border-[4px] border-background shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-semibold mb-1">{t("conf_dest")}</p>
                      <p className="text-base sm:text-lg font-medium">{booking.destination}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border">
                <div className="bg-muted rounded-xl p-4 flex gap-3 items-center">
                  <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t("conf_time")}</p>
                    <p className="font-semibold text-sm">
                      {booking.scheduledTime
                        ? format(new Date(booking.scheduledTime), "dd.MM.yyyy HH:mm")
                        : t("conf_asap")}
                    </p>
                  </div>
                </div>
                {booking.estimatedDuration && (
                  <div className="bg-muted rounded-xl p-4 flex gap-3 items-center">
                    <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t("distance_label")}</p>
                      <p className="font-semibold text-sm">{booking.estimatedDistance} km · {booking.estimatedDuration} min</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              {(() => {
                const price = booking.estimatedDistance ? calculateTaxiPrice(booking.estimatedDistance) : null;
                if (!price) return null;
                return (
                  <div className="pt-4 sm:pt-6 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <Euro className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-base sm:text-lg">{t("conf_price_title")}</h3>
                    </div>
                    <div className="bg-muted rounded-xl p-4 sm:p-5 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t("conf_base_fee")}</span>
                        <span className="font-medium">{price.baseFee.toFixed(2).replace(".", ",")} €</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {Number.isInteger(price.distanceKm) ? price.distanceKm : price.distanceKm.toFixed(1).replace(".", ",")} km × {price.perKmRate.toFixed(2).replace(".", ",")} €
                        </span>
                        <span className="font-medium">{price.distanceCost.toFixed(2).replace(".", ",")} €</span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-base">{t("conf_total_price")}</span>
                        <span className="font-bold text-lg text-primary">{price.totalPrice.toFixed(2).replace(".", ",")} €</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 ml-1">{t("conf_price_note")}</p>
                  </div>
                );
              })()}

              {/* Next steps */}
              <div className="pt-4 sm:pt-6 border-t border-border">
                <h3 className="font-bold text-base sm:text-lg mb-4">{t("conf_what_next")}</h3>
                <ol className="space-y-3">
                  {[t("conf_step1"), t("conf_step2")].map((step, i) => (
                    <li key={i} className="flex gap-3 items-start text-sm sm:text-base">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                  <li className="flex gap-3 items-start text-sm sm:text-base">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <div className="flex-1">
                      <p className="text-muted-foreground mb-3">Bei Fragen erreichen Sie uns jederzeit:</p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href="tel:0201707060"
                          className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-xl transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          0201 707060
                        </a>
                        <a
                          href="tel:01711111535"
                          className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-xl transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          0171 111 1535
                        </a>
                        <a
                          href="https://wa.me/491711111535"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 hover:border-[#25D366]/40 text-[#25D366] text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-xl transition-all"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                        </a>
                        <a
                          href="mailto:taxibb@outlook.com"
                          className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-xl transition-all"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          E-Mail
                        </a>
                      </div>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/book">{t("conf_new_booking")}</Link>
            </Button>
            <Button asChild variant="outline" className="gap-2 w-full sm:w-auto">
              <Link href="/">{t("conf_home")} <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
