
(function () {
  const LS = "mova-session-v1";
  const AUTH_KEY = "mova_redactores_sesion";
  const AUTH_TTL = 8 * 60 * 60 * 1000;
  const MV = {
    cliente: "352285024176-ki6a4n01f6vcbos3o12n9ql6uc6t2vq4.apps.googleusercontent.com",
    auth: "https://grupomakingof.app.n8n.cloud/webhook/mova-auth",
    empresa: "REDACTORES"
  };
  const CFG = {
    empresa: "Grupo Making OF",
    producto: "MOVA · Portal Redactores",
    roles: {
      editor: { id: "editor", label: "Vista editor", desc: "Solo para el equipo editor. No disponible en este acceso de redactora.", soon: true },
      redactor: { id: "redactor", label: "Vista redactor", desc: "Solo los clientes asignados a esa redactora." },
      cliente: { id: "cliente", label: "Vista cliente", desc: "Pendiente. Se define después.", soon: true }
    },
    clientes: [
      { id: "paris", initials: "PR", name: "Paris", tags: ["Retail", "Ecommerce", "2 pasos"], live: true },
      { id: "jumbo", initials: "JB", name: "Jumbo", tags: ["Supermercado"], live: false },
      { id: "prisa", initials: "PS", name: "Prisa", tags: ["Librería"], live: false },
      { id: "maicao", initials: "MC", name: "Maicao", tags: ["Belleza"], live: false },
      { id: "supermercado", initials: "SM", name: "Supermercado", tags: ["Retail"], live: false }
    ]
  };

  const shell = document.getElementById("mova-shell-root");
  const MV_LOCAL = location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname || "");
  const MV_PROD = /(?:^|\.)acme-chile\.cl$/i.test(location.hostname || "");
  let MV_IFRAME = false;
  try { MV_IFRAME = window.top !== window.self; } catch (e) { MV_IFRAME = true; }

  function loadSession() {
    try { return JSON.parse(localStorage.getItem(LS) || "null"); } catch (e) { return null; }
  }
  function saveSession(s) {
    try { localStorage.setItem(LS, JSON.stringify(s)); } catch (e) {}
  }
  function loadAuth() {
    try { return JSON.parse(sessionStorage.getItem(AUTH_KEY) || "null"); } catch (e) { return null; }
  }
  function saveAuth(payload) {
    try { sessionStorage.setItem(AUTH_KEY, JSON.stringify(payload)); } catch (e) {}
  }
  function clearAuth() {
    try { sessionStorage.removeItem(AUTH_KEY); } catch (e) {}
    try { localStorage.removeItem(LS); } catch (e) {}
    window.MOVA_USER = null;
    window.MOVA_TOKEN = "";
  }
  function tokExp(t) {
    try {
      return (JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).exp || 0) * 1000;
    } catch (e) { return 0; }
  }
  function mailFromTok(t) {
    try {
      return (JSON.parse(decodeURIComponent(escape(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))))) || {}).email || "";
    } catch (e) { return ""; }
  }
  function mvAviso(t, tipo) {
    const m = document.getElementById("mvMsg");
    if (!m) return;
    m.textContent = t || "";
    m.className = "mv-msg" + (t ? " on " + (tipo || "err") : "");
  }
  function mvCerrarGate() {
    const gate = document.getElementById("mvGate");
    if (gate) {
      gate.classList.add("off");
      gate.setAttribute("aria-hidden", "true");
      gate.style.display = "none";
    }
    document.body.classList.remove("mv-lock");
  }
  function mvAbrirGate() {
    const gate = document.getElementById("mvGate");
    if (gate) {
      gate.classList.remove("off");
      gate.removeAttribute("aria-hidden");
      gate.style.display = "flex";
    }
    document.body.classList.add("mv-lock");
    document.body.classList.add("mova-in-shell");
    document.body.classList.remove("mova-in-paris");
  }

  function showShell(view) {
    document.body.classList.add("mova-in-shell");
    document.body.classList.remove("mova-in-paris");
    shell.querySelectorAll(".mova-shell-view").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-view") === view);
    });
    window.scrollTo(0, 0);
  }

  function showParis(session) {
    document.body.classList.remove("mova-in-shell");
    document.body.classList.add("mova-in-paris");
    const who = document.getElementById("msParisWho");
    const rol = document.getElementById("msParisRol");
    if (who) who.textContent = session.nombre || (window.MOVA_USER && window.MOVA_USER.nombre) || "Redactora";
    if (rol) rol.textContent = session.rol === "editor" ? "Editor" : "Redactora";
    const crumb = document.getElementById("crumbRole");
    if (crumb) crumb.textContent = "Clientes";
    window.scrollTo(0, 0);
  }

  function syncUserChip() {
    const u = window.MOVA_USER;
    const nm = (u && (u.nombre || u.correo)) || "";
    const ini = nm.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "—";
    document.querySelectorAll("[data-ms-ini]").forEach((el) => { el.textContent = ini; });
    document.querySelectorAll("[data-ms-rolc]").forEach((el) => { el.textContent = (u && String(u.rol).toLowerCase() === "editor") ? "Editor" : "Redactora"; });
    document.querySelectorAll("[data-ms-user]").forEach((el) => {
      el.textContent = u ? (u.nombre || u.correo || "") : "";
    });
  }

  function clienteListForSession(s) {
    const ids = (s && Array.isArray(s.clientes)) ? s.clientes.map((x) => String(x).toLowerCase().trim()).filter(Boolean) : [];
    if (!ids.length) return CFG.clientes.slice();
    return CFG.clientes.filter((c) => ids.includes(c.id) || ids.includes(String(c.name).toLowerCase()));
  }

  function rolLabel(r) { return String(r || "").toLowerCase() === "editor" ? "Editor" : "Redactora"; }
  function portalLabel(r) { return String(r || "").toLowerCase() === "editor" ? "Portal Redactor · rol editor" : "Portal Redactor"; }
  function syncRoleChips() {
    const u = window.MOVA_USER || {};
    document.querySelectorAll("[data-ms-rol]").forEach((el) => { el.textContent = rolLabel(u.rol); });
    document.querySelectorAll("[data-ms-portal]").forEach((el) => { el.textContent = portalLabel(u.rol); });
    document.title = "MOVA · " + portalLabel(u.rol) + " · Grupo Making OF";
  }
  function currentSession() {
    const auth = loadAuth();
    const u = (auth && auth.u) || window.MOVA_USER || {};
    const s = { rol: String(u.rol || "redactor").toLowerCase(), nombre: u.nombre || "Redactora", correo: u.correo || "",
      clientes: Array.isArray(u.clientes) ? u.clientes : [] };
    saveSession(s);
    return s;
  }
  function goHub() {
    const s = currentSession();
    const ids = (Array.isArray(s.clientes) ? s.clientes : []).map((x) => String(x).toLowerCase().trim()).filter(Boolean);
    const puede = (c) => c.live && (s.rol === "editor" || !ids.length || ids.includes(c.id) || ids.includes(c.name.toLowerCase()));
    const grid = document.getElementById("msHubGrid");
    if (grid) {
      grid.innerHTML = "";
      const vis = CFG.clientes.filter(puede);
      if (!vis.length) grid.innerHTML = '<div class="mv-err">No tienes marcas asignadas. Contacta a tu ejecutivo de Grupo Making OF.</div>';
      vis.forEach((item) => {
        const ok = true;
        const el = document.createElement("button");
        el.type = "button";
        el.className = "ms-bullet" + (ok ? " is-live" : " is-lock");
        el.innerHTML = `<div class="ms-bullet-top"><div class="ms-bullet-ico">${item.initials}</div><span class="ms-badge-live">${ok ? "LIVE" : "🔒 " + (item.live ? "Sin acceso" : "Próximo")}</span></div>
          <h3>${item.name}</h3><div class="ms-bullet-foot"><div>${(item.tags || []).map((t) => `<span class="ms-tag">${t}</span>`).join("")}</div><span class="ms-abrir">${ok ? "ABRIR ›" : ""}</span></div>`;
        if (ok) el.addEventListener("click", goInicio); else { el.disabled = true; el.setAttribute("aria-disabled", "true"); }
        grid.appendChild(el);
      });
    }
    const sb = document.getElementById("mvcMarcas");
    if (sb) sb.innerHTML = CFG.clientes.filter(puede).map((c) => puede(c)
      ? `<button type="button" class="mvc-item" data-mvc="${c.id}" data-mova-nav="inicio">${c.name} <em class="mvc-badge">LIVE</em></button>`
      : `<span class="mvc-item off" title="${c.live ? "Sin acceso" : "Próximo"}">${c.name} <em class="mvc-soon">🔒 ${c.live ? "Sin acceso" : "Próximo"}</em></span>`).join("");
    syncUserChip(); syncRoleChips();
    showShell("accesos");
  }
  let syncDone = false;
  function goInicio() {
    currentSession();
    syncUserChip(); syncRoleChips();
    showShell("inicio");
    if (!syncDone && typeof window.MOVA_PARIS_SYNC === "function") {
      syncDone = true;
      const n = document.getElementById("msSyncNote");
      const err = (t) => { if (n) { n.textContent = t; n.hidden = false; } };
      window.MOVA_PARIS_SYNC().then((r) => {
        if (n) n.hidden = true;
        if (!(r && r.ok)) err("No se pudieron cargar los datos de Paris desde n8n. Se muestra un ejemplo.");
      }).catch(() => err("Error al sincronizar con n8n."));
    }
  }
  function openParis(paso) {
    const s = currentSession();
    if (!syncDone && typeof window.MOVA_PARIS_SYNC === "function") { syncDone = true; window.MOVA_PARIS_SYNC().catch(() => {}); }
    showParis(s);
    syncRoleChips();
    if (typeof goView === "function") goView(paso === 3 ? "iniciativas" : paso === 2 ? "redaccion" : "revision");
  }
  const goAccesos = goHub, goRedactor = goHub;
  function renderRoles() {}

  function afterAuthEnter(u, tok) {
    const exp = tok ? Math.min(tokExp(tok) || 0, Date.now() + AUTH_TTL) : Date.now() + AUTH_TTL;
    const user = {
      nombre: u.nombre || "",
      correo: u.correo || "",
      nivel: u.nivel || "",
      rol: u.rol || "redactor",
      clientes: Array.isArray(u.clientes) ? u.clientes : []
    };
    saveAuth({ u: user, tok: tok || "", exp: exp });
    window.MOVA_USER = user;
    window.MOVA_TOKEN = tok || "";
    mvAviso("");
    mvCerrarGate();
    syncUserChip();

    const rol = String(user.rol || "").toLowerCase();
    // Redactor + Editor/Desarrollador (para pruebas) entran a la UI redactora de este HTML.
    if (rol === "redactor" || rol === "editor") {
      goHub();
      return;
    }
    mvAbrirGate();
    mvAviso("Tu cuenta no tiene acceso a este portal de redactores.", "err");
    clearAuth();
  }

  function mvSalir() {
    clearAuth();
    try {
      if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    } catch (e) {}
    location.reload();
  }

  function mvValidar(token) {
    mvAviso("Validando acceso…", "load");
    fetch(MV.auth, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ token: token, empresa: MV.empresa })
    })
      .then((r) => r.json())
      .then((d) => {
        d = Array.isArray(d) ? d[0] : d;
        if (d && d.ok === true) {
          const rol = String(d.rol || "").toLowerCase();
          if (rol && rol !== "redactor" && rol !== "editor") {
            mvAviso((d && d.motivo) || "Tu cuenta no está autorizada para este portal.");
            return;
          }
          afterAuthEnter({
            nombre: d.nombre || "",
            correo: d.correo || mailFromTok(token),
            nivel: d.nivel || "",
            rol: d.rol || "redactor",
            clientes: d.clientes || []
          }, token);
        } else {
          mvAviso((d && d.motivo) || "Tu cuenta no está autorizada para acceder a este portal. Contacta a tu ejecutivo de Grupo Making OF.");
        }
      })
      .catch(() => mvAviso("No pudimos validar tu acceso. Reintenta en unos segundos."));
  }

  function bootGoogle() {
    mvAviso("Inicia sesión con Google para entrar.", "load");
    const sc = document.createElement("script");
    sc.src = "https://accounts.google.com/gsi/client";
    sc.async = true;
    sc.defer = true;
    sc.onload = function () {
      try {
        google.accounts.id.initialize({
          client_id: MV.cliente,
          callback: (r) => { if (r && r.credential) mvValidar(r.credential); },
          auto_select: false,
          cancel_on_tap_outside: true
        });
        google.accounts.id.renderButton(document.getElementById("mvBtn"), {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "signin_with",
          width: 330,
          locale: "es"
        });
        mvAviso("");
      } catch (e) {
        mvAviso("No pudimos cargar el inicio de sesión de Google. Recarga la página.");
      }
    };
    sc.onerror = function () {
      mvAviso("No pudimos cargar Google. Abre el portal en acme-chile.cl e inténtalo de nuevo.");
    };
    document.head.appendChild(sc);
  }

  document.addEventListener("click", (ev) => {
    const nav = ev.target.closest("[data-mova-nav]");
    if (!nav) return;
    ev.preventDefault();
    const to = nav.getAttribute("data-mova-nav");
    if (to === "accesos" || to === "hub" || to === "shell") goHub();
    else if (to === "inicio") goInicio();
    else if (to === "keywords") openParis(1);
    else if (to === "contenidos") openParis(2);
    else if (to === "iniciativas") openParis(3);
    else if (to === "salir") mvSalir();
  });

  const back = document.getElementById("msBackShell");
  if (back) back.addEventListener("click", () => goInicio());

  renderRoles();
  document.body.classList.add("mova-in-shell");

  // Sesión Google vigente
  const previa = loadAuth();
  if (previa && previa.exp > Date.now() && previa.u && (previa.u.rol === "redactor" || previa.u.rol === "editor")) {
    window.MOVA_USER = previa.u;
    window.MOVA_TOKEN = previa.tok || "";
    mvCerrarGate();
    goHub();
    return;
  }

  // Notion / iframe preview: no trabar
  // Embebido en /mova/seo/index.html (iframe en acme-chile.cl): login Google normal, sin demo.
  if (!MV_PROD && !MV_LOCAL && location.protocol !== "file:") {
    mvAviso("Vista previa: Google no funciona aquí. Abriendo vista redactora de demostración…", "load");
    setTimeout(function () {
      afterAuthEnter({ nombre: "Vista previa", correo: "preview@local", rol: "redactor", clientes: ["paris"] }, "");
    }, 250);
    return;
  }

  if (MV_LOCAL) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mv-local";
    b.textContent = "Entrar (local, sin Google)";
    b.onclick = function () {
      afterAuthEnter({ nombre: "Adria", correo: "adria@local", rol: "redactor", nivel: "Redactor", clientes: ["paris"] }, "");
    };
    const card = document.querySelector(".mv-card");
    if (card) card.insertBefore(b, document.getElementById("mvMsg"));
  }
  if (location.protocol === "file:") {
    mvAviso("Archivo local: usa el botón de abajo o súbelo a acme-chile.cl para Google Sign-In.", "load");
    return;
  }

  bootGoogle();
})();
