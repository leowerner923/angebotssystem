-- Dokumentiert nachträglich die Spalte foto_pfade auf requests
-- (wurde ursprünglich direkt in Supabase angelegt, ohne Migration)
-- In Supabase SQL-Editor ausführen

ALTER TABLE requests ADD COLUMN IF NOT EXISTS foto_pfade TEXT[];
