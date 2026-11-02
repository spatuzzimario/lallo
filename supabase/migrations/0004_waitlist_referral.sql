-- Offerta fondatori sulla homepage: "le prime 100 famiglie" + "porta un amico"
-- (landing/index.html, sezione #lista). Aggiunge due colonne per far funzionare
-- davvero l'invito tra amici, senza un contatore live finto:
-- - referral_code: codice generato lato client a ogni iscrizione, usato per costruire
--   il link personale mostrato dopo l'invio ("Porta un amico").
-- - referred_by: il codice letto dal parametro ?ref= nell'URL, se chi si iscrive è
--   arrivato dal link di un amico — null altrimenti.
-- Le "prime 100" restano una verifica manuale su questa tabella ordinata per
-- created_at (Table Editor → waitlist), non un calcolo automatico: niente claim in
-- homepage su un numero di posti rimasti che non ha un conteggio reale dietro.

alter table waitlist add column if not exists referral_code text;
alter table waitlist add column if not exists referred_by text;
