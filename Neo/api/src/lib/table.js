const { TableClient } = require("@azure/data-tables");

// Eén Table Storage-account (connection string in app-setting TABLES_CONNECTION).
const conn = process.env.TABLES_CONNECTION || "UseDevelopmentStorage=true";
const clients = {};
function tabel(naam) {
  if (!clients[naam]) {
    clients[naam] = TableClient.fromConnectionString(conn, naam, { allowInsecureConnection: true });
  }
  return clients[naam];
}
async function zorgTabel(naam) {
  const c = tabel(naam);
  try { await c.createTable(); } catch { /* bestaat al */ }
  return c;
}
module.exports = { tabel, zorgTabel };
