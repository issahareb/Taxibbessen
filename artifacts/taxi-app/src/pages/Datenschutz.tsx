import { usePageMeta } from "@/hooks/use-page-meta";
import { getPageMeta } from "@/page-meta-manifest";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { ArrowLeft, Lock, Database, UserCheck, Eye, Trash2, Globe } from "lucide-react";

const { title: _dsTitle, description: _dsDesc } = getPageMeta('/datenschutz');

export default function Datenschutz() {
  usePageMeta({ title: _dsTitle, description: _dsDesc });
  return (
    <Layout>
      <div className="min-h-screen bg-background py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">

          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Startseite
          </Link>

          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Datenschutzerklärung</h1>
          <p className="text-muted-foreground mb-10">Taxi B&B GmbH – Essen · Gemäß DSGVO & TDDDG</p>

          <div className="space-y-6">

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">1. Verantwortlicher</h2>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground">Taxi B&B GmbH</p>
                <p>Menzelstraße 8-10, 45147 Essen, Deutschland</p>
                <p>Telefon: <a href="tel:0201707060" className="text-primary hover:underline font-semibold">0201 707060</a></p>
                <p>E-Mail: <a href="mailto:taxibb@outlook.com" className="text-primary hover:underline">taxibb@outlook.com</a></p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">2. Erhobene Daten und Zweck</h2>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <p className="font-semibold text-foreground mb-1">Bei der Fahrtenbuchung:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Name und Kontaktdaten (Telefonnummer, E-Mail)</li>
                    <li>Abholadresse und Zieladresse</li>
                    <li>Gewünschter Abholzeitpunkt</li>
                    <li>Angaben zu besonderen Leistungen (z. B. Krankenfahrt)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Bei der Nutzung der Website:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>IP-Adresse (anonymisiert)</li>
                    <li>Browsertyp und -version</li>
                    <li>Zugriffszeitpunkt und aufgerufene Seiten</li>
                  </ul>
                </div>
                <p>Diese Daten werden ausschließlich zur Auftragsbearbeitung, Kundenkommunikation und Verbesserung unserer Dienstleistungen verarbeitet.</p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">3. Rechtsgrundlagen</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Die Verarbeitung Ihrer Daten erfolgt auf folgenden Rechtsgrundlagen gemäß DSGVO:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-semibold text-foreground">Art. 6 Abs. 1 lit. b DSGVO</span> – Verarbeitung zur Vertragserfüllung (Buchungsabwicklung)</li>
                  <li><span className="font-semibold text-foreground">Art. 6 Abs. 1 lit. c DSGVO</span> – Erfüllung rechtlicher Verpflichtungen (z. B. Buchführungspflichten)</li>
                  <li><span className="font-semibold text-foreground">Art. 6 Abs. 1 lit. f DSGVO</span> – Berechtigte Interessen (z. B. Betrieb und Sicherheit der Website)</li>
                </ul>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">4. WhatsApp (Meta Platforms Ireland Ltd.)</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Auf unserer Website bieten wir Ihnen die Möglichkeit, uns über WhatsApp zu kontaktieren und Fahrten zu buchen. WhatsApp wird betrieben von der Meta Platforms Ireland Limited, 4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Irland.</p>
                <p>Wenn Sie den WhatsApp-Button nutzen, wird eine Verbindung zu den Servern von Meta hergestellt. Dabei können Ihre IP-Adresse sowie weitere technische Daten an Meta übermittelt werden. Die Kommunikationsinhalte (Nachrichten) werden gemäß der WhatsApp-Datenschutzrichtlinie verarbeitet.</p>
                <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung/-erfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer effizienten Kundenkommunikation).</p>
                <p>Weitere Informationen zum Datenschutz bei WhatsApp finden Sie unter: <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.whatsapp.com/legal/privacy-policy</a></p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">5. Weitergabe an Dritte</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Eine Weitergabe Ihrer personenbezogenen Daten an Dritte erfolgt grundsätzlich nicht, außer:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>soweit dies zur Vertragserfüllung erforderlich ist (z. B. Weiterleitung an den ausführenden Fahrer)</li>
                  <li>bei Krankenfahrten: Übermittlung relevanter Angaben an den Kostenträger (Krankenkasse)</li>
                  <li>wenn eine gesetzliche Verpflichtung zur Weitergabe besteht</li>
                </ul>
                <p>Eine Datenübermittlung in Drittländer außerhalb der EU findet nicht statt.</p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">6. Speicherdauer</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Buchungsdaten werden nach Abschluss des Auftrags gelöscht, sobald keine gesetzlichen Aufbewahrungspflichten mehr bestehen. Steuerrelevante Unterlagen werden gemäß § 147 AO bis zu 10 Jahre aufbewahrt.</p>
                <p>Server-Logdaten werden nach 7 Tagen automatisch gelöscht.</p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">7. Ihre Rechte</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Sie haben gemäß DSGVO folgende Rechte gegenüber uns:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><span className="font-semibold text-foreground">Auskunft</span> (Art. 15 DSGVO) – Welche Daten wir über Sie gespeichert haben</li>
                  <li><span className="font-semibold text-foreground">Berichtigung</span> (Art. 16 DSGVO) – Korrektur unrichtiger Daten</li>
                  <li><span className="font-semibold text-foreground">Löschung</span> (Art. 17 DSGVO) – Löschung Ihrer Daten</li>
                  <li><span className="font-semibold text-foreground">Einschränkung</span> (Art. 18 DSGVO) – Einschränkung der Verarbeitung</li>
                  <li><span className="font-semibold text-foreground">Widerspruch</span> (Art. 21 DSGVO) – Widerspruch gegen die Verarbeitung</li>
                  <li><span className="font-semibold text-foreground">Datenübertragbarkeit</span> (Art. 20 DSGVO) – Erhalt Ihrer Daten in maschinenlesbarem Format</li>
                </ul>
                <p className="mt-2">Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: <a href="mailto:taxibb@outlook.com" className="text-primary hover:underline font-semibold">taxibb@outlook.com</a></p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">8. Beschwerderecht</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren. Die zuständige Behörde für NRW ist:</p>
                <div className="bg-muted/50 rounded-xl p-4 mt-2 space-y-1">
                  <p className="font-semibold text-foreground">Landesbeauftragte für Datenschutz und Informationsfreiheit NRW</p>
                  <p>Postfach 20 04 44, 40102 Düsseldorf</p>
                  <p><a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.ldi.nrw.de</a></p>
                </div>
              </div>
            </section>

            <section className="bg-muted/40 border border-border rounded-2xl p-6 sm:p-8">
              <h2 className="text-base font-bold mb-3">9. Änderungen dieser Datenschutzerklärung</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, insbesondere bei Änderungen der gesetzlichen Anforderungen oder unserer Dienstleistungen. Die jeweils aktuelle Version ist auf dieser Seite abrufbar.
              </p>
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
