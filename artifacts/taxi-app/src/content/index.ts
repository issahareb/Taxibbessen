import type { PageContent } from "./types";
import { content as dialysefahrtenEssen } from "./dialysefahrten-essen";
import { content as flughafentransferEssenDuesseldorf } from "./flughafentransfer-essen-duesseldorf";
import { content as grossraumtaxiEssen } from "./grossraumtaxi-essen";
import { content as krankenfahrtenEssen } from "./krankenfahrten-essen";
import { content as kurierdienstEssen } from "./kurierdienst-essen";
import { content as taxiEssenHbf } from "./taxi-essen-hbf";
import { content as taxiEssenFrohnhausen } from "./taxi-essen-frohnhausen";
import { content as taxiEssenHolsterhausen } from "./taxi-essen-holsterhausen";
import { content as taxiEssenRuettenscheid } from "./taxi-essen-ruettenscheid";
import { content as taxiEssenSuedviertel } from "./taxi-essen-suedviertel";
import { content as ueberUns } from "./ueber-uns";
import { content as fahrzeuge } from "./fahrzeuge";

const allContent: PageContent[] = [
  dialysefahrtenEssen,
  flughafentransferEssenDuesseldorf,
  grossraumtaxiEssen,
  krankenfahrtenEssen,
  kurierdienstEssen,
  taxiEssenHbf,
  taxiEssenFrohnhausen,
  taxiEssenHolsterhausen,
  taxiEssenRuettenscheid,
  taxiEssenSuedviertel,
  ueberUns,
  fahrzeuge,
];

export const PRERENDER_CONTENT: Record<string, PageContent> = Object.fromEntries(
  allContent.map((content) => [content.path, content]),
);

export type { PageContent, ContentSection, FaqItem } from "./types";
