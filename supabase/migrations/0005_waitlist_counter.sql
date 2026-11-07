-- Contatore reale "le prime 100 famiglie" sulla homepage (landing/index.html, box offerta
-- fondatori — vedi loadWaitlistCounter() nello script). La tabella waitlist ha RLS
-- solo-inserimento apposta (niente scraping di email dei genitori), quindi la pagina non
-- può leggerla direttamente: questa funzione espone SOLO un conteggio aggregato, mai righe
-- o email, così il numero mostrato è vero invece di un'urgenza finta senza un dato reale
-- dietro.

create or replace function waitlist_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer from waitlist;
$$;

grant execute on function waitlist_count() to anon;
