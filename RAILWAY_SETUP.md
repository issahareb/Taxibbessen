# Railway Deployment – Taxi B&B GmbH

## Schritt 1: Railway-Projekt anlegen

1. railway.app → „New Project" → „Deploy from GitHub repo"
2. Repo `Taxibbessen` auswählen

---

## Schritt 2: API-Server (zuerst!)

In Railway: „Add Service" → „GitHub Repo" → `Taxibbessen`

**Settings → General:**
- Root Directory: `artifacts/api-server`
- Service Name: `api-server`

**Settings → Build:**
- Build Command wird automatisch aus `railway.toml` gelesen ✓

**Settings → Variables** (alle erforderlich):
```
PORT=3000
DATABASE_URL=<Railway PostgreSQL URL>
RESEND_API_KEY=<dein Resend API Key>
NODE_ENV=production
```

Warte bis der Build erfolgreich ist. Dann kopiere die öffentliche URL des API-Servers (z.B. `https://api-server-xxxx.up.railway.app`).

---

## Schritt 3: Frontend (taxi-app)

„Add Service" → „GitHub Repo" → `Taxibbessen`

**Settings → General:**
- Root Directory: `artifacts/taxi-app`
- Service Name: `taxi-app`

**Settings → Variables:**
```
PORT=3000
BASE_PATH=/
VITE_API_URL=https://api-server-xxxx.up.railway.app
NODE_ENV=production
```

> `VITE_API_URL` = die URL vom API-Server aus Schritt 2 (ohne trailing slash)

---

## Schritt 4: PostgreSQL-Datenbank

„Add Service" → „Database" → „PostgreSQL"

Die `DATABASE_URL` wird automatisch generiert → in die API-Server-Variables eintragen.

---

## Schritt 5: Custom Domain (taxibbessen.de)

taxi-app Service → Settings → Domains → „Add Custom Domain"

Railway zeigt dir einen CNAME-Eintrag, den du bei deinem Domain-Registrar einträgst:
```
Type:  CNAME
Name:  @  (oder www)
Value: xxxx.up.railway.app
```

---

## Umgebungsvariablen Übersicht

| Variable | Service | Beschreibung |
|---|---|---|
| `PORT` | beide | Automatisch von Railway gesetzt |
| `DATABASE_URL` | api-server | PostgreSQL Verbindungs-URL |
| `RESEND_API_KEY` | api-server | E-Mail Versand (resend.com) |
| `VITE_API_URL` | taxi-app | URL des API-Servers |
| `BASE_PATH` | taxi-app | Immer `/` auf Railway |
| `NODE_ENV` | beide | `production` |
