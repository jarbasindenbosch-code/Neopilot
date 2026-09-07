// Leest de ingelogde Entra-gebruiker uit de SWA-header (server-side, betrouwbaar).
function getPrincipal(request) {
  const header = request.headers.get("x-ms-client-principal");
  if (!header) return null;
  try {
    const json = Buffer.from(header, "base64").toString("utf8");
    const p = JSON.parse(json);
    return {
      userId: p.userId,
      email: (p.userDetails || "").toLowerCase(),
      roles: p.userRoles || [],
    };
  } catch { return null; }
}
function heeftRol(p, ...rollen) {
  return !!p && rollen.some((r) => p.roles.includes(r));
}
module.exports = { getPrincipal, heeftRol };
