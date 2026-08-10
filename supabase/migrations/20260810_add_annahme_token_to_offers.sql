-- Online-Angebotsannahme: Token für öffentliche Angebotsseite,
-- Entscheidungszeitpunkt und optionales Ablaufdatum
-- In Supabase SQL-Editor ausführen

alter table offers add column if not exists annahme_token uuid not null default gen_random_uuid();
alter table offers add column if not exists entschieden_am timestamptz;
alter table offers add column if not exists gueltig_bis date;

create unique index if not exists offers_annahme_token_idx on offers(annahme_token);
