const { app } = require("@azure/functions");
const { getPrincipal, heeftRol } = require("../lib/principal");
const { zorgTabel } = require("../lib/table");

// Leerling schrijft voortgang weg; mentor/beheerder leest (van de hele school).
app.http("voortgang", {
  methods: ["GET", "POST"],
  authLevel: "anonymous", // SWA schermt de route al af via allowedRoles
  handler: async (request) => {
    const p = getPrincipal(request);
    if (!p) return { status: 401 };
    const t = await zorgTabel("progress");

    if (request.method === "POST") {
      const b = await request.json().catch(() => ({}));
      const entity = {
        partitionKey: "school",
        rowKey: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        leerlingId: p.userId, leerlingEmail: p.email,
        challenge: b.challenge ?? null, niveau: b.niveau ?? null,
        score: b.score ?? null, xp: Number(b.xp) || 0,
      };
      await t.createEntity(entity);
      return { jsonBody: { ok: true } };
    }

    // GET — mentor/beheerder: alles; leerling: alleen eigen voortgang.
    const rijen = [];
    for await (const e of t.listEntities()) rijen.push(e);
    const eigen = heeftRol(p, "docent", "admin") ? rijen : rijen.filter((r) => r.leerlingId === p.userId);
    eigen.sort((a, b) => (a.rowKey < b.rowKey ? 1 : -1));
    return { jsonBody: eigen.slice(0, 200) };
  },
});
