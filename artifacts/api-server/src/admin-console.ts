import type { Request, Response } from "express";

export function serveAdminConsole(_req: Request, res: Response): void {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(`<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Taxi B&B - Admin</title>
<style>
:root{font-family:Inter,system-ui,sans-serif;color:#f6f2e8;background:#0d0c0a}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#272015 0,#0d0c0a 45%)}
main{width:min(1100px,calc(100% - 32px));margin:0 auto;padding:40px 0 80px}
.top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px;flex-wrap:wrap}
h1{margin:0;font-size:clamp(28px,5vw,46px)}
h2{margin:0 0 14px;font-size:19px}
.muted{color:#a9a39a}
.card{background:rgba(255,255,255,.055);border:1px solid rgba(255,193,7,.2);border-radius:20px;padding:20px;box-shadow:0 16px 50px rgba(0,0,0,.3)}
.auth{max-width:480px;margin:10vh auto 0}
.field{display:grid;gap:7px;margin:14px 0}
label{font-weight:700;font-size:14px}
input,select{width:100%;border:1px solid rgba(255,255,255,.14);background:#171511;color:#fff;border-radius:12px;padding:14px;font-size:16px}
select{padding:10px 14px;font-size:14px;width:auto}
.button{border:0;border-radius:12px;padding:13px 18px;font-weight:800;cursor:pointer;background:#ffc107;color:#16120a}
.button.secondary{background:#2b2822;color:#fff}
.button.danger{background:#8f2424;color:#fff}
.button:disabled{opacity:.55;cursor:not-allowed}
.error{color:#ff9c9c;min-height:22px}
.hidden{display:none!important}
.grid{display:grid;gap:14px}
.booking{display:grid;gap:12px}
.booking-head{display:flex;justify-content:space-between;gap:12px;align-items:center}
.route{display:grid;gap:5px}
.route strong{font-size:17px}
.meta{display:flex;gap:8px;flex-wrap:wrap}
.pill{background:#28231a;border:1px solid rgba(255,193,7,.25);padding:5px 9px;border-radius:999px;font-size:12px}
.actions{display:flex;gap:8px;flex-wrap:wrap}
.tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.tab{border:1px solid rgba(255,193,7,.25);background:#1b1813;color:#cfc7ba;border-radius:999px;padding:9px 18px;font-weight:800;font-size:13px;cursor:pointer}
.tab.active{background:#ffc107;color:#16120a;border-color:#ffc107}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:18px}
.kpi{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:15px}
.kpi .value{font-size:26px;font-weight:900;color:#ffc107;line-height:1.15}
.kpi .label{font-size:12px;color:#a9a39a;margin-top:5px}
.panel{margin-bottom:16px}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{text-align:left;padding:9px 10px;border-bottom:1px solid rgba(255,255,255,.07)}
th{color:#a9a39a;font-size:11px;text-transform:uppercase;letter-spacing:.06em}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
.two-col{display:grid;gap:16px}
.bar-track{height:7px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-top:6px}
.bar-fill{height:100%;background:#ffc107;border-radius:99px}
.funnel-step{margin-bottom:13px}
.funnel-head{display:flex;justify-content:space-between;gap:10px;font-size:13px}
.funnel-head strong{font-variant-numeric:tabular-nums}
.chart-wrap{overflow-x:auto}
.empty{color:#a9a39a;font-size:13px;padding:6px 0}
@media(min-width:760px){.booking{grid-template-columns:1fr auto;align-items:center}.actions{justify-content:flex-end}.two-col{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<main>
<section id="auth" class="auth card">
  <h1>Adminzugang</h1>
  <p id="authText" class="muted">Sichere Anmeldung wird geladen...</p>
  <form id="loginForm" class="hidden">
    <div class="field"><label for="password">Passwort</label><input id="password" type="password" autocomplete="current-password" required></div>
    <button class="button" type="submit">Anmelden</button>
  </form>
  <form id="setupForm" class="hidden">
    <div class="field"><label for="setupKey">Einrichtungsschlüssel</label><input id="setupKey" type="password" autocomplete="off" required></div>
    <div class="field"><label for="newPassword">Neues Adminpasswort (mindestens 12 Zeichen)</label><input id="newPassword" type="password" autocomplete="new-password" minlength="12" required></div>
    <button class="button" type="submit">Adminzugang einrichten</button>
  </form>
  <p id="authError" class="error"></p>
</section>

<section id="dashboard" class="hidden">
  <div class="top">
    <div><h1>Adminbereich</h1><p class="muted">Buchungsanfragen und Website-Statistik</p></div>
    <button id="logout" class="button secondary">Abmelden</button>
  </div>

  <div class="tabs">
    <button id="tabBookingsBtn" class="tab active" type="button">Buchungen</button>
    <button id="tabAnalyticsBtn" class="tab" type="button">Statistiken</button>
  </div>

  <div id="tabBookings">
    <p id="dashboardError" class="error"></p>
    <div id="bookings" class="grid"></div>
  </div>

  <div id="tabAnalytics" class="hidden">
    <div class="top">
      <div class="field" style="margin:0">
        <label for="range">Zeitraum</label>
        <select id="range">
          <option value="7">Letzte 7 Tage</option>
          <option value="30" selected>Letzte 30 Tage</option>
          <option value="90">Letzte 90 Tage</option>
          <option value="365">Letzte 12 Monate</option>
        </select>
      </div>
      <button id="refreshAnalytics" class="button secondary" type="button">Aktualisieren</button>
    </div>
    <p id="analyticsError" class="error"></p>
    <div id="kpis" class="kpis"></div>
    <div class="card panel">
      <h2>Verlauf</h2>
      <div id="chart" class="chart-wrap"></div>
    </div>
    <div class="card panel">
      <h2>Weg zur Anfrage</h2>
      <div id="funnel"></div>
    </div>
    <div class="card panel">
      <h2>Meistbesuchte Seiten</h2>
      <div id="pages"></div>
    </div>
    <div class="two-col">
      <div class="card panel">
        <h2>Woher kommen die Besucher</h2>
        <div id="sources"></div>
        <h2 style="margin-top:18px">Verweisende Seiten</h2>
        <div id="referrers"></div>
      </div>
      <div class="card panel">
        <h2>Geräte</h2>
        <div id="devices"></div>
        <h2 style="margin-top:18px">Browser</h2>
        <div id="browsers"></div>
      </div>
    </div>
    <div class="card panel">
      <h2>Klicks auf Kontaktmöglichkeiten</h2>
      <div id="clicks"></div>
    </div>
  </div>
</section>
</main>
<script>
let csrfToken = "";
const byId = (id) => document.getElementById(id);

const api = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const method = (options.method || "GET").toUpperCase();
  if (csrfToken && method !== "GET" && method !== "HEAD") headers.set("X-CSRF-Token", csrfToken);
  return fetch(path, { ...options, headers, credentials: "same-origin" });
};

const showAuth = (setup) => {
  byId("dashboard").classList.add("hidden");
  byId("auth").classList.remove("hidden");
  byId("loginForm").classList.toggle("hidden", setup);
  byId("setupForm").classList.toggle("hidden", !setup);
  byId("authText").textContent = setup
    ? "Ersteinrichtung: Verwenden Sie den vorhandenen ADMIN_API_KEY einmalig als Einrichtungsschlüssel."
    : "Melden Sie sich mit Ihrem Adminpasswort an.";
};

const showDashboard = () => {
  byId("auth").classList.add("hidden");
  byId("dashboard").classList.remove("hidden");
  loadBookings();
};

const text = (value) => (value == null || value === "" ? "-" : String(value));

/* ---------- Buchungen ---------- */

function bookingCard(booking) {
  const card = document.createElement("article");
  card.className = "card booking";
  const info = document.createElement("div");
  const head = document.createElement("div");
  head.className = "booking-head";
  const name = document.createElement("strong");
  name.textContent = text(booking.customerName) + " " + text(booking.customerLastName);
  const id = document.createElement("span");
  id.className = "pill";
  id.textContent = "#" + booking.id + " · " + text(booking.status);
  head.append(name, id);
  const route = document.createElement("div");
  route.className = "route";
  const pickup = document.createElement("span");
  pickup.textContent = "Abholung: " + text(booking.pickupLocation);
  const destination = document.createElement("strong");
  destination.textContent = "Ziel: " + text(booking.destination);
  route.append(pickup, destination);
  const meta = document.createElement("div");
  meta.className = "meta";
  ["Tel: " + text(booking.customerPhone), "Personen: " + text(booking.passengerCount), booking.notes ? "Nachricht: " + booking.notes : null]
    .filter(Boolean)
    .forEach((v) => {
      const el = document.createElement("span");
      el.className = "pill";
      el.textContent = v;
      meta.appendChild(el);
    });
  info.append(head, route, meta);
  const actions = document.createElement("div");
  actions.className = "actions";
  [["accepted", "Annehmen", "button"], ["completed", "Abschließen", "button secondary"], ["rejected", "Ablehnen", "button danger"]]
    .forEach(([status, label, cls]) => {
      const button = document.createElement("button");
      button.className = cls;
      button.textContent = label;
      button.disabled = booking.status === status;
      button.onclick = () => setStatus(booking.id, status);
      actions.appendChild(button);
    });
  card.append(info, actions);
  return card;
}

async function loadBookings() {
  const container = byId("bookings");
  container.textContent = "Lade Buchungen...";
  const response = await api("/api/bookings");
  if (response.status === 401) { csrfToken = ""; showAuth(false); return; }
  if (!response.ok) { byId("dashboardError").textContent = "Buchungen konnten nicht geladen werden."; return; }
  const rows = await response.json();
  container.textContent = "";
  if (!rows.length) { container.textContent = "Keine Buchungsanfragen vorhanden."; return; }
  rows.slice().reverse().forEach((row) => container.appendChild(bookingCard(row)));
}

async function setStatus(id, status) {
  const response = await api("/api/bookings/" + id + "/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (response.status === 401 || response.status === 403) { csrfToken = ""; showAuth(false); return; }
  if (!response.ok) { byId("dashboardError").textContent = "Status konnte nicht geändert werden."; return; }
  await loadBookings();
}

/* ---------- Statistiken ---------- */

/* Every value below comes from visitor-supplied data (paths, referrer hosts),
   so it is written with textContent only. No innerHTML anywhere in here. */

function renderTable(container, columns, rows, emptyLabel) {
  container.textContent = "";
  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = emptyLabel;
    container.appendChild(empty);
    return;
  }
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  columns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column.label;
    if (column.numeric) th.className = "num";
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    columns.forEach((column) => {
      const td = document.createElement("td");
      td.textContent = column.value(row);
      if (column.numeric) td.className = "num";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.append(thead, tbody);
  container.appendChild(table);
}

function renderShareList(container, rows, labelKey, emptyLabel) {
  container.textContent = "";
  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = emptyLabel;
    container.appendChild(empty);
    return;
  }
  const total = rows.reduce((sum, row) => sum + row.sessions, 0) || 1;
  rows.forEach((row) => {
    const wrap = document.createElement("div");
    wrap.className = "funnel-step";
    const head = document.createElement("div");
    head.className = "funnel-head";
    const label = document.createElement("span");
    label.textContent = text(row[labelKey]);
    const value = document.createElement("strong");
    const share = Math.round((row.sessions / total) * 100);
    value.textContent = row.sessions + " (" + share + "%)";
    head.append(label, value);
    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = share + "%";
    track.appendChild(fill);
    wrap.append(head, track);
    container.appendChild(wrap);
  });
}

function renderKpis(summary) {
  const container = byId("kpis");
  container.textContent = "";
  [
    [summary.sessions, "Besuche"],
    [summary.pageviews, "Seitenaufrufe"],
    [summary.pageviewsPerSession, "Seiten pro Besuch"],
    [summary.avgActiveSecondsPerSession + " s", "Verweildauer pro Besuch"],
    [summary.avgScrollDepth + " %", "Mittlere Scrolltiefe"],
  ].forEach(([value, label]) => {
    const card = document.createElement("div");
    card.className = "kpi";
    const v = document.createElement("div");
    v.className = "value";
    v.textContent = String(value);
    const l = document.createElement("div");
    l.className = "label";
    l.textContent = label;
    card.append(v, l);
    container.appendChild(card);
  });
}

/* Hand-rolled SVG chart: no external chart library is loaded, which keeps the
   admin page self-contained and free of third-party requests. */
function renderChart(timeline) {
  const container = byId("chart");
  container.textContent = "";
  if (!timeline.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Noch keine Daten für diesen Zeitraum.";
    container.appendChild(empty);
    return;
  }

  const NS = "http://www.w3.org/2000/svg";
  // Short ranges stretch to fill the card; long ranges keep a fixed pixel
  // width per day and scroll instead of squeezing 365 bars into the card.
  const naturalWidth = timeline.length * 26;
  const scrolls = naturalWidth > 900;
  const width = scrolls ? naturalWidth : 900;
  const height = 220;
  const padding = { top: 16, right: 12, bottom: 30, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...timeline.map((d) => d.pageviews), 1);

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  if (scrolls) {
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
  } else {
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", String(height));
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  }

  [0, 0.5, 1].forEach((ratio) => {
    const y = padding.top + plotHeight - ratio * plotHeight;
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", String(padding.left));
    line.setAttribute("x2", String(width - padding.right));
    line.setAttribute("y1", String(y));
    line.setAttribute("y2", String(y));
    line.setAttribute("stroke", "rgba(255,255,255,0.1)");
    svg.appendChild(line);

    const label = document.createElementNS(NS, "text");
    label.setAttribute("x", String(padding.left - 8));
    label.setAttribute("y", String(y + 4));
    label.setAttribute("text-anchor", "end");
    label.setAttribute("fill", "#a9a39a");
    label.setAttribute("font-size", "10");
    label.textContent = String(Math.round(maxValue * ratio));
    svg.appendChild(label);
  });

  const barWidth = Math.max(4, (plotWidth / timeline.length) * 0.55);

  timeline.forEach((point, index) => {
    const centre = padding.left + (plotWidth / timeline.length) * (index + 0.5);
    const barHeight = (point.pageviews / maxValue) * plotHeight;

    const bar = document.createElementNS(NS, "rect");
    bar.setAttribute("x", String(centre - barWidth / 2));
    bar.setAttribute("y", String(padding.top + plotHeight - barHeight));
    bar.setAttribute("width", String(barWidth));
    bar.setAttribute("height", String(Math.max(0, barHeight)));
    bar.setAttribute("rx", "2");
    bar.setAttribute("fill", "rgba(255,193,7,0.75)");
    const title = document.createElementNS(NS, "title");
    title.textContent = point.day + ": " + point.pageviews + " Aufrufe, " + point.sessions + " Besuche";
    bar.appendChild(title);
    svg.appendChild(bar);
  });

  const sessionPoints = timeline
    .map((point, index) => {
      const centre = padding.left + (plotWidth / timeline.length) * (index + 0.5);
      const y = padding.top + plotHeight - (point.sessions / maxValue) * plotHeight;
      return centre.toFixed(1) + "," + y.toFixed(1);
    })
    .join(" ");
  const sessionLine = document.createElementNS(NS, "polyline");
  sessionLine.setAttribute("points", sessionPoints);
  sessionLine.setAttribute("fill", "none");
  sessionLine.setAttribute("stroke", "#7fd1ff");
  sessionLine.setAttribute("stroke-width", "2");
  svg.appendChild(sessionLine);

  const step = Math.ceil(timeline.length / 10);
  timeline.forEach((point, index) => {
    if (index % step !== 0 && index !== timeline.length - 1) return;
    const centre = padding.left + (plotWidth / timeline.length) * (index + 0.5);
    const label = document.createElementNS(NS, "text");
    label.setAttribute("x", String(centre));
    label.setAttribute("y", String(height - 10));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", "#a9a39a");
    label.setAttribute("font-size", "10");
    label.textContent = point.day.slice(5);
    svg.appendChild(label);
  });

  container.appendChild(svg);

  const legend = document.createElement("p");
  legend.className = "empty";
  legend.textContent = "Balken: Seitenaufrufe · Linie: Besuche";
  container.appendChild(legend);
}

function renderFunnel(funnel) {
  const container = byId("funnel");
  container.textContent = "";
  const base = funnel.visitors || 1;
  [
    ["Besuche", funnel.visitors],
    ["Klick auf Kontaktmöglichkeit", funnel.ctaSessions],
    ["Formular begonnen", funnel.formStartSessions],
    ["Formular abgesendet", funnel.formSubmitSessions],
    ["Buchungsanfragen im System", funnel.bookings],
  ].forEach(([label, value]) => {
    const wrap = document.createElement("div");
    wrap.className = "funnel-step";
    const head = document.createElement("div");
    head.className = "funnel-head";
    const name = document.createElement("span");
    name.textContent = label;
    const amount = document.createElement("strong");
    const share = Math.min(100, Math.round((value / base) * 100));
    amount.textContent = value + " (" + share + "%)";
    head.append(name, amount);
    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = share + "%";
    track.appendChild(fill);
    wrap.append(head, track);
    container.appendChild(wrap);
  });

  const note = document.createElement("p");
  note.className = "empty";
  note.textContent = "Buchungsanfragen zählen alle im System angelegten Anfragen im Zeitraum, auch telefonisch entstandene ohne Zustimmung zur Messung.";
  container.appendChild(note);
}

async function loadAnalytics() {
  const days = byId("range").value;
  byId("analyticsError").textContent = "";
  const response = await api("/api/analytics/overview?days=" + encodeURIComponent(days));
  if (response.status === 401) { csrfToken = ""; showAuth(false); return; }
  if (!response.ok) { byId("analyticsError").textContent = "Statistiken konnten nicht geladen werden."; return; }
  const data = await response.json();

  renderKpis(data.summary);
  renderChart(data.timeline);
  renderFunnel(data.funnel);

  renderTable(
    byId("pages"),
    [
      { label: "Seite", value: (row) => row.path },
      { label: "Aufrufe", numeric: true, value: (row) => String(row.pageviews) },
      { label: "Besuche", numeric: true, value: (row) => String(row.sessions) },
      { label: "Verweildauer", numeric: true, value: (row) => row.avgActiveSeconds + " s" },
      { label: "Scrolltiefe", numeric: true, value: (row) => row.avgScrollDepth + " %" },
    ],
    data.pages,
    "Noch keine Seitenaufrufe im Zeitraum.",
  );

  const sourceLabels = { direct: "Direkt", search: "Suchmaschine", social: "Social Media", referral: "Andere Website" };
  renderShareList(
    byId("sources"),
    data.sources.map((row) => ({ label: sourceLabels[row.sourceCategory] || row.sourceCategory, sessions: row.sessions })),
    "label",
    "Noch keine Daten.",
  );
  renderShareList(byId("referrers"), data.referrers.map((row) => ({ label: row.referrerHost, sessions: row.sessions })), "label", "Keine verweisenden Seiten erfasst.");

  const deviceLabels = { mobile: "Mobil", tablet: "Tablet", desktop: "Desktop" };
  renderShareList(
    byId("devices"),
    data.devices.map((row) => ({ label: deviceLabels[row.deviceType] || row.deviceType, sessions: row.sessions })),
    "label",
    "Noch keine Daten.",
  );
  renderShareList(byId("browsers"), data.browsers.map((row) => ({ label: row.browser, sessions: row.sessions })), "label", "Noch keine Daten.");

  const clickLabels = { phone: "Anruf", whatsapp: "WhatsApp", email: "E-Mail", google_maps: "Google Maps" };
  renderTable(
    byId("clicks"),
    [
      { label: "Ziel", value: (row) => clickLabels[row.target] || row.target },
      { label: "Klicks", numeric: true, value: (row) => String(row.clicks) },
      { label: "Besuche", numeric: true, value: (row) => String(row.sessions) },
    ],
    data.clicks,
    "Noch keine Klicks erfasst.",
  );
}

/* ---------- Tabs und Events ---------- */

function selectTab(name) {
  const isAnalytics = name === "analytics";
  byId("tabBookings").classList.toggle("hidden", isAnalytics);
  byId("tabAnalytics").classList.toggle("hidden", !isAnalytics);
  byId("tabBookingsBtn").classList.toggle("active", !isAnalytics);
  byId("tabAnalyticsBtn").classList.toggle("active", isAnalytics);
  if (isAnalytics) loadAnalytics();
}

byId("tabBookingsBtn").addEventListener("click", () => selectTab("bookings"));
byId("tabAnalyticsBtn").addEventListener("click", () => selectTab("analytics"));
byId("refreshAnalytics").addEventListener("click", () => loadAnalytics());
byId("range").addEventListener("change", () => loadAnalytics());

byId("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  byId("authError").textContent = "";
  const response = await api("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: byId("password").value }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    byId("authError").textContent = response.status === 429
      ? "Zu viele Fehlversuche. Bitte später erneut versuchen."
      : "Anmeldung fehlgeschlagen.";
    return;
  }
  csrfToken = data.csrfToken;
  showDashboard();
});

byId("setupForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  byId("authError").textContent = "";
  const response = await api("/api/admin/setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ setupKey: byId("setupKey").value, password: byId("newPassword").value }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { byId("authError").textContent = data.error || "Einrichtung fehlgeschlagen."; return; }
  csrfToken = data.csrfToken;
  showDashboard();
});

byId("logout").addEventListener("click", async () => {
  await api("/api/admin/logout", { method: "POST" });
  csrfToken = "";
  showAuth(false);
});

(async () => {
  const response = await api("/api/admin/session");
  const data = await response.json().catch(() => ({}));
  if (response.ok) { csrfToken = data.csrfToken; showDashboard(); return; }
  showAuth(Boolean(data.setupRequired));
})();
</script>
</body>
</html>`);
}
