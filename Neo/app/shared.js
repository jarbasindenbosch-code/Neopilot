// Haalt de ingelogde gebruiker + rollen op uit de SWA-auth-endpoint.
async function getGebruiker() {
  try {
    const r = await fetch("/.auth/me");
    const d = await r.json();
    const c = d.clientPrincipal;
    if (!c) return null;
    return { naam: c.userDetails, rollen: c.userRoles || [] };
  } catch { return null; }
}
function heeftRol(g, ...rollen) { return !!g && rollen.some((r) => g.rollen.includes(r)); }
// Stuurt de gebruiker naar zijn eigen omgeving.
function eigenOmgeving(g) {
  if (heeftRol(g, "admin")) return "/admin/";
  if (heeftRol(g, "docent")) return "/docent/";
  if (heeftRol(g, "leerling")) return "/leerling/";
  return "/";
}
