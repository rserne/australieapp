-- De tabellen van de AustralieApp in Nhost (Postgres, schema public).
-- Opgesteld op 30 oktober 2026 uit information_schema.columns van het project, aangevuld met de
-- hoofd-README. Kolommen, types, verplichte velden en standaardwaarden komen uit de database zelf.
-- Sleutels, verwijzingen naar auth.users en indexen staan niet in information_schema.columns: die
-- komen uit de README (reizigers, waarnemingen) of zijn aangenomen (dagitems, zie daar).
--
-- Opbouwen in een nieuw project, in deze volgorde:
--   1. dit bestand uitvoeren in de SQL-editor (Database, SQL Editor)
--   2. de tabellen en de view laten bijhouden door Hasura (Track)
--   3. metadata.json importeren voor de rechten (Hasura-console, Settings, Metadata Actions, Import)
--   4. bij Storage de maximale bestandsgrootte van de bucket default op 20 MB zetten
--   5. de eerste beheerder met de hand in reizigers zetten (zie onderaan)

-- Wie meedoet. Eén rij per account. Zonder rij ziet een account niets van de groep.
create table public.reizigers (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  naam       text not null,
  voorreis   boolean not null default false,
  reis       boolean not null default true,
  nareis     boolean not null default false,
  beheer     boolean not null default false,
  -- Standaard gast: de voorzichtige kant. Wie je toevoegt, ziet de reis en doet mee met de dieren,
  -- maar komt niet bij de notities. De app zet hem bij een nieuwe reiziger ook aan (DELEN_AAN).
  gast       boolean not null default true,
  created_at timestamptz not null default now()
);

-- Notities en bijlagen bij een dag. dag: 0 is algemeen, negatief de voorreis, 1 tot en met 29 de
-- groepsreis, 30 en hoger de nareis. soort: 'notitie' of 'bestand'. type: notitie, ticket,
-- reservering, adres, tip of verzekering. Bij een bijlage verwijst file_id naar storage.files.
-- Nagekeken op 30 oktober 2026: de primaire sleutel op id (dagitems_pkey), de controle op soort en de
-- index op user_id en dag bestaan. De app heeft de primaire sleutel nodig: hij wijzigt en verwijdert
-- notities met update_dagitems_by_pk en delete_dagitems_by_pk, en die biedt Hasura alleen aan bij een
-- tabel met primaire sleutel. Of er een verwijzing naar auth.users met on delete cascade is, bleef
-- onzeker: de opvraag van pg_constraint gaf alleen de controle op soort terug, terwijl ook de primaire
-- sleutel daar had moeten staan. Hier staat de verwijzing er wel in, net als bij waarnemingen.
create table public.dagitems (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  dag        integer not null,
  soort      text not null check (soort in ('notitie','bestand')),
  tekst      text,
  wie        text,
  file_id    uuid,
  naam       text,
  mime       text,
  grootte    integer,
  created_at timestamptz not null default now(),
  -- bij elke wijziging vult Hasura dit zelf in (preset updated_at = now() in metadata.json)
  updated_at timestamptz not null default now(),
  type       text default 'notitie'
);
create index dagitems_user_dag on public.dagitems (user_id, dag);

-- Waarnemingen van dieren. gezien_op is het moment van zien, created_at dat van versturen.
-- hoe: 'gezien' of 'gegeten'.
create table public.waarnemingen (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  wie        text,
  dier       text not null,
  dag        integer not null,
  gezien_op  timestamptz not null,
  opmerking  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  hoe        text not null default 'gezien'
);
create index waarnemingen_dag_idx on public.waarnemingen (dag);

-- Wanneer iemand voor het laatst actief was, voor het scherm Reizigers beheren. Alleen een
-- beheerder mag deze view lezen; een gewone gebruiker mag auth.users niet zien.
create or replace view public.reizigers_actief as
select r.user_id, u.last_seen
from public.reizigers r
join auth.users u on u.id = r.user_id;

-- De eerste beheerder. De app kan pas reizigers toevoegen als er een beheerder is, en die moet je
-- dus met de hand maken. Eerst een account aanmaken (Auth, Users), dan:
--
-- insert into public.reizigers (user_id, naam, beheer, gast)
-- select id, coalesce(display_name, email), true, false
-- from auth.users where email = 'jouw@adres.nl';
