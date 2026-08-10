
**Auftrag für Claude Code.** Projekt: `~/angebotssystem`, Branch `maler-demo`.

## Ziel

Ein Angebot ist versendet, aber der Kunde hat nach ein paar Tagen weder angenommen noch abgelehnt. Ein zeitgesteuerter Job findet diese Angebote und schickt dem Kunden eine kurze, freundliche Nachfrage — mit dem Link zur Annahme-Seite.

**Verkaufsargument:** »Kein Angebot bleibt mehr liegen.« Genau der Schmerz, den Maler am Telefon selbst nennen: Anfrage kommt rein, Angebot geht raus, und dann hört man nie wieder was.

**Grundprinzipien:**
- Maximal **2 Nachfragen**, danach ist Schluss. Kein Nerven.
- Der Maler bekommt jede Nachricht **in Kopie** — er weiß immer, was in seinem Namen rausgeht.
- Pro Betrieb **abschaltbar**.
- Freundlich und kurz, nie Druck aufbauen.

## Bestehender Stand (nicht neu bauen)

- Tabelle `offers` mit Status (`sent` / `accepted` / `rejected` / Entwurf), `annahme_token`, `gueltig_bis`, `entschieden_am`
- Öffentliche Annahme-Seite unter `app/angebot/[token]`
- Mailversand über Resend, Muster in `app/api/send-offer/route.ts`
- Betriebskonfiguration in `lib/company-config.ts` (inkl. `email`)
- Env vorhanden: `RESEND_API_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_SITE_URL`, Supabase-Keys

Bitte die tatsächlichen Spaltennamen der `offers`-Tabelle prüfen (Versanddatum, Kundenbezug, Leistung, Betrag) und darauf abbilden.

---

## Schritt 1 — Datenbank

Als Migration unter `supabase/migrations/` anlegen, dann im Supabase SQL-Editor ausführen:

```sql
alter table offers add column if not exists follow_up_anzahl int not null default 0;
alter table offers add column if not exists follow_up_zuletzt_am timestamptz;
```

Falls es kein Feld für das Versanddatum gibt (z. B. `versendet_am`), ebenfalls ergänzen — der Job braucht es, um »seit X Tagen offen« zu berechnen. In `send-offer/route.ts` dann mitsetzen.

Typen in `lib/types/offer.ts` ergänzen.

## Schritt 2 — Env-Variable für den Cron-Schutz

Neu in `.env.local`, `.env.example` und Vercel:

```
CRON_SECRET=<langer Zufallsstring>
```

Ohne diesen Schutz könnte jeder die Route aufrufen und Mails auslösen.

## Schritt 3 — Cron-Job einrichten

`vercel.json` im Projektroot (anlegen oder ergänzen):

```json
{
  "crons": [
    { "path": "/api/cron/follow-up", "schedule": "0 8 * * *" }
  ]
}
```

Läuft täglich um 8 Uhr UTC. Hinweis in der Doku vermerken, dass Vercel-Crons in UTC laufen — im Sommer also 10 Uhr deutscher Zeit.

## Schritt 4 — Route `app/api/cron/follow-up/route.ts`

**Autorisierung zuerst:** Header `Authorization: Bearer ${CRON_SECRET}` prüfen. Stimmt er nicht → 401, sofort raus.

Ablauf:

1. Alle Angebote laden, auf die **alle** Bedingungen zutreffen:
   - Status = versendet (nicht entschieden)
   - Versanddatum liegt mindestens **3 Tage** zurück
   - `follow_up_anzahl` < 2
   - beim zweiten Follow-up: letzte Nachfrage mindestens **4 Tage** her
   - `gueltig_bis` noch nicht überschritten
   - Follow-up für den Betrieb nicht deaktiviert (siehe Schritt 6)
2. Pro Angebot:
   - Nachrichtentext generieren (siehe unten)
   - Mail an den Kunden senden, Betrieb in Kopie (`cc` oder separate Mail)
   - `follow_up_anzahl` hochzählen, `follow_up_zuletzt_am` setzen
3. Zusammenfassung zurückgeben: wie viele geprüft, wie viele verschickt, wie viele Fehler

**Wichtig zur Robustheit:** Jedes Angebot einzeln in try/catch. Schlägt eines fehl, laufen die anderen weiter. Und: Zähler **erst nach erfolgreichem Versand** hochsetzen — sonst wird ein Follow-up als erledigt markiert, das nie ankam.

**Obergrenze einbauen:** maximal 50 Mails pro Lauf, damit ein Fehler nicht zu einer Massenmail führt.

### Textgenerierung

Über die OpenAI-API (Key ist vorhanden), Prompt sinngemäß:

> Schreibe eine kurze, freundliche Nachfass-Mail auf Deutsch. Absender ist der Malerbetrieb »{firmenname}«, Empfänger der Kunde »{kundenname}«. Vor {tage} Tagen wurde ein Angebot über »{leistung}« geschickt, bisher keine Rückmeldung.
> Regeln: maximal 5 Sätze. Höflich, sachlich, kein Verkaufsdruck, keine Rabatte, keine Superlative. Sie-Form. Biete an, bei Fragen einfach zu antworten. Kein Betreff, nur der Fließtext. Erwähne keine Preise.
> Beim zweiten Follow-up: noch kürzer, und erwähne, dass dies die letzte Nachfrage ist.

Danach im Code den Link zur Annahme-Seite anhängen: `{NEXT_PUBLIC_SITE_URL}/angebot/{annahme_token}` — den soll die KI **nicht** selbst schreiben, sonst erfindet sie URLs.

**Fallback:** Schlägt die Textgenerierung fehl, eine feste Standardformulierung verwenden statt gar keine Mail. Der Agent macht den Text besser, aber die Funktion darf nicht daran hängen.

## Schritt 5 — Manueller Auslöser (zum Testen)

Ein kleines Skript oder eine geschützte Test-Route, mit der du den Lauf manuell starten kannst, ohne auf 8 Uhr zu warten. Mit demselben `CRON_SECRET` abgesichert.

## Schritt 6 — Dashboard

- In der Angebote-Tabelle bei versendeten Angeboten anzeigen: **»1. Nachfrage am [Datum]«** bzw. **»2. Nachfrage am [Datum]«**
- Einfacher Schalter in den Einstellungen: **Automatische Nachfassung aktiv (ja/nein)** — pro Betrieb speichern (Feld in `lib/company-config.ts` oder eigene Settings-Tabelle, je nachdem was besser passt)
- Die Route respektiert diesen Schalter

Der Schalter ist wichtig: Kein Maler will, dass in seinem Namen Mails rausgehen, ohne dass er es abstellen kann.

## Schritt 7 — Testen

1. Angebot anlegen, Versanddatum künstlich auf vor 4 Tagen setzen → Lauf starten → Mail kommt an, Zähler steht auf 1
2. Direkt nochmal laufen lassen → nichts passiert (Mindestabstand)
3. Datum weiter zurücksetzen → zweites Follow-up geht raus, Zähler steht auf 2
4. Nochmal → nichts mehr (Obergrenze erreicht)
5. Angebot annehmen → kein Follow-up mehr
6. Abgelaufenes Angebot → kein Follow-up
7. Route ohne `CRON_SECRET` aufrufen → 401
8. Betriebs-Schalter auf »aus« → kein Follow-up

## Später möglich (jetzt nicht bauen)

Antwortet der Kunde auf die Nachfass-Mail, könnte der Agent die Antwort lesen, einfache Fragen beantworten und alles andere an den Maler eskalieren. Das ist der nächste Ausbau — erst umsetzen, wenn die Basisversion bei einem echten Kunden läuft.

## Arbeitsweise

In Schritten: erst 1+2 (DB + Env), dann 4 (Route) mit manuellem Auslöser testen, dann 3 (Cron), dann 6 (Dashboard). Nach jedem Schritt zeigen, was geändert wurde. Kein Feature-Bloat.
