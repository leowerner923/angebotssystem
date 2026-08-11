-- Bewertungs-Agent: Auftragsabschluss und Bewertungsbitte
-- In Supabase SQL-Editor ausführen

alter table offers add column if not exists auftrag_abgeschlossen_am timestamptz;
alter table offers add column if not exists bewertung_gesendet_am timestamptz;

alter table company_settings add column if not exists google_bewertung_url text;
alter table company_settings add column if not exists bewertung_aktiv boolean not null default false;
