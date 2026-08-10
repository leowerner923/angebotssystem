-- Spalte für das Ergebnis der KI-Foto-Analyse (Vorschlag, keine automatische Kalkulation)
-- In Supabase SQL-Editor ausführen

ALTER TABLE requests ADD COLUMN IF NOT EXISTS foto_analyse JSONB;
