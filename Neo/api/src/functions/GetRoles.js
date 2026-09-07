const { app } = require("@azure/functions");

// Azure roept dit ná Entra-login aan om de app-rollen te bepalen.
// mentoren/vakdocenten → 'docent', beheerders → 'admin', overig schooldomein → 'leerling'.
// Configureer via app-settings: MENTOR_EMAILS, ADMIN_EMAILS (komma-gescheiden), SCHOOL_DOMAIN.
app.http("GetRoles", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request) => {
    const body = await request.json().catch(() => ({}));
    const email = (body.userDetails || "").toLowerCase();
    const lijst = (v) => (process.env[v] || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
    const mentoren = lijst("MENTOR_EMAILS");
    const admins = lijst("ADMIN_EMAILS");
    const domein = (process.env.SCHOOL_DOMAIN || "").toLowerCase();

    const roles = [];
    if (admins.includes(email)) roles.push("admin");
    else if (mentoren.includes(email)) roles.push("docent");
    else if (domein && email.endsWith("@" + domein)) roles.push("leerling");
    // Geen match → geen app-rol (gebruiker komt nergens binnen behalve publieke pagina's).

    return { jsonBody: { roles } };
  },
});
