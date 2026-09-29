-- Migrazione incrementale da eseguire manualmente nel SQL editor del progetto Supabase
-- reale (zrzrmarrhiityuoszdze) — DA ESEGUIRE UNA SOLA VOLTA dopo conferma del founder.
-- `supabase/schema.sql` usa "create table if not exists", quindi non riapplica da solo
-- questi cambi a tabelle già esistenti: serve questo ALTER esplicito.
--
-- Contesto: al momento di scrivere, `targets` e `achievements` risultano vuote (0 righe,
-- verificato nel Table Editor) — questa migrazione è a rischio zero, non tocca dati reali.
-- Se nel frattempo sono state inserite righe con la vecchia scala livelli (L1-1, L1-2,
-- L2-1... L4a/L4b), aggiornale a mano a L0-L4 PRIMA di eseguire questo file, altrimenti il
-- nuovo vincolo CHECK fallisce.

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
