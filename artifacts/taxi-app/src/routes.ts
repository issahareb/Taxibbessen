export type RouteConfig = {
  path: string;
  indexable: boolean;
  priority: number;
  changefreq: "weekly" | "monthly" | "yearly";
};

export const routeConfigs: RouteConfig[] = [
  { path: "/",                                   indexable: true,  priority: 1.0, changefreq: "weekly"  },
  { path: "/book",                               indexable: false, priority: 0.9, changefreq: "monthly" },
  { path: "/flughafentransfer-essen-duesseldorf",indexable: true,  priority: 0.9, changefreq: "monthly" },
  { path: "/krankenfahrten-essen",               indexable: true,  priority: 0.9, changefreq: "monthly" },
  { path: "/grossraumtaxi-essen",                indexable: true,  priority: 0.9, changefreq: "monthly" },
  { path: "/dialysefahrten-essen",               indexable: true,  priority: 0.9, changefreq: "monthly" },
  { path: "/kurierdienst-essen",                 indexable: true,  priority: 0.8, changefreq: "monthly" },
  { path: "/taxi-essen-hbf",                     indexable: true,  priority: 0.8, changefreq: "monthly" },
  { path: "/fahrzeuge",                          indexable: true,  priority: 0.8, changefreq: "monthly" },
  { path: "/ueber-uns",                          indexable: true,  priority: 0.7, changefreq: "monthly" },
  { path: "/taxi-essen-holsterhausen",           indexable: true,  priority: 0.7, changefreq: "monthly" },
  { path: "/taxi-essen-ruettenscheid",           indexable: true,  priority: 0.7, changefreq: "monthly" },
  { path: "/taxi-essen-frohnhausen",             indexable: true,  priority: 0.7, changefreq: "monthly" },
  { path: "/taxi-essen-suedviertel",             indexable: true,  priority: 0.7, changefreq: "monthly" },
  { path: "/impressum",                          indexable: true,  priority: 0.3, changefreq: "yearly"  },
  { path: "/agb",                                indexable: true,  priority: 0.3, changefreq: "yearly"  },
  { path: "/datenschutz",                        indexable: true,  priority: 0.3, changefreq: "yearly"  },
  { path: "/confirmation",                       indexable: false, priority: 0.0, changefreq: "monthly" },
  { path: "/admin",                              indexable: false, priority: 0.0, changefreq: "monthly" },
];

export const indexableRoutes = routeConfigs.filter((r) => r.indexable);
