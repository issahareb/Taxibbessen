import { usePageMeta } from "@/hooks/use-page-meta";
import { getPageMeta } from "@/page-meta-manifest";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { ArrowLeft, Mail, Building2, Scale, Receipt, Globe } from "lucide-react";

const { title: _impTitle, description: _impDesc } = getPageMeta('/impressum');

export default function Impressum() {
  usePageMeta({ title: _impTitle, description: _impDesc });

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Startseite
          </Link>

          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Impressum</h1>
          <p className="text-muted-foreground mb-10">Anbieterkennzeichnung der Taxi B&B GmbH</p>

          <div className="space-y-8">
            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">Unternehmensangaben</h2>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Unternehmen</dt>
                  <dd className="font-semibold text-base">Taxi B&B GmbH</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Vertreten durch</dt>
                  <dd className="font-semibold">Lukman AL-Dlemy</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Anschrift</dt>
                  <dd>Menzelstraße 8-10<br />45147 Essen<br />Deutschland</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Telefon</dt>
                  <dd>
                    <a href="tel:0201707060" className="text-primary font-semibold hover:underline">0201 707060</a>
                  </dd>
                </div>
              </dl>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">Kontakt</h2>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">E-Mail</dt>
                  <dd>
                    <a href="mailto:taxibb@outlook.com" className="text-primary hover:underline">taxibb@outlook.com</a>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Website</dt>
                  <dd className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <a href="https://www.taxibbessen.de/" className="text-primary hover:underline">www.taxibbessen.de</a>
                  </dd>
                </div>
              </dl>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">Registereintrag</h2>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Registergericht</dt>
                  <dd className="font-semibold">Amtsgericht Essen</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Handelsregisternummer</dt>
                  <dd className="font-semibold">HRB 36284</dd>
                </div>
              </dl>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">Steuerliche Angaben</h2>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Zuständiges Finanzamt</dt>
                  <dd className="font-semibold">Finanzamt Essen-Süd</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Steuernummer</dt>
                  <dd className="font-semibold">112/5753/2108</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">USt-IdNr.</dt>
                  <dd>DE452416829</dd>
                </div>
              </dl>
            </section>

            <section className="bg-muted/40 border border-border rounded-2xl p-6 sm:p-8">
              <h2 className="text-base font-bold mb-3">Haftungshinweis</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
              </p>
            </section>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Stand: {new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
