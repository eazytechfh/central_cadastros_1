-- ============================================================
-- MIGRATION V5 — Normalização de bairro, igreja e nome
-- ============================================================

-- 1. Função para normalizar texto:
--    - remove espaços extras (início, fim e entre palavras)
--    - aplica Title Case (cada palavra começa com maiúscula)
CREATE OR REPLACE FUNCTION normalize_text(v text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT initcap(trim(regexp_replace(v, '\s+', ' ', 'g')));
$$;

-- 2. Corrige todos os registros existentes
UPDATE public.contacts
SET
  nome   = normalize_text(nome),
  bairro = normalize_text(bairro),
  igreja = normalize_text(igreja)
WHERE
  nome   IS DISTINCT FROM normalize_text(nome)
  OR bairro IS DISTINCT FROM normalize_text(bairro)
  OR igreja IS DISTINCT FROM normalize_text(igreja);

-- 3. Trigger: normaliza automaticamente em novos cadastros e edições
CREATE OR REPLACE FUNCTION trg_normalize_contacts()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.nome   := normalize_text(NEW.nome);
  NEW.bairro := normalize_text(NEW.bairro);
  NEW.igreja := normalize_text(NEW.igreja);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contacts_normalize ON public.contacts;
CREATE TRIGGER trg_contacts_normalize
  BEFORE INSERT OR UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION trg_normalize_contacts();
