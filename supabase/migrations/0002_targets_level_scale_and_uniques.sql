-- Migrazione incrementale da eseguire manualmente nel SQL editor del progetto Supabase
-- reale (zrzrmarrhiityuoszdze) — DA ESEGUIRE UNA SOLA VOLTA dopo conferma del founder.
-- `supabase/schema.sql` usa "create table if not exists", quindi non riapplica da solo
-- questi cambi a tabelle già esistenti: serve questo ALTER esplicito.
--
-- Contesto: al momento di scrivere, `targets`, `content` e `achievements` risultano vuote
-- (0 righe, verificato nel Table Editor) — questa migrazione è a rischio zero, non tocca
-- dati reali. Scoperto ottobre 2026 (primo tentativo di eseguire questa migrazione, errore
-- 22P02 "invalid input syntax for type integer: L0"): la colonna `level` su targets/content
-- è rimasta `integer` (eredità della scala 1..5 del brief originale, mai migrata a testo
-- insieme al resto), non `text` come dichiarato in schema.sql — va convertita PRIMA di poter
-- aggiungere il CHECK con le stringhe L0-L4.

alter table targets alter column level type text using level::text;
alter table content alter column level type text using level::text;

alter table targets drop constraint if exists targets_level_check;
alter table targets add constraint targets_level_check
  check (level in ('L0', 'L1', 'L2', 'L3', 'L4'));

alter table content drop constraint if exists content_level_check;
alter table content add constraint content_level_check
  check (level in ('L0', 'L1', 'L2', 'L3', 'L4'));

alter table targets add constraint targets_child_id_phoneme_key
  unique (child_id, phoneme);

alter table achievements add constraint achievements_child_id_phoneme_key
  unique (child_id, phoneme);
