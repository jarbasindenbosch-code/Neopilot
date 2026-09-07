# Unfold Neo op Azure Static Web Apps (Microsoft-native, vanaf GitHub)

Deze versie draait **vanaf je GitHub-repo** en gebruikt Microsoft-diensten i.p.v.
Supabase: inloggen via **Entra ID**, rollen server-afgedwongen door Azure, en
data in **Azure Table Storage** via **Azure Functions**. Geen Supabase meer.

## Waarom dit jouw eisen dekt

- **Inloggen met Office 365**: Entra ID (single-tenant → alleen jullie accounts).
- **Harde scheiding**: `staticwebapp.config.json` bepaalt per route welke rol mag.
  Azure dwingt dit af aan de rand — een leerling die `/docent/` opent krijgt 403
  (→ "geen toegang"), een mentor die `/leerling/` opent net zo. Niet te omzeilen
  via de browser.
- **10 mentoren / 4 klassen**: rollen worden automatisch toegekend (zie stap 4).

## Structuur

```
app/                     statische frontend
  index.html             landing + "Inloggen met Microsoft"
  na-login.html          stuurt door naar de eigen omgeving
  leerling/              leerlingomgeving (hier plaats je de NEO-app)
  docent/                mentor/vakdocent-dashboard (klassen + voortgang)
  assets/neo/            NEO-varianten (WebP)
  shared.js              haalt gebruiker + rollen op
  geen-toegang.html      403-pagina
api/                     Azure Functions
  GetRoles               Entra-gebruiker → app-rol (leerling/docent/admin)
  voortgang              voortgang opslaan/lezen
  klassen                klassen + leden
staticwebapp.config.json ROUTES + ROLLEN (de harde scheiding)
.github/workflows/       automatische deploy vanaf GitHub
```

## Stap 1 · GitHub-repo

Zet deze map in een repo en push naar `main`.

## Stap 2 · Azure Static Web App aanmaken

1. Azure-portal → **Create a resource → Static Web App**.
2. Plan: **Standard** (nodig voor eigen Entra-config en custom rollen).
3. **Deployment**: koppel je GitHub-repo + branch `main`.
4. Build details: **App location** `app`, **Api location** `api`,
   **Output location** leeg. Azure maakt automatisch de GitHub Actions-workflow
   (of gebruikt de meegeleverde) en zet de deploy-token als repo-secret
   `AZURE_STATIC_WEB_APPS_API_TOKEN`.

## Stap 3 · Entra ID-app registreren (login)

1. Azure → **Microsoft Entra ID → App registrations → New registration**.
   - Single tenant (alleen jullie school).
   - Redirect URI (Web): `https://<jouw-swa>.azurestaticapps.net/.auth/login/aad/callback`
2. Noteer **Application (client) ID** en **Directory (tenant) ID**; maak onder
   **Certificates & secrets** een client secret.
3. In `staticwebapp.config.json`: vervang `AAD_TENANT_ID` door je tenant-id.
4. In de Static Web App → **Configuration → Application settings** zet:
   - `AAD_CLIENT_ID` = client-id
   - `AAD_CLIENT_SECRET` = secret

## Stap 4 · Rollen automatisch toekennen

De functie `GetRoles` bepaalt de rol op basis van app-settings (Configuration):
- `MENTOR_EMAILS` = komma-gescheiden e-mails van de ± 10 mentoren/vakdocenten → rol **docent**
- `ADMIN_EMAILS` = e-mails van beheerders → rol **admin**
- `SCHOOL_DOMAIN` = bv. `parmant.nl` → iedereen met dat domein wordt **leerling**

Zo krijgen je 10 mentoren automatisch de mentorrol en alle leerlingen (4 klassen)
automatisch de leerlingrol — zonder handmatig uitnodigen.

## Stap 5 · Data-opslag

Maak een **Storage account** (of gebruik Cosmos DB Table API) en zet in de
Static Web App-settings:
- `TABLES_CONNECTION` = de connection string.

De functies maken de tabellen (`progress`, `classes`, `classMembers`) automatisch aan.

## Stap 6 · NEO-app inpassen (leerlingomgeving)

Open `app/leerling/index.html`. Plaats daar je NEO-app (de bundel uit
`UnfoldNeo-v19.html`) op de aangegeven plek; hij rendert in `#root`. Laat de app
bij een afgeronde challenge `saveVoortgang({ challenge, niveau, score, xp })`
aanroepen — die staat al klaar en post naar `/api/voortgang`.

## Stap 7 · Testen

- Log in met een mentor-account → je komt in `/docent/` en kunt klassen maken.
- Log in met een leerling-account → je komt in `/leerling/` (de NEO-app).
- Probeer als leerling `/docent/` te openen → **403 → geen toegang** (en andersom).
  Dat is de harde, server-afgedwongen scheiding.

## Teams (optioneel)

Voeg de SWA-URL toe als tab in Microsoft Teams (Developer Portal → Apps → Tab).
Login en rolscheiding blijven identiek.
