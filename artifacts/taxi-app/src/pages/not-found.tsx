import { Link } from "wouter";
import { Layout } from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-lg">
          <p className="text-[10rem] font-display font-bold leading-none text-primary/10 select-none">
            404
          </p>
          <h1 className="text-3xl font-display font-bold text-foreground mb-3 -mt-6">
            Seite nicht gefunden
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Diese Seite existiert leider nicht. Vielleicht hilft Ihnen ein Anruf weiter –
            wir sind rund um die Uhr für Sie da.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+492017 07060"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-6 py-3 text-base hover:bg-primary/90 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              0201 707060
            </a>
            <Link href="/">
              <a className="inline-flex items-center justify-center rounded-xl border border-border text-foreground font-semibold px-6 py-3 text-base hover:bg-muted transition-colors">
                Zur Startseite
              </a>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
