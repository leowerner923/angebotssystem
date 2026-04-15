# CLAUDE.md

## Projekt: Angebotssystem SaaS (Gebäudereinigung)

Dieses Projekt ist ein skalierbares SaaS-System für Handwerksbetriebe.
Fokus: Gebäudereinigung in Mosbach (Start), später Multi-Tenant.

---

## Ziel

Ein System bestehend aus:

1. Wizard (Buchungsstrecke / Anfrage)
2. Dashboard (für den Betrieb)
3. Automatische Angebots-Erstellung

---

## Datenquelle

Alle Firmendaten kommen aus:
→ unternehmenswissen.md

Diese Datei ist die zentrale Wissensbasis.

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (DB + Auth)
- Self-hosted möglich (DSGVO beachten)

---

## Projektstruktur

/app → Seiten (Wizard, Dashboard)
/components → UI Komponenten
/lib → Logik (Preis, API, etc)
/rules → Systemregeln (WIZARD, DATABASE etc)

---

## Goldene Regeln

- Kein Hardcoding von Firmendaten → immer aus unternehmenswissen.md
- Modularer Aufbau (Multi-Tenant vorbereiten)
- Sauberer, skalierbarer Code
- Mobile First Design
- Keine unnötige Komplexität

---

## Hauptmodule

1. Wizard (/rechner)
   - Multi-Step
   - Preisberechnung
   - Lead-Erfassung

2. Dashboard (/dashboard)
   - Kundenübersicht
   - Angebotsverwaltung

3. Auth
   - Login / Registrierung

---

## Entwicklungsphasen

Phase 1: Projektstruktur  
Phase 2: Datenbank (Supabase)  
Phase 3: Wizard  
Phase 4: Dashboard  
Phase 5: Optimierung  

---

## Aktueller Auftrag

Starte mit Phase 1:

- Erstelle saubere Projektstruktur
- Lege Basis-Komponenten an
- Bereite Wizard-Flow vor

Erkläre jeden Schritt kurz bevor du ihn umsetzt.
