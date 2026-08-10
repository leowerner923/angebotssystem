-- Sicherer Default: Follow-up-Agent ist aus, bis der Betrieb ihn bewusst aktiviert.
-- In Supabase SQL-Editor ausführen

alter table company_settings alter column follow_up_aktiv set default false;
