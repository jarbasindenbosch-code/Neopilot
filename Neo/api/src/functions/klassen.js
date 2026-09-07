const { app } = require("@azure/functions");
const { getPrincipal, heeftRol } = require("../lib/principal");
const { zorgTabel } = require("../lib/table");

// Klassen + leden (alleen mentor/vakdocent/beheerder). Route is al afgeschermd door SWA.
app.http("klassen", {
  methods: ["GET", "POST", "DELETE"],
  authLevel: "anonymous",
  handler: async (request) => {
    const p = getPrincipal(request);
    if (!heeftRol(p, "docent", "admin")) return { status: 403 };
    const klassen = await zorgTabel("classes");
    const leden = await zorgTabel("classMembers");

    if (request.method === "POST") {
      const b = await request.json().catch(() => ({}));
      if (b.action === "create") {
        const id = Math.random().toString(36).slice(2, 10);
        await klassen.createEntity({ partitionKey: "school", rowKey: id, naam: b.naam });
        return { jsonBody: { id } };
      }
      if (b.action === "addMember") {
        await leden.createEntity({ partitionKey: b.classId, rowKey: b.leerlingId, naam: b.naam ?? "" });
        return { jsonBody: { ok: true } };
      }
      return { status: 400 };
    }

    if (request.method === "DELETE") {
      const u = new URL(request.url);
      const classId = u.searchParams.get("classId");
      const leerlingId = u.searchParams.get("leerlingId");
      await leden.deleteEntity(classId, leerlingId);
      return { jsonBody: { ok: true } };
    }

    // GET — lijst klassen met ledenaantal.
    const lijst = [];
    for await (const k of klassen.listEntities()) {
      let n = 0;
      for await (const _ of leden.listEntities({ queryOptions: { filter: `PartitionKey eq '${k.rowKey}'` } })) n++;
      lijst.push({ id: k.rowKey, naam: k.naam, leden: n });
    }
    return { jsonBody: lijst };
  },
});
