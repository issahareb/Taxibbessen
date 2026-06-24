import { usePageMeta } from "@/hooks/use-page-meta";
import { getPageMeta } from "@/page-meta-manifest";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { ArrowLeft, FileText, ShieldCheck, CreditCard, AlertTriangle, Users, BookOpen } from "lucide-react";

const { title: _agbTitle, description: _agbDesc } = getPageMeta('/agb');

export default function AGB() {
  usePageMeta({ title: _agbTitle, description: _agbDesc });
  return (
    <Layout>
      <div className="min-h-screen bg-background py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">

          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Startseite
          </Link>

          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Allgemeine Geschäftsbedingungen</h1>
          <p className="text-muted-foreground mb-10">Taxi B&B GmbH – Essen</p>

          <div className="space-y-6">

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">§ 1 Geltungsbereich und Vertragsgegenstand</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung des Online-Buchungsportals der Taxi B&B GmbH, Essen, sowie alle darüber geschlossenen Beförderungsverträge.</p>
                <p>Die Bereitstellung des Buchungsportals (Website und Buchungsformular) ist für den Nutzer kostenfrei. Entgeltpflichtig ist ausschließlich die gebuchte Beförderungsleistung bzw. sonstige Dienstleistungen aus unserem Angebot.</p>
                <p>Mit Absenden einer Buchungsanfrage erkennt der Nutzer diese AGB in der zum Zeitpunkt der Buchung gültigen Fassung an. Abweichende Bedingungen des Nutzers finden keine Anwendung, es sei denn, die Taxi B&B GmbH stimmt diesen ausdrücklich schriftlich zu.</p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">§ 2 Buchung und Vertragsschluss</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Eine Buchung über unser Portal stellt ein verbindliches Angebot des Nutzers auf Abschluss eines Beförderungsvertrages dar. Der Vertrag kommt erst zustande, wenn die Taxi B&B GmbH die Buchung schriftlich (per E-Mail oder SMS) bestätigt.</p>
                <p>Für Vorbestellungen gilt: Eine Abholzeitgarantie wird nur für Buchungen übernommen, die mindestens 1 Stunde vor dem gewünschten Abholzeitpunkt zuzüglich der durchschnittlichen Fahrzeit vom Betriebssitz zur Abholadresse eingehen. Beispiel: Gewünschte Abholung am Flughafen Düsseldorf um 16:00 Uhr – Buchung muss spätestens bis 14:30 Uhr vorliegen.</p>
                <p>Bei kurzfristigen Buchungen (unter einer Stunde Vorlauf) wird die Bereitstellung nach Verfügbarkeit gewährt, ohne Abholzeitgarantie.</p>
                <p>Handelt der Nutzer im Auftrag einer dritten Person, ist dies bei der Buchung ausdrücklich anzugeben. Der Auftraggeber haftet in diesem Fall gesamtschuldnerisch mit der zu befördernden Person für das vereinbarte Entgelt.</p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">§ 3 Pflichten des Nutzers</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Der Nutzer ist verpflichtet, bei der Buchung vollständige und korrekte Angaben zu machen, insbesondere Name, Kontaktnummer, Abholadresse, Zieladresse und Abholzeit.</p>
                <p>Eine gültige Telefonnummer ist zwingend erforderlich. Kann der Nutzer mangels erreichbarer Kontaktdaten nicht über Änderungen oder Hindernisse informiert werden, haftet die Taxi B&B GmbH nicht für etwaige Schäden.</p>
                <p>Der Nutzer ist pünktlich am vereinbarten Abholort zu sein. Wartezeiten ab 5 Minuten über die vereinbarte Abholzeit hinaus können gesondert in Rechnung gestellt werden.</p>
                <p>Das Mitführen von Gepäck ist grundsätzlich gestattet, sofern es die Kapazität des gebuchten Fahrzeugs nicht überschreitet. Bei Großraumtaxis mit Vorlauf unter 6 Stunden wird keine Gewähr für die Gepäckmitnahme übernommen, wenn Personenanzahl und Gepäckmenge die Fahrzeugkapazität überschreiten.</p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">§ 4 Preise und Zahlung</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Die angezeigten Preise im Buchungsformular sind Schätzwerte und dienen der Orientierung. Der endgültige Fahrpreis richtet sich nach dem Taxameter gemäß der gültigen Taxitarifordnung der Stadt Essen, sofern keine Festpreisvereinbarung getroffen wurde.</p>
                <p>Festpreisvereinbarungen (z. B. Flughafenfahrten) sind verbindlich, wenn diese bei der Buchung ausdrücklich bestätigt wurden.</p>
                <p>Die Zahlung erfolgt in der Regel bar beim Fahrer. Kartenzahlung ist nach vorheriger Absprache möglich. Bei Rechnungsfahrten (z. B. Krankenkassen, Geschäftskunden) gelten gesonderte Konditionen.</p>
                <p>Krankenfahrten werden direkt mit der jeweiligen Krankenkasse oder dem Kostenträger abgerechnet, sofern eine gültige Verordnung vorliegt. Der Nutzer ist verpflichtet, die entsprechenden Unterlagen bereitzuhalten.</p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">§ 5 Stornierung und Änderungen</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Stornierungen sind bis 2 Stunden vor der vereinbarten Abholzeit kostenfrei möglich. Diese sind telefonisch unter <a href="tel:0201707060" className="text-primary font-semibold hover:underline">0201 707060</a> oder per E-Mail mitzuteilen.</p>
                <p>Bei Stornierungen innerhalb von 2 Stunden vor Fahrtbeginn oder Nichterscheinen am Abholort (No-Show) behält sich die Taxi B&B GmbH vor, eine Aufwandspauschale in Höhe von 50 % des vereinbarten Fahrpreises, mindestens jedoch 10,00 €, in Rechnung zu stellen.</p>
                <p>Änderungen der Buchung (Abholzeit, -ort, Ziel) sind so früh wie möglich mitzuteilen. Änderungen können nicht garantiert werden, wenn das Fahrzeug bereits unterwegs ist.</p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">§ 6 Haftung</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Die Taxi B&B GmbH haftet für Schäden, die durch vorsätzliches oder grob fahrlässiges Verhalten unserer Mitarbeiter oder Fahrer verursacht werden. Die Haftung für einfache Fahrlässigkeit ist auf den vertragstypischen, vorhersehbaren Schaden begrenzt.</p>
                <p>Bei Verspätungen infolge von Verkehrsstaus, Baustellen, höherer Gewalt (z. B. Unwetter, Eisglätte, Fahrzeugpanne) sowie sonstigen unvorhersehbaren Ereignissen ist die Haftung ausgeschlossen. Wir bitten in solchen Fällen um Verständnis.</p>
                <p>Für Gegenstände, die im Fahrzeug vergessen werden, übernehmen wir keine Haftung. Fundsachen werden 4 Wochen aufbewahrt und können telefonisch angefordert werden.</p>
                <p>Die Haftung für Personenschäden richtet sich nach den gesetzlichen Bestimmungen und ist nicht beschränkt.</p>
              </div>
            </section>

            <section className="bg-muted/40 border border-border rounded-2xl p-6 sm:p-8">
              <h2 className="text-base font-bold mb-3">§ 7 Schlussbestimmungen</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand für Kaufleute ist Essen.</p>
                <p>Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Die unwirksame Bestimmung ist durch eine wirksame zu ersetzen, die dem wirtschaftlichen Zweck am nächsten kommt.</p>
                <p>Nebenabreden, Änderungen und Ergänzungen dieser AGB bedürfen der Schriftform. Mündliche Abreden gelten nur bei schriftlicher Bestätigung durch die Taxi B&B GmbH.</p>
                <p>Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr</a>. Zur Teilnahme an einem Streitbeilegungsverfahren sind wir nicht verpflichtet, jedoch grundsätzlich bereit.</p>
              </div>
            </section>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Stand: {new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })} · Taxi B&B GmbH, Essen
            </p>

          </div>
        </div>
      </div>
    </Layout>
  );
}
