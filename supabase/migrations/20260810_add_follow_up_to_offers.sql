-- Follow-up-Agent: Zähler/Zeitpunkt für Nachfass-Mails, plus fehlendes Versanddatum
-- In Supabase SQL-Editor ausführen

alter table offers add column if not exists follow_up_anzahl int not null default 0;
alter table offers add column if not exists follow_up_zuletzt_am timestamptz;
alter table offers add column if not exists versendet_am timestamptz;
