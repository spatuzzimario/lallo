-- Aggiunge avatar_id e gender a `children` — raccolti in onboarding ma prima mai salvati
-- (route.params li perdeva nel passaggio da ResultsScreen a AuthScreen). Non tocca
-- owner_id: non ha mai avuto un vincolo di unicità, un genitore con più righe è già
-- supportato dallo schema (vedi nota 5 in supabase/schema.sql).

alter table children add column if not exists avatar_id text;
alter table children add column if not exists gender text
  check (gender in ('maschio', 'femmina', 'preferisco_non_dire'));
