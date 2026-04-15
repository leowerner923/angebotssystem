# WIZARD SYSTEM

## ZIEL
Der Wizard sammelt strukturierte Kundendaten, berechnet Preise und erstellt qualifizierte Anfragen.

---

## AUFBAU (MULTI-STEP FLOW)

Der Wizard besteht aus mehreren Schritten:

### STEP 1: SERVICE AUSWAHL
User wählt:
- Welche Leistung benötigt wird (z. B. Büroreinigung, Fensterreinigung)

Quelle:
→ services aus Firmen-.md Datei

---

### STEP 2: DETAILS
Je nach Service:

Beispiele:
- Fläche (m²)
- Anzahl Fenster
- Etagen
- Reinigungsintervall

---

### STEP 3: EXTRAS
Optionale Zusatzleistungen:
- Grundreinigung
- Spezialreinigung

---

### STEP 4: KONTAKTDATEN
- Name
- Firma
- E-Mail
- Telefonnummer

---

## PREISLOGIK

Preis wird dynamisch berechnet:

### Beispiel:

- Büroreinigung:
  preis = m² * preis_pro_m²

- Fenster:
  preis = anzahl * preis_pro_fenster

- Extras:
  werden addiert

### Gesamtpreis:
gesamtpreis = summe aller services

---

## LEAD SCORING

Ziel: Gute Anfragen priorisieren

### Kriterien:

- Auftragsgröße (größer = besser)
- Regelmäßigkeit (Abo > einmalig)
- Unternehmenskunde > Privatkunde

### Beispiel:

- +10 Punkte bei > 500€
- +5 Punkte bei wöchentlicher Reinigung
- +5 Punkte bei Firma

### Output:
lead_score (0–100)

---

## VALIDIERUNG

Jeder Schritt muss validiert werden:

- Keine leeren Pflichtfelder
- Nur sinnvolle Werte (z. B. m² > 0)

---

## DATENSTRUKTUR (OUTPUT)

Nach Abschluss wird gespeichert:

- service_type
- details (JSON)
- preis
- lead_score
- kunden_daten

---

## USER EXPERIENCE

- Einfach
- Schnell (max. 1–2 Minuten)
- Mobile optimiert

---

## REGELN

1. Wizard muss dynamisch sein (abhängig vom Service)
2. Preisberechnung darf keine Fehler haben
3. Jeder Schritt baut logisch auf dem vorherigen auf
4. Keine unnötigen Eingaben → so kurz wie möglich

---

## ERWEITERUNGEN (SPÄTER)

- Sofort-Angebot als PDF
- Terminbuchung direkt im Wizard
- Live-Preis Vorschau während Eingabe
## Erweiterung: Standort-Eingabe + Umkreis-Validierung

Der Nutzer muss seinen Standort selbst eingeben. Anfragen werden nur akzeptiert, wenn der Standort im Umkreis von 50 km um Mosbach liegt.

### Standort
- Feld: city (string, Pflichtfeld)
- Nutzer gibt seinen Ort ein (z. B. "Heilbronn")

### Validierung
- Referenzpunkt: Mosbach
- Maximaler Umkreis: 50 km
- Wenn außerhalb:
  → Anfrage wird abgelehnt
  → Fehlermeldung anzeigen: "Wir bedienen nur Anfragen im Umkreis von 50 km um Mosbach"

### Technische Umsetzung
- Koordinaten für Mosbach fest definieren
- Ort → Geocoding (z. B. API oder einfache Mapping-Lösung)
- Distanz berechnen (Haversine-Formel)
- Validierung im Wizard (Frontend) UND API (Backend)

---

## Erweiterung: Quadratmeter als Slider

Das Feld für Quadratmeter wird als Slider umgesetzt (keine manuelle Eingabe mehr).

### Feld
- sqm (number)

### UI Verhalten
- Slider von 0 bis 1000 m²
- Schrittweite: 10
- Aktueller Wert wird angezeigt (z. B. "250 m²")

### Ziel
- Einfachere Bedienung
- Schnellere Eingabe
- Bessere User Experience

### Technische Umsetzung
- Input type="range" oder eigener Slider Component
- State wird bei Änderung aktualisiert
- Wert wird wie bisher an API übergeben