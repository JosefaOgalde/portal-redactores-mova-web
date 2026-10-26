/**
 * MOVA · Portal Redactores — accesos y fuentes
 * Grupo Making OF
 *
 * Roles:
 *  - editor   → ve todo lo que hacen los redactores (todos los clientes)
 *  - redactor → solo clientes asignados
 *  - cliente  → vista propia (pendiente)
 */
window.MOVA_CONFIG = {
  empresa: "Grupo Making OF",
  producto: "MOVA · Portal Redactores",

  roles: {
    editor: {
      id: "editor",
      label: "Vista editor",
      desc: "Ve el trabajo de todos los redactores y todos los clientes.",
      panel: "panel-general.html",
    },
    redactor: {
      id: "redactor",
      label: "Vista redactor",
      desc: "Solo los clientes asignados a ese redactor.",
      panel: "panel-redactor.html",
    },
    cliente: {
      id: "cliente",
      label: "Vista cliente",
      desc: "Pendiente. Se define después.",
      panel: "panel-cliente.html",
      soon: true,
    },
  },

  /** Clientes LIVE / próximos */
  clientes: [
    {
      id: "paris",
      initials: "PR",
      name: "Paris",
      desc: "Revisión KW + redacción. Independientes.",
      tags: ["Retail", "Ecommerce", "2 pasos"],
      live: true,
      hrefEditor: "portal-paris.html",
      hrefRedactor: "portal-paris.html?rol=redactor",
    },
  ],

  /**
   * Asignación redactor → clientes.
   * En producción vendrá de Sheet / n8n. Hoy es local para el zip.
   */
  redactores: [
    {
      id: "r-adria",
      nombre: "Adria",
      email: "",
      clientes: ["paris"],
    },
  ],

  /** Google Sheets — consolidado Paris */
  sheets: {
    spreadsheetId: "1vi7G3kqyo2paIiEqimT1A57DsgxdzlpbG3p69_6TXiM",
    urlsTrabajadas: {
      gid: "1739267264",
      url: "https://docs.google.com/spreadsheets/d/1vi7G3kqyo2paIiEqimT1A57DsgxdzlpbG3p69_6TXiM/edit?gid=1739267264#gid=1739267264",
      uso: "Buscador Histórico · URLs trabajadas · más actual → más antigua",
    },
    contenidosMes: {
      gid: "646469582",
      url: "https://docs.google.com/spreadsheets/d/1vi7G3kqyo2paIiEqimT1A57DsgxdzlpbG3p69_6TXiM/edit?gid=646469582#gid=646469582",
      uso: "Contenidos por pestaña/mes · semana más actual → más vieja",
    },
  },

  /**
   * n8n — endpoints a cablear (dejar vacío hasta tener webhook).
   * Claude + Drive debe leer los Sheets y proponer estos flujos.
   */
  n8n: {
    baseUrl: "https://grupomakingof.app.n8n.cloud",
    webhooks: {
      auth: "https://grupomakingof.app.n8n.cloud/webhook/mova-auth",
      syncHistorico: "https://grupomakingof.app.n8n.cloud/webhook/mova-sync-historico",
      syncContenidos: "https://grupomakingof.app.n8n.cloud/webhook/mova-sync-contenidos",
      revisionListo: "",
      guardarTexto: "https://grupomakingof.app.n8n.cloud/webhook/mova-guardar-texto",
      vbEditor: "https://grupomakingof.app.n8n.cloud/webhook/mova-vb-editor",
    },
    googleClientId: "352285024176-ki6a4n01f6vcbos3o12n9ql6uc6t2vq4.apps.googleusercontent.com",
    flujosPendientes: [
      "Leer Sheet URLs trabajadas → alimentar histórico del portal",
      "Leer pestañas mes del consolidado → ITEMS por Semana 1–4",
      "Al dar listo en revisión → avisar / correo (hoy Formspree local)",
      "Persistir texto HTML estructurado y VB editor fuera de localStorage",
      "Asignaciones redactor↔cliente desde Sheet o CRM",
    ],
  },
};
