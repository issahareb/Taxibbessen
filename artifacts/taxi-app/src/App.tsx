import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { CookieBanner } from "@/components/CookieBanner";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Book from "@/pages/Book";
import Confirmation from "@/pages/Confirmation";
import Admin from "@/pages/Admin";
import Impressum from "@/pages/Impressum";
import AGB from "@/pages/AGB";
import Datenschutz from "@/pages/Datenschutz";
import Fahrzeuge from "@/pages/Fahrzeuge";
import UeberUns from "@/pages/UeberUns";
import FlughafentransferEssen from "@/pages/FlughafentransferEssen";
import KrankenfahrtenEssen from "@/pages/KrankenfahrtenEssen";
import GrossraumtaxiEssen from "@/pages/GrossraumtaxiEssen";
import DialysefahrtenEssen from "@/pages/DialysefahrtenEssen";
import KurierdienstEssen from "@/pages/KurierdienstEssen";
import TaxiEssenHbf from "@/pages/TaxiEssenHbf";
import TaxiHolsterhausen from "@/pages/TaxiHolsterhausen";
import TaxiRuettenscheid from "@/pages/TaxiRuettenscheid";
import TaxiFrohnhausen from "@/pages/TaxiFrohnhausen";
import TaxiSuedviertel from "@/pages/TaxiSuedviertel";
import { routeConfigs } from "@/routes";

import { useLenis } from "@/hooks/useLenis";
import { getLenis } from "@/lib/lenis";

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

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {routeConfigs.map(({ path }) => {
          const Component = routeComponents[path];
          if (!Component) return null;
          return <Route key={path} path={path} component={Component} />;
        })}
        <Route component={NotFound} />
      </Switch>
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AppInner />
          <Toaster />
          <CookieBanner />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
