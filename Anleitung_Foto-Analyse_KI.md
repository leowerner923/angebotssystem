# Feature: KI-Foto-Analyse (Aufwands-Vorschlag aus Kundenfotos)

**Auftrag für Claude Code.** Projekt: `~/angebotssystem`, Branch `maler-demo`.

## Ziel

Der Maler klickt im Dashboard bei einer Anfrage auf **»Fotos analysieren«**. Ein Vision-Modell schaut sich die hochgeladenen Kundenfotos an und liefert eine **Einschätzung als Vorschlag**: geschätzte Fläche, Untergrundzustand, nötige Vorarbeiten, Auffälligkeiten. Der Maler entscheidet, ob er das übernimmt.

**Grundprinzip: Vorschlag, niemals automatische Kalkulation.** Der Maler behält sichtbar die Kontrolle — das ist auch das zentrale Verkaufsargument. Die KI-Schätzung überschreibt niemals Preise oder Angebotspositionen.

## Bestehender Stand (nicht neu bauen)

- Tabelle `requests`, Spalte `foto_pfade` (`string[] | null`) — enthält **relative Storage-Pfade**, keine URLs. Format `{uuid-ordner}/{timestamp}-{dateiname}`
- Storage-Bucket `anfrage-fotos`
- Upload läuft clientseitig in `modules/wizard/components/FotoUpload.tsx`
- Anzeige in `modules/dashboard/components/RequestsTable.tsx`
- API-Routes liegen in `app/api/<name>/route.ts`, serverseitig mit `SUPABASE_SERVICE_ROLE_KEY`
- Vorhandene Env-Vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`

---

## Schritt 1 — Datenbank

Neue Spalte auf `requests` für das Analyse-Ergebnis:

```sql
alter table requests add column foto_analyse jsonb;
```

Im Supabase SQL-Editor ausführen. Zusätzlich als Migration unter `supabase/migrations/` ablegen (Namensschema wie `20260410_create_offers_table.sql`), damit das Schema versioniert ist — für `foto_pfade` fehlt die Migration bisher, die darf gleich mit nachgezogen werden.

Typ in `lib/types/database.ts` ergänzen:

```ts
foto_analyse: {
  flaeche_geschaetzt_m2: number | null
  untergrund: string | null
  vorarbeiten: string[]
  auffaelligkeiten: string[]
  sicherheit: 'hoch' | 'mittel' | 'niedrig'
  hinweis: string
  erstellt_am: string
} | null
```

## Schritt 2 — Environment-Variable

Neu in `.env.local` **und** in Vercel (Settings → Environment Variables):

```
OPENAI_API_KEY=sk-...
```

Den Key gibt es auf platform.openai.com → API keys (dort auch das vorhandene Guthaben prüfen). Serverseitig, kein `NEXT_PUBLIC_` davor — der Key darf nie im Browser landen. Nach dem Eintragen in Vercel einmal neu deployen.

Zusätzlich eine `.env.example` anlegen (nur Namen, keine Werte), damit das Setup nachvollziehbar bleibt.

## Schritt 3 — API-Route `app/api/analyze-photos/route.ts`

Ablauf:

1. `requestId` aus dem Body lesen, validieren
2. Mit Service-Role-Client die Anfrage laden: `foto_pfade`, `leistung`, `flaeche` (bestehende Feldnamen aus der Tabelle übernehmen)
3. Wenn keine Fotos vorhanden → 400 mit klarer Meldung zurück
4. Maximal 5 Fotos verarbeiten. Jedes per `supabase.storage.from('anfrage-fotos').download(pfad)` holen und nach Base64 wandeln (nicht über öffentliche URLs gehen — serverseitiger Download ist unabhängig davon, ob der Bucket später privat wird)
5. Anfrage an die OpenAI Chat-Completions-API (`https://api.openai.com/v1/chat/completions`) mit den Bildern plus Text-Prompt
6. Antwort als JSON parsen, `erstellt_am` ergänzen, in `requests.foto_analyse` speichern
7. Ergebnis zurückgeben

Wichtig für den Aufruf:

- Header: `Authorization: Bearer ${process.env.OPENAI_API_KEY}`, `Content-Type: application/json`
- **Modell:** ein aktuelles Vision-fähiges Modell verwenden. Bitte vorher in der OpenAI-Doku prüfen, welches gerade aktuell und günstig ist — reine Text-Modelle können keine Bilder verarbeiten.
- Bilder als Data-URL im Content-Array:
  `{ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,<base64>' } }`
  Den Media-Type aus dem tatsächlichen Dateityp ableiten. HEIC vorher aussortieren oder ablehnen.
- Optional `detail: 'low'` bei den Bildern setzen, wenn Kosten gespart werden sollen — für eine grobe Flächenschätzung reicht das oft.
- `response_format: { type: 'json_object' }` setzen, damit garantiert JSON zurückkommt. Antwort trotzdem defensiv parsen (Fences strippen, try/catch).
- `max_tokens` moderat setzen (z. B. 1024)

Prompt-Inhalt (sinngemäß, in der Route als System-/User-Text):

> Du bist Assistent für einen Malerbetrieb. Analysiere die Fotos einer Kundenanfrage für die Leistung »{leistung}«. Der Kunde hat {flaeche} m² angegeben.
> Antworte **nur** mit JSON in genau dieser Struktur:
> `{"flaeche_geschaetzt_m2": number|null, "untergrund": string|null, "vorarbeiten": string[], "auffaelligkeiten": string[], "sicherheit": "hoch"|"mittel"|"niedrig", "hinweis": string}`
> Regeln: Schätze konservativ. Wenn etwas auf den Fotos nicht erkennbar ist, gib `null` bzw. eine leere Liste zurück statt zu raten. `sicherheit` beschreibt, wie verlässlich deine Einschätzung ist. `hinweis` ist ein kurzer Satz für den Handwerker in einfachem Deutsch. Nenne niemals Preise.

Hinweis: Bei `response_format: json_object` verlangt OpenAI, dass das Wort »JSON« im Prompt vorkommt — das ist oben erfüllt.

Fehlerfälle sauber abfangen: fehlender API-Key, Rate-Limit (429), aufgebrauchtes Guthaben, ungültiges JSON, Download-Fehler. Jeweils verständliche Meldung zurückgeben, nichts in die DB schreiben.

## Schritt 4 — Dashboard-UI

In `modules/dashboard/components/RequestsTable.tsx` bei jeder Anfrage **mit Fotos**:

- Button **»Fotos analysieren«** (nur sichtbar, wenn `foto_pfade` nicht leer)
- Während des Laufs: Ladezustand, Button deaktiviert
- Nach Erfolg: Ergebnis-Kasten anzeigen mit geschätzter Fläche, Untergrund, Vorarbeiten, Auffälligkeiten, Hinweis
- Sichtbarer Label darüber: **»KI-Einschätzung — bitte prüfen«**, plus der Zusatz »ersetzt kein Aufmaß«
- Sicherheits-Level als kleine Kennzeichnung (hoch/mittel/niedrig)
- Ist `foto_analyse` bereits vorhanden, direkt anzeigen statt neu zu analysieren; Button wird zu **»Neu analysieren«**
- Wenn die geschätzte Fläche deutlich (>25 %) von der Kundenangabe abweicht, das optisch hervorheben — genau da liegt der Nutzen für den Maler

Keine automatische Übernahme in die Kalkulation. Der Maler liest, entscheidet, tippt selbst.

## Schritt 5 — Testen

1. Über den Wizard eine Testanfrage mit 2 Fotos anlegen
2. Im Dashboard analysieren lassen, Ergebnis prüfen
3. Seite neu laden → gespeichertes Ergebnis muss weiterhin da sein
4. Anfrage ohne Fotos → Button darf nicht erscheinen
5. Ungültigen API-Key testen → verständliche Fehlermeldung, kein Absturz

## Randnotiz

Unter `app/api/update-request-status/` liegt ein verschachtelter Ordner `delete-offer`, parallel zum eigentlichen `app/api/delete-offer/`. Sieht nach einem Versehen aus — bitte prüfen und ggf. entfernen.

## Arbeitsweise

In Schritten arbeiten: erst Schritt 1+2 (DB + Env), dann Schritt 3 (Route) und testen, dann Schritt 4 (UI). Nach jedem Schritt kurz zeigen, was geändert wurde. Kein Feature-Bloat — genau dieser Umfang, nichts darüber hinaus.
