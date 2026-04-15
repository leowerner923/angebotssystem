# DATABASE SYSTEM

## ZIEL
Strukturierte Speicherung aller Kunden, Anfragen und Angebote.
Das System muss skalierbar sein (mehrere Betriebe möglich).

---

## GRUNDPRINZIP

- Jede Anfrage wird gespeichert
- Jeder Kunde wird gespeichert
- Angebote sind mit Anfragen verknüpft
- Alles ist sauber relational aufgebaut

---

## TABELLEN

### 1. customers
Speichert Kundendaten

Felder:
- id (uuid, primary key)
- name
- email
- phone
- company (optional)
- created_at

---

### 2. requests
Alle Wizard-Anfragen

Felder:
- id (uuid)
- customer_id (relation zu customers)
- service_type
- details (json)
- preis
- lead_score
- status (new, qualified, rejected)
- created_at

---

### 3. offers
Erstellte Angebote

Felder:
- id (uuid)
- request_id (relation)
- preis
- status (sent, accepted, rejected)
- created_at

---

### 4. services
Leistungen aus Firmenprofil

Felder:
- id (uuid)
- name
- pricing_type (fixed, per_unit)
- price
- unit (z. B. m², Stück)
- created_at

---

## RELATIONEN

- customer → mehrere requests
- request → ein customer
- request → mehrere offers möglich

---

## MULTI-TENANT (SEHR WICHTIG)

Für SaaS:

Jede Tabelle braucht:
- company_id

Beispiel:
- customers.company_id
- requests.company_id

👉 So kannst du mehrere Betriebe trennen

---

## SICHERHEIT (SUPABASE)

- Row Level Security (RLS) aktivieren
- Jeder Betrieb sieht nur seine Daten

---

## DATENFLUSS

1. User füllt Wizard aus
2. Kunde wird erstellt (customers)
3. Anfrage wird gespeichert (requests)
4. Angebot wird erzeugt (offers)

---

## BEST PRACTICES

- Verwende UUIDs statt IDs
- Nutze JSON für flexible Felder (details)
- Keine Logik in der Datenbank → nur Speicherung
- Klare Trennung von Tabellen

---

## ERWEITERUNGEN

- employees (Mitarbeiter)
- appointments (Kalender)
- notes (Notizen im Dashboard)
