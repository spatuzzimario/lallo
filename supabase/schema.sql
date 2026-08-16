-- Schema Supabase per Lallo — proposta da CLAUDE.md §4, NON ANCORA APPLICATA.
-- Da eseguire manualmente nel SQL editor del progetto Supabase (o via CLI) solo dopo
-- conferma esplicita del founder. Nessuna app/schermata scrive ancora su queste tabelle:
-- lo store locale (useGamificationStore) resta la fonte di verità finché non si collega
-- davvero il backend.
--
-- Due scostamenti dal punto di partenza del brief, segnalati in chat:
-- 1. `content` è una libreria condivisa per (phoneme, position, syllable_complexity, level,
--    game_type), non legata a un singolo `target_id` — evita di duplicare lo stesso
--    contenuto per ogni bambino con lo stesso fonema/livello. wordBank.ts resta la fonte
--    statica per l'MVP; questa tabella serve quando servirà il caching Supabase Storage
--    per gli audio ElevenLabs (Fase 2).
-- 2. `sessions` ha stars_earned/stars_possible/avg_confidence invece di un generico
--    self_score — stesso formato che useGamificationStore.recordSession calcola già in
--    locale, niente tabella attempts separata per l'MVP.

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('parent', 'therapist')),
  created_at timestamptz not null default now()
);

create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  birthdate date,
  interests text[] not null default '{}',
  audio_recording_consent boolean not null default false,
  consent_given_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists targets (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  phoneme text not null,
  position text not null check (position in ('iniziale', 'intervocalica', 'gruppo', 'digramma')),
  syllable_complexity text not null check (syllable_complexity in ('1', '2', '3', '4plus')),
  level int not null check (level between 1 and 5),
  set_by text not null check (set_by in ('parent', 'screener', 'therapist')),
  -- Niente stato "pending sbloccato dal logopedista": modello parent-first, il genitore
  -- può giocare subito (vedi CLAUDE.md §1) — il logopedista resta un potenziamento
  -- opzionale, non un cancello sull'accesso.
  status text not null default 'active' check (status in ('active', 'mastered', 'paused')),
  created_at timestamptz not null default now()
);

-- Libreria condivisa di contenuti (parole+immagini+audio ref), non legata a un target
-- specifico — vedi nota 1 sopra.
create table if not exists content (
  id uuid primary key default gen_random_uuid(),
  phoneme text not null,
  position text not null check (position in ('iniziale', 'intervocalica', 'gruppo', 'digramma')),
  syllable_complexity text not null check (syllable_complexity in ('1', '2', '3', '4plus')),
  level int not null check (level between 1 and 5),
  game_type text not null,
  payload jsonb not null,
  cached boolean not null default false,
  created_at timestamptz not null default now(),
  unique (phoneme, position, syllable_complexity, level, game_type)
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  target_id uuid references targets (id) on delete set null,
  game_type text not null,
  completed_at timestamptz not null default now(),
  stars_earned int not null default 0,
  stars_possible int not null default 0,
  avg_confidence numeric
);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  phoneme text not null,
  unlocked_at timestamptz not null default now()
);

create table if not exists therapists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  full_name text not null,
  albo_number text not null,
  albo_verified boolean not null default false,
  verified_at timestamptz,
  -- Codice breve che il logopedista condivide con le famiglie per il collegamento — gli
  -- UUID di `id` non sono digitabili da un genitore. Aggiunta agosto 2026, generata
  -- lato client (api/therapists.ts) con retry sul conflitto UNIQUE.
  invite_code text unique
);

create table if not exists therapist_links (
  therapist_id uuid not null references therapists (id) on delete cascade,
  child_id uuid not null references children (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active')),
  primary key (therapist_id, child_id)
);

-- Già esistente lato landing page (waitlist genitori + logopedisti), qui per completezza
-- dello schema.
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('parent', 'genitore', 'therapist', 'logopedista')),
  name text not null,
  email text not null,
  extra text,
  source text,
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
-- Ogni policy è preceduta da un "drop policy if exists" con lo stesso nome: rende l'intero
-- script sicuro da rieseguire più volte (idempotente), anche se in parte è già stato
-- applicato — utile visto che `waitlist` esiste già collegata alla landing page. Se la tua
-- `waitlist` ha già una sua policy con un nome diverso, questa si aggiunge senza conflitti
-- (le policy permissive si sommano in OR); se preferisci non toccarla, salta pure il blocco
-- `waitlist` più sotto — tutto il resto non dipende da quella tabella.

alter table profiles enable row level security;
alter table children enable row level security;
alter table targets enable row level security;
alter table content enable row level security;
alter table sessions enable row level security;
alter table achievements enable row level security;
alter table therapists enable row level security;
alter table therapist_links enable row level security;
alter table waitlist enable row level security;

drop policy if exists "profiles: self read/write" on profiles;
create policy "profiles: self read/write" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "children: owner full access" on children;
create policy "children: owner full access" on children
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "children: linked active therapist can read" on children;
create policy "children: linked active therapist can read" on children
  for select using (
    exists (
      select 1 from therapist_links tl
      join therapists t on t.id = tl.therapist_id
      where tl.child_id = children.id
        and tl.status = 'active'
        and t.profile_id = auth.uid()
    )
  );

drop policy if exists "targets: owner full access" on targets;
create policy "targets: owner full access" on targets
  for all using (
    exists (select 1 from children c where c.id = targets.child_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from children c where c.id = targets.child_id and c.owner_id = auth.uid())
  );

drop policy if exists "targets: linked active therapist can read/write" on targets;
create policy "targets: linked active therapist can read/write" on targets
  for all using (
    exists (
      select 1 from therapist_links tl
      join therapists t on t.id = tl.therapist_id
      where tl.child_id = targets.child_id
        and tl.status = 'active'
        and t.profile_id = auth.uid()
    )
  );

drop policy if exists "content: readable by any authenticated user" on content;
create policy "content: readable by any authenticated user" on content
  for select using (auth.role() = 'authenticated');

drop policy if exists "sessions: owner full access" on sessions;
create policy "sessions: owner full access" on sessions
  for all using (
    exists (select 1 from children c where c.id = sessions.child_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from children c where c.id = sessions.child_id and c.owner_id = auth.uid())
  );

drop policy if exists "sessions: linked active therapist can read" on sessions;
create policy "sessions: linked active therapist can read" on sessions
  for select using (
    exists (
      select 1 from therapist_links tl
      join therapists t on t.id = tl.therapist_id
      where tl.child_id = sessions.child_id
        and tl.status = 'active'
        and t.profile_id = auth.uid()
    )
  );

drop policy if exists "achievements: owner full access" on achievements;
create policy "achievements: owner full access" on achievements
  for all using (
    exists (select 1 from children c where c.id = achievements.child_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from children c where c.id = achievements.child_id and c.owner_id = auth.uid())
  );

drop policy if exists "therapists: self read/write" on therapists;
create policy "therapists: self read/write" on therapists
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Serve a un genitore per risolvere un invite_code in un therapist_id quando collega il
-- logopedista (api/therapists.ts findTherapistByCode) — senza questa policy nessun utente
-- diverso dal logopedista stesso potrebbe leggere la tabella. Espone full_name/albo_number,
-- informazioni professionali non sensibili, non l'email/profilo Auth del logopedista.
drop policy if exists "therapists: any authenticated user can look up" on therapists;
create policy "therapists: any authenticated user can look up" on therapists
  for select using (auth.role() = 'authenticated');

drop policy if exists "therapist_links: therapist can see own links" on therapist_links;
create policy "therapist_links: therapist can see own links" on therapist_links
  for select using (
    exists (select 1 from therapists t where t.id = therapist_links.therapist_id and t.profile_id = auth.uid())
  );

drop policy if exists "therapist_links: parent can see links for own children" on therapist_links;
create policy "therapist_links: parent can see links for own children" on therapist_links
  for select using (
    exists (select 1 from children c where c.id = therapist_links.child_id and c.owner_id = auth.uid())
  );

-- Mancava una policy di insert: senza, RLS blocca qualunque scrittura (anche del genitore
-- proprietario del bambino) — necessaria per redimere un codice invito lato client.
drop policy if exists "therapist_links: parent can create link for own children" on therapist_links;
create policy "therapist_links: parent can create link for own children" on therapist_links
  for insert with check (
    exists (select 1 from children c where c.id = therapist_links.child_id and c.owner_id = auth.uid())
  );

-- anon key: solo insert su waitlist (già il comportamento della landing page). Se la tua
-- tabella esistente ha già una policy equivalente con un altro nome, questa si aggiunge
-- senza rompere nulla — puoi anche cancellarla dopo se preferisci tenere solo la tua.
drop policy if exists "waitlist: anon insert only" on waitlist;
create policy "waitlist: anon insert only" on waitlist
  for insert to anon with check (true);
