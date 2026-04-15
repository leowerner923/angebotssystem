# API SYSTEM

## ZIEL
Saubere Kommunikation zwischen Frontend (Wizard/Dashboard) und Datenbank (Supabase).

---

## GRUNDPRINZIP

- Frontend sendet Daten → API
- API verarbeitet Logik → speichert in DB
- API gibt Antwort zurück → Frontend zeigt Ergebnis

---

## STRUKTUR

Next.js API Routes oder Server Actions:

- /api/create-request
- /api/create-offer
- /api/get-requests
- /api/get-customers

---

## 1. CREATE REQUEST (WIZARD)

### Endpoint:
POST /api/create-request

### Input:
- service_type
- details (json)
- kunden_daten

### Ablauf:
1. Kunde prüfen (existiert oder neu)
2. Preis berechnen
3. Lead Score berechnen
4. In DB speichern (customers + requests)

### Output:
- request_id
- preis
- lead_score

---

## 2. CREATE OFFER

### Endpoint:
POST /api/create-offer

### Input:
- request_id

### Ablauf:
1. Anfrage laden
2. Angebot erstellen
3. In DB speichern (offers)

### Output:
- offer_id

---

## 3. GET REQUESTS (DASHBOARD)

### Endpoint:
GET /api/get-requests

### Output:
- Liste aller Anfragen
- inkl. Kunde, Preis, Status

---

## 4. GET CUSTOMERS

### Endpoint:
GET /api/get-customers

### Output:
- Liste aller Kunden

---

## PREISLOGIK (WICHTIG)

Die Preisberechnung passiert:
👉 in der API, NICHT im Frontend

Grund:
- Sicherheit
- Konsistenz
- keine Manipulation möglich

---

## LEAD SCORING

Auch in der API berechnen:

Beispiel:
- hoher Preis → höherer Score
- Firma → Bonus
- regelmäßige Aufträge → Bonus

---

## VALIDIERUNG

Vor Speicherung:

- Pflichtfelder prüfen
- Werte prüfen (z. B. keine negativen Zahlen)

---

## SICHERHEIT

- Auth prüfen (Supabase)
- company_id mitgeben (Multi-Tenant)
- Keine offenen Endpoints ohne Schutz

---

## BEST PRACTICES

- Keine Business-Logik im Frontend
- API bleibt zentrale Steuerung
- Saubere Trennung von Funktionen
