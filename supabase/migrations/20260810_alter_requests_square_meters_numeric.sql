-- square_meters war integer, der Wizard erlaubt aber Nachkommastellen (z.B. 2.5 m²)
-- In Supabase SQL-Editor ausführen

ALTER TABLE requests ALTER COLUMN square_meters TYPE numeric;
