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
:root{font-family:Inter,system-ui,sans-serif;color:#f6f2e8;background:#0d0c0a}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#272015 0,#0d0c0a 45%)}main{width:min(1100px,calc(100% - 32px));margin:0 auto;padding:40px 0 80px}.top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px}h1{margin:0;font-size:clamp(28px,5vw,46px)}.muted{color:#a9a39a}.card{background:rgba(255,255,255,.055);border:1px solid rgba(255,193,7,.2);border-radius:20px;padding:20px;box-shadow:0 16px 50px rgba(0,0,0,.3)}.auth{max-width:480px;margin:10vh auto 0}.field{display:grid;gap:7px;margin:14px 0}label{font-weight:700;font-size:14px}input{width:100%;border:1px solid rgba(255,255,255,.14);background:#171511;color:#fff;border-radius:12px;padding:14px;font-size:16px}.button{border:0;border-radius:12px;padding:13px 18px;font-weight:800;cursor:pointer;background:#ffc107;color:#16120a}.button.secondary{background:#2b2822;color:#fff}.button.danger{background:#8f2424;color:#fff}.button:disabled{opacity:.55;cursor:not-allowed}.error{color:#ff9c9c;min-height:22px}.hidden{display:none!important}.grid{display:grid;gap:14px}.booking{display:grid;gap:12px}.booking-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.route{display:grid;gap:5px}.route strong{font-size:17px}.meta{display:flex;gap:8px;flex-wrap:wrap}.pill{background:#28231a;border:1px solid rgba(255,193,7,.25);padding:5px 9px;border-radius:999px;font-size:12px}.actions{display:flex;gap:8px;flex-wrap:wrap}@media(min-width:760px){.booking{grid-template-columns:1fr auto;align-items:center}.actions{justify-content:flex-end}}
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
  <div class="top"><div><h1>Buchungsanfragen</h1><p class="muted">Geschützter Adminbereich</p></div><button id="logout" class="button secondary">Abmelden</button></div>
  <p id="dashboardError" class="error"></p>
  <div id="bookings" class="grid"></div>
</section>
</main>
<script>
let csrfToken="";
const byId=(id)=>document.getElementById(id);
const api=async(path,options={})=>{const headers=new Headers(options.headers||{});const method=(options.method||"GET").toUpperCase();if(csrfToken&&method!=="GET"&&method!=="HEAD")headers.set("X-CSRF-Token",csrfToken);return fetch(path,{...options,headers,credentials:"same-origin"});};
const showAuth=(setup)=>{byId("dashboard").classList.add("hidden");byId("auth").classList.remove("hidden");byId("loginForm").classList.toggle("hidden",setup);byId("setupForm").classList.toggle("hidden",!setup);byId("authText").textContent=setup?"Ersteinrichtung: Verwenden Sie den vorhandenen ADMIN_API_KEY einmalig als Einrichtungsschlüssel.":"Melden Sie sich mit Ihrem Adminpasswort an.";};
const showDashboard=()=>{byId("auth").classList.add("hidden");byId("dashboard").classList.remove("hidden");loadBookings();};
const text=(value)=>value==null||value===""?"-":String(value);
function bookingCard(booking){const card=document.createElement("article");card.className="card booking";const info=document.createElement("div");const head=document.createElement("div");head.className="booking-head";const name=document.createElement("strong");name.textContent=text(booking.customerName)+" "+text(booking.customerLastName);const id=document.createElement("span");id.className="pill";id.textContent="#"+booking.id+" · "+text(booking.status);head.append(name,id);const route=document.createElement("div");route.className="route";const pickup=document.createElement("span");pickup.textContent="Abholung: "+text(booking.pickupLocation);const destination=document.createElement("strong");destination.textContent="Ziel: "+text(booking.destination);route.append(pickup,destination);const meta=document.createElement("div");meta.className="meta";["Tel: "+text(booking.customerPhone),"Personen: "+text(booking.passengerCount),booking.notes?"Nachricht: "+booking.notes:null].filter(Boolean).forEach(v=>{const el=document.createElement("span");el.className="pill";el.textContent=v;meta.appendChild(el);});info.append(head,route,meta);const actions=document.createElement("div");actions.className="actions";[["accepted","Annehmen","button"],["completed","Abschließen","button secondary"],["rejected","Ablehnen","button danger"]].forEach(([status,label,cls])=>{const button=document.createElement("button");button.className=cls;button.textContent=label;button.disabled=booking.status===status;button.onclick=()=>setStatus(booking.id,status);actions.appendChild(button);});card.append(info,actions);return card;}
async function loadBookings(){const container=byId("bookings");container.textContent="Lade Buchungen...";const response=await api("/api/bookings");if(response.status===401){csrfToken="";showAuth(false);return;}if(!response.ok){byId("dashboardError").textContent="Buchungen konnten nicht geladen werden.";return;}const rows=await response.json();container.textContent="";if(!rows.length){container.textContent="Keine Buchungsanfragen vorhanden.";return;}rows.slice().reverse().forEach(row=>container.appendChild(bookingCard(row)));}
async function setStatus(id,status){const response=await api("/api/bookings/"+id+"/status",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});if(response.status===401||response.status===403){csrfToken="";showAuth(false);return;}if(!response.ok){byId("dashboardError").textContent="Status konnte nicht geändert werden.";return;}await loadBookings();}
byId("loginForm").addEventListener("submit",async(event)=>{event.preventDefault();byId("authError").textContent="";const response=await api("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:byId("password").value})});const data=await response.json().catch(()=>({}));if(!response.ok){byId("authError").textContent=response.status===429?"Zu viele Fehlversuche. Bitte später erneut versuchen.":"Anmeldung fehlgeschlagen.";return;}csrfToken=data.csrfToken;showDashboard();});
byId("setupForm").addEventListener("submit",async(event)=>{event.preventDefault();byId("authError").textContent="";const response=await api("/api/admin/setup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({setupKey:byId("setupKey").value,password:byId("newPassword").value})});const data=await response.json().catch(()=>({}));if(!response.ok){byId("authError").textContent=data.error||"Einrichtung fehlgeschlagen.";return;}csrfToken=data.csrfToken;showDashboard();});
byId("logout").addEventListener("click",async()=>{await api("/api/admin/logout",{method:"POST"});csrfToken="";showAuth(false);});
(async()=>{const response=await api("/api/admin/session");const data=await response.json().catch(()=>({}));if(response.ok){csrfToken=data.csrfToken;showDashboard();return;}showAuth(Boolean(data.setupRequired));})();
</script>
</body>
</html>`);
}
