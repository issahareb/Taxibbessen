# TaxiBB: Abgleich von Anfragen, Tracking und Benachrichtigungen

Prüfung am 4. November 2026. Quellstand: `7a9637fc130fd10446389313038e8ecb0668ff89`.

## Ergebnis und Beleggrenzen

Die ursprünglich genannten zehn E-Mails und fünf Tracking-Sitzungen sind **nicht historisch abgeglichen**. Aus dem verfügbaren Zugang folgt weder, dass fünf Anfragen verloren gingen, noch, dass genau zehn Buchungen gespeichert sind. Die unterschiedliche Bedeutung der Kennzahlen ist nachgewiesen; welcher Anteil der ursprünglichen Abweichung auf Mehrfachsendungen, fehlendes Tracking, Kontaktanfragen oder einen anderen Zeitraum entfiel, bleibt offen.

Lesend geprüft wurden GitHub-Code, Railway-Konfiguration und Produktionslogs sowie die öffentlich ausgelieferte Administrationskonsole. Der aktive API-Deploy ist `7ec5da6f-4c2c-4950-98b4-f5986b3605c8` vom 15. Oktober, Commit `178929cff341e301aee3d139cf53ae4ee8f48fa1`. Spätere ausschließlich das Frontend betreffende Commits wurden für den API-Dienst übersprungen; das allein ist kein veralteter Backend-Deploy.

Die ausgelieferte Konsole enthält `outcomes.bookings`, den Ausschluss von Testanfragen und `linkedBookingSessions`. Die Rechenwerte des geschützten Dashboards waren nicht lesbar: der anonyme GET auf `/api/analytics/overview?days=30` antwortete mit 401. Railway zeigt vorhandene Variablennamen, gibt deren Werte dem verbundenen Werkzeug jedoch nicht preis. Im lokalen Arbeitsumfeld sind weder Datenbank-/Admin-/Resend-Zugangsdaten noch eine angemeldete Railway-CLI verfügbar. Es wurde keine Produktionsdatenbank geöffnet oder geändert.

Eine ungefilterte Logabfrage für den 27. bis 29. Oktober lieferte einen POST `/api/bookings` mit HTTP 201 und unmittelbar anschließend einen erfolgreichen Resend-Annahmelog am 28. Oktober um etwa 10:53 UTC. Das belegt einen erfolgreichen API-Speicherpfad und eine zeitlich benachbarte Mailanbieter-Annahme. Der alte Mail-Log nennt keine Buchungsnummer; eine eindeutige Zuordnung oder Zustellung beim Betreiber ist dadurch nicht bewiesen. Das ist kein Gesamtbestand für diesen Monat. Für den ursprünglichen Zeitraum vor dem 17. Oktober lieferten die gezielten Logabfragen keine passenden Einträge; fehlende Logs belegen keine fehlenden Buchungen.

In beiden aktuell verbundenen persönlichen Gmail-Konten fand die gezielte Suche vom 1. Oktober bis 4. November keine passenden Buchungsbenachrichtigungen. Empfänger im Code ist das Betreiberpostfach bei Outlook, mit einer BCC-Kopie an eine andere Geschäftsadresse. Die Gmail-Suche ersetzt deshalb keinen Zugriff auf dieses Postfach oder den Mailanbieter. Keine Kundeninhalte wurden exportiert.

## Implementierte Zählregeln

| Wert/Pfad | Bedeutung | Wichtige Einschränkung |
| --- | --- | --- |
| POST `/api/bookings` | Speichert zuerst eine Fahrt- oder Textanfrage, danach asynchroner Benachrichtigungsversuch | HTTP 201 bestätigt den Serverpfad, nicht den Empfang der Antwort im Browser oder die Mailzustellung |
| Wiederholung derselben `requestKey` | Unique Constraint; unveränderte Anfrage liefert denselben Beleg mit HTTP 200 | Kein zusätzlicher Datensatz und kein zweiter Versand; geänderter Inhalt liefert 409. Neue Kennung kann neue Anfrage erzeugen |
| `outcomes.bookings` und `funnel.bookings` | Anzahl gespeicherter Buchungsdatensätze mit `is_test = false`, nach Erstellungszeit im rollierenden Zeitraum | Unabhängig von Tracking; aktuelle Testmarkierung gilt auch rückwirkend. Nicht markierte alte Tests können enthalten sein |
| POST `/api/contact` | Wartet auf Annahme der Kontaktbenachrichtigung durch Resend | Kein Buchungsdatensatz. Anbieterfehler führt zu HTTP 500 |
| `funnel.formSubmitSessions` | Unterschiedliche Sitzungen mit `form_submit` im Zeitraum, über alle Formulartypen | Mehrere Sendungen zählen einmal; enthält Kontaktformular und gegebenenfalls Testereignisse; nur mit Tracking-Einwilligung |
| `forms[].successes` | Einzelne erfasste Erfolgsereignisse nach bestätigter API-Antwort, getrennt nach Text/Fahrt/Kontakt/älterer Messung | Keine Buchungs- oder Zustellzahl. `sendBeacon`/Fetch kann ausfallen. `/track` antwortet selbst bei protokolliertem Speicherfehler mit 204 |
| `funnel.linkedBookingSessions` | Unterschiedliche Sitzungen gespeicherter Nicht-Testanfragen mit gemessenem Seitenaufruf im Zeitraum | Sitzungskorrelation, keine eindeutige Zuordnung eines Formularereignisses zu einer einzelnen Anfrage |
| Erfolgreicher Resend-Sendeaufruf | Anbieter hat Nachricht angenommen und eine Kennung zurückgegeben | Zustellung erfordert ein Zustellereignis; Postfacheingang erfordert einen Postfachnachweis |

Einwilligung, Do-Not-Track, blockierte/fehlgeschlagene Übertragung und mehrere Sendungen derselben Sitzung können Trackingzahlen gegenüber gespeicherten Anfragen reduzieren. Kontaktanfragen oder direkte E-Mails können den Postfachbestand gegenüber der Buchungszahl erhöhen. Ohne den gemeinsamen Zeitraum und private Belege lässt sich keiner dieser Effekte für den ursprünglichen Fall beziffern.

## Korrekturen

Die TaxiBB-Konsole benennt gespeicherte Hero-Anfragen, bestätigte Formular-Sitzungen und einzelne Formularereignisse ausdrücklich unterschiedlich. Sie erklärt den Ausschluss von Kontaktformular, direkten E-Mails und Tests sowie die fehlende Aussage zur Zustellung. Die bereits entsprechend differenzierte LUKAS-Anzeige benötigt keine Änderung ihrer Zählregeln.

Neue Speicher- und Wiederholungslogs enthalten die Buchungsnummer; Benachrichtigungslogs verknüpfen Buchungsnummer und Mailanbieterkennung mit dem Status `accepted` oder `failed`. Kontaktbenachrichtigungen sind separat anhand von HTTP-Anfragekennung und Mailanbieterkennung erkennbar. `accepted` bedeutet ausdrücklich nicht `delivered`. Anbieterfehler werden ohne mögliche persönliche Fehlerdetails protokolliert. Eine Antwort ohne Mailkennung gilt nicht mehr als bestätigte Annahme.

Es gibt weiterhin kein dauerhaftes Mail-Ausgangsregister und keinen Zustellwebhook. Logs ersetzen keine Zustellhistorie und können ablaufen. Es wurden keine alten Datensätze, Trackingereignisse oder Versandnachweise ergänzt. Die Änderungen werden erst nach Integration und Deployment produktiv.

## Ausführbarer lesender Abgleich

Voraussetzung: vorhandener lesender PostgreSQL-Zugang als `DATABASE_URL`, bereits installierte Projektabhängigkeiten und bestätigte UTC-Speicherung der Buchungszeitstempel. Keine Zugangsdaten in Tickets, Berichte oder Kommandohistorie kopieren. Das Skript importiert weder Anwendungsstart noch Migrationen. Es verwendet eine konsistente Transaktion mit `READ ONLY`, 30 Sekunden Abfragelimit und ausschließlich Metadatenabfragen. Bei einer anderen Datenbankzeitzone bricht es ab, bis die Zeitinterpretation geklärt ist.

Vom Repository-Verzeichnis aus, mit dem **tatsächlich ursprünglichen Vergleichszeitraum**:

```bash
node lib/db/scripts/reconcile-requests.mjs \
  --from 2026-10-01T00:00:00+02:00 \
  --to 2026-10-16T00:00:00+02:00
```

Diese Datumsgrenzen sind ein Beispiel, kein behaupteter historischer Berichtszeitraum. Anfang ist eingeschlossen, Ende ausgeschlossen. Das verhindert Doppelzählung benachbarter Zeitfenster. Ein rollierendes Dashboard muss für den Vergleich auf denselben Abrufzeitpunkt und dieselbe Grenze eingefroren werden. Es darf während des Vergleichs keine neue Anfrage am beweglichen Ende hinzukommen.

Optional nur private Metadaten aus Resend und dem Betreiberpostfach normalisieren, beispielsweise in einer **synthetischen** Datei:

```json
[
  {"kind":"booking","bookingId":17,"messageId":"example-message","timestamp":"2026-10-10T12:00:01Z","event":"accepted"},
  {"kind":"booking","bookingId":17,"messageId":"example-message","timestamp":"2026-10-10T12:00:03Z","event":"delivered"},
  {"kind":"contact","messageId":"example-contact","timestamp":"2026-10-10T13:00:01Z","event":"received"}
]
```

`bookingId` stammt aus dem Betreff `Neue Anfrage #…`, dem Mailinhalt oder einem nachgewiesenen Anbieter-/Anwendungslog, niemals aus einer bloßen zeitlichen Vermutung. Kontaktbenachrichtigungen haben keine Buchungsnummer. Direkte E-Mails werden separat gezählt und nicht als Formularnachweis importiert. Für ein und dieselbe Nachricht muss `messageId` dieselbe normalisierte Kennung verwenden; Resend-ID und RFC-Message-ID des Postfachs können verschieden sein und müssen anhand echter Metadaten zugeordnet werden. Mehrere Zustell-/Annahmeereignisse derselben Nachricht werden nicht mehrfach als Nachricht gezählt. Eine BCC-Kopie ist kein zweiter Auftrag. Namen, Betrefftexte, E-Mail-Adressen, Telefonnummern und Nachrichteninhalte sind im Import nicht erlaubt.

```bash
node lib/db/scripts/reconcile-requests.mjs \
  --from 2026-10-01T00:00:00+02:00 \
  --to 2026-10-16T00:00:00+02:00 \
  --mail-evidence /private/path/mail-metadata.json \
  --details
```

Ohne `--details` erscheinen nur Summen und Zuordnungslücken; mit `--details` zusätzlich Buchungsnummern, Zeitpunkte und zugeordnete Nachweiszahlen. Auch diese Ausgabe gehört nur in den geschützten Arbeitsbereich. Ein fehlender importierter Mailnachweis bedeutet **unbekannt**, nicht „nicht versendet“. Das Skript authentifiziert importierte Nachweise nicht selbst. Die Mail-Summen enthalten alle gelieferten Nachweise im Zeitraum; Testmails müssen beim Vergleich mit Nicht-Testanfragen separat berücksichtigt werden. Benachrichtigungen außerhalb des Fensters können zur Anfrage zugeordnet werden, erscheinen aber nicht als Mailereignisse innerhalb des Fensters. Eine Mail ohne Buchungsdatensatz im Fenster kann zu einer älteren Anfrage gehören; sie ist nicht automatisch ein Speicherfehler.

Für den finalen Befund werden benötigt: ursprünglicher identischer Zeitraum, Datenbankabzug über dieses Skript, eindeutige Buchungsnummern der Betreiber-Mails und nach Möglichkeit Resend-Zustellereignisse. Danach pro Buchungsnummer Speicherzeit, HTTP-/Browserbestätigung soweit vorhanden, Anbieterannahme und Zustellung/Postfacheingang getrennt bewerten. Sitzungskorrelation allein erlaubt keinen exakten Einzelanfragenabgleich.

## Validierung

Lokal bestanden: TypeScript-Build der Bibliotheken und API-Typecheck, API-Produktionsbuild, vorhandene Sicherheits-, Mess- und Kontaktoptionstests, neue Tests für Mailannahme/Fehler/Datenschutz sowie Diagnose-Unit-Tests. Der SQL-Abgleich wurde zusätzlich auf einer isolierten PostgreSQL-WASM-Instanz mit synthetischen Daten geprüft: zehn echte Fixture-Datensätze, ein ausgeschlossener Testdatensatz, fünf erfolgreiche Sitzungen, sechs Ereignisse inklusive Kontaktformular und ausgeschlossene Randzeitpunkte. Diese Zahlen sind ausschließlich Testwerte. Der PostgreSQL-16-Test derselben Diagnose ist in der GitHub-CI hinterlegt.

Referenzen: `artifacts/api-server/src/routes/{bookings,contact,analytics}.ts`, `artifacts/api-server/src/lib/email.ts`, `lib/db/src/schema/{bookings,analytics}.ts`, `artifacts/taxi-app/src/{hooks/use-bookings.ts,lib/analytics.ts}`, LUKAS `docs/taxibb-request-counts-2026-10-16.md` und `artifacts/lukas-ui/src/components/taxi-website-stats.tsx`.
