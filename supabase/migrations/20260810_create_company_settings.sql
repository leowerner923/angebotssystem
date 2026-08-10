-- Betriebsweite Einstellungen, die ohne Redeploy änderbar sein müssen
-- (z.B. Follow-up-Agent an/aus). Ein Row pro Betrieb.
-- In Supabase SQL-Editor ausführen

create table if not exists company_settings (
  company_id text primary key,
  follow_up_aktiv boolean not null default true
);
