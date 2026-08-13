-- Aufmaß per Sprachnachricht: Tabelle für Entwürfe aus der Spracherkennung
-- In Supabase SQL-Editor ausführen

create table if not exists aufmasse (
  id uuid primary key default gen_random_uuid(),
  company_id text not null,
  transkript text,
  strukturiert jsonb,
  audio_pfad text,
  status text not null default 'entwurf',
  erstellt_am timestamptz not null default now()
);

create index if not exists aufmasse_company_idx on aufmasse(company_id, erstellt_am desc);

-- Privater Bucket für Sprachaufnahmen (nur serverseitig via Service-Role beschrieben/gelesen,
-- der Browser schickt Audio nie direkt an Supabase Storage, sondern über die API-Route)
insert into storage.buckets (id, name, public)
values ('aufmass-audio', 'aufmass-audio', false)
on conflict (id) do nothing;
