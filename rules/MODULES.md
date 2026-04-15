# MODULE SYSTEM

## ZIEL
Das System wird in klar getrennte Module aufgeteilt.
Jedes Modul hat eine eigene Verantwortung und kann unabhängig erweitert werden.

---

## GRUNDPRINZIP

- Jedes Feature = ein Modul
- Module sind unabhängig
- Wiederverwendbar für mehrere Kunden (SaaS)

---

## KERNMODULE

### 1. WIZARD MODULE
Funktion:
- Anfrage erfassen
- Preis berechnen
- Lead erstellen

Seiten:
- /rechner

---

### 2. CUSTOMER MODULE
Funktion:
- Kunden verwalten

Features:
- Kundenliste
- Detailansicht
- Suche & Filter

---

### 3. REQUEST MODULE
Funktion:
- Anfragen verwalten

Features:
- Status (neu, qualifiziert, abgelehnt)
- Übersicht aller Leads

---

### 4. OFFER MODULE
Funktion:
- Angebote erstellen und tracken

Features:
- Angebotsstatus (gesendet, angenommen, abgelehnt)
- Verknüpfung mit Anfragen

---

### 5. DASHBOARD MODULE
Funktion:
- Übersicht für den Betrieb

Features:
- KPIs (Anfragen, Umsatz)
- Schnellzugriff auf wichtige Daten

---

### 6. AUTH MODULE
Funktion:
- Login / Registrierung

Features:
- Supabase Auth
- Zugriffskontrolle

---

## OPTIONALE MODULE (SPÄTER)

### 7. CALENDAR MODULE
- Termine verwalten
- Besichtigungen planen

---

### 8. EMPLOYEE MODULE
- Mitarbeiter verwalten
- Aufgaben zuweisen

---

### 9. NOTIFICATION MODULE
- E-Mails
- interne Benachrichtigungen

---

## STRUKTUR (CODE)

Beispiel:

/modules
  /wizard
  /customers
  /requests
  /offers
  /dashboard
  /auth

---

## REGELN

1. Keine Vermischung von Modulen
2. Jedes Modul hat eigene Logik + UI
3. Kommunikation nur über API
4. Module müssen skalierbar sein

---

## ZIELSTRUKTUR

- Klar
- Erweiterbar
- Wartbar

---

## ERWEITERUNG

Neue Features werden IMMER als neues Modul gebaut  
→ nicht bestehende Module “überladen”
