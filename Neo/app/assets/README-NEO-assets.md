# NEO Character Library — modulaire assets

De app (`UnfoldNeo-v19.tsx`) bevat alleen nog de **core-idle** NEO ingebakken.
Alle andere poses/sport-/talent-/thema-varianten zijn **losse WebP-bestanden**
die pas geladen worden wanneer de Character Selection Engine ze nodig heeft,
en daarna in-memory gecachet (één keer ophalen per sessie).

## Deploy in 2 stappen

1. **Upload** de map `neo/` (alle `*.webp` + `manifest.json`) naar je host/CDN,
   bijvoorbeeld naar `https://cdn.jouwdomein.nl/neo/`.

2. **Wijs de app naar die map** door vóór het laden van de app te zetten:
   ```html
   <script>window.NEO_ASSET_BASE = "https://cdn.jouwdomein.nl/neo/";</script>
   ```
   Zonder deze regel gebruikt de app de default `./assets/neo/` (dus assets
   naast de app hosten werkt ook out-of-the-box).

## Hoe het werkt

- `NEO_ASSET_MANIFEST` (in de app) mapt een **assetKey** → bestandsnaam.
- `loadNeoAsset(key)` haalt het bestand op, cachet het (`neoAssetCache`), en
  geeft bij een mislukte fetch netjes de core-idle terug (geen kapot beeld).
- `useNeoAsset(key)` toont direct de core-idle en swapt naar de variant zodra
  die geladen is. Een eenmaal geladen variant wordt nooit opnieuw opgehaald.

## Nieuwe variant toevoegen (onbeperkt schaalbaar)

1. Render de nieuwe pose volgens de **NEO Master Reference** (frontaal,
   transparante/witte achtergrond, één pose per beeld).
2. Optimaliseer naar WebP (~520–768px hoog) en noem hem `neo-<key>.webp`.
3. Voeg toe aan `manifest.json` én aan `NEO_ASSET_MANIFEST` in de app:
   `"<key>": "neo-<key>.webp"`.
4. Koppel de `<key>` aan een rol in `NEO_LIBRARY` (of laat de Character
   Selection Engine hem kiezen via context).

De app-bundle groeit hierdoor **niet** — je kunt eindeloos varianten toevoegen
zonder de laadtijd te verslechteren.

## Huidige varianten (15)

idle · basis · start · coach2 · think2 · sport · highfive · success2 ·
celebrate · reflect2 · football · tennis · music · running · dance

Totaal ~0,6 MB WebP (was ~5,3 MB als PNG-base64 in de bundle — 88% kleiner).
