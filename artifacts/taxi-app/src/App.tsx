import { LazyMotion, domAnimation } from "framer-motion";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { CookieBanner } from "@/components/CookieBanner";
import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
const Book = lazy(() => import("@/pages/Book"));
const Confirmation = lazy(() => import("@/pages/Confirmation"));
const Admin = lazy(() => import("@/pages/Admin"));
const Impressum = lazy(() => import("@/pages/Impressum"));
const AGB = lazy(() => import("@/pages/AGB"));
const Datenschutz = lazy(() => import("@/pages/Datenschutz"));
const Fahrzeuge = lazy(() => import("@/pages/Fahrzeuge"));
const UeberUns = lazy(() => import("@/pages/UeberUns"));
const EcoTaxi = lazy(() => import("@/pages/EcoTaxi"));
const FlughafentransferEssen = lazy(() => import("@/pages/FlughafentransferEssen"));
const KrankenfahrtenEssen = lazy(() => import("@/pages/KrankenfahrtenEssen"));
const GrossraumtaxiEssen = lazy(() => import("@/pages/GrossraumtaxiEssen"));
const DialysefahrtenEssen = lazy(() => import("@/pages/DialysefahrtenEssen"));
const KurierdienstEssen = lazy(() => import("@/pages/KurierdienstEssen"));
const TaxiEssenHbf = lazy(() => import("@/pages/TaxiEssenHbf"));
const TaxiHolsterhausen = lazy(() => import("@/pages/TaxiHolsterhausen"));
const TaxiRuettenscheid = lazy(() => import("@/pages/TaxiRuettenscheid"));
const TaxiFrohnhausen = lazy(() => import("@/pages/TaxiFrohnhausen"));
const TaxiSuedviertel = lazy(() => import("@/pages/TaxiSuedviertel"));
import { routeConfigs } from "@/routes";

import { useLenis } from "@/hooks/useLenis";
import { getLenis } from "@/lib/lenis";
import { initAnalytics, trackPageview } from "@/lib/analytics";

const queryClient = new QueryClient();

type ComponentType = React.ComponentType;

const routeComponents: Record<string, ComponentType> = {
  "/":                                    Home,
  "/book":                                Book,
  "/confirmation":                        Confirmation,
  "/admin":                               Admin,
  "/impressum":                           Impressum,
  "/agb":                                 AGB,
  "/datenschutz":                         Datenschutz,
  "/fahrzeuge":                           Fahrzeuge,
  "/ueber-uns":                           UeberUns,
  "/eco-taxi":                            EcoTaxi,
  "/flughafentransfer-essen-duesseldorf": FlughafentransferEssen,
  "/krankenfahrten-essen":               KrankenfahrtenEssen,
  "/grossraumtaxi-essen":                GrossraumtaxiEssen,
  "/dialysefahrten-essen":               DialysefahrtenEssen,
  "/kurierdienst-essen":                 KurierdienstEssen,
  "/taxi-essen-hbf":                     TaxiEssenHbf,
  "/taxi-essen-holsterhausen":           TaxiHolsterhausen,
  "/taxi-essen-ruettenscheid":           TaxiRuettenscheid,
  "/taxi-essen-frohnhausen":             TaxiFrohnhausen,
  "/taxi-essen-suedviertel":             TaxiSuedviertel,
};

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location]);
  return null;
}

/**
 * Records a pageview per route change. The internal admin page is left out
 * on purpose: it is staff traffic, not reach.
 */
function AnalyticsTracker() {
  const [location] = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (location.startsWith("/admin")) return;
    trackPageview(location || "/");
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <AnalyticsTracker />
      <Suspense fallback={<div aria-busy="true" className="min-h-screen bg-[#07090d]" />}>
      <Switch>
        {routeConfigs.map(({ path }) => {
          const Component = routeComponents[path];
          if (!Component) return null;
          return <Route key={path} path={path} component={Component} />;
        })}
        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </>
  );
}

function AppInner() {
  useLenis();
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

function App() {
  return (
    <LazyMotion features={domAnimation} strict>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AppInner />
          <Toaster />
          <CookieBanner />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
    </LazyMotion>
  );
}

export default App;
