-- ============================================================
-- MIGRATION V4 — Links únicos por membro (slugs)
-- ============================================================

-- 1. Extensão unaccent para normalizar acentos
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Função para transformar nome em slug (joao-silva)
CREATE OR REPLACE FUNCTION slugify(v_input text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' from
    regexp_replace(
      lower(unaccent(v_input)),
      '[^a-z0-9]+', '-', 'g'
    )
  );
$$;

-- 3. Coluna slug na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 4. Função para gerar slug único (adiciona -2, -3… em caso de colisão)
CREATE OR REPLACE FUNCTION generate_unique_slug(v_name text, v_id uuid DEFAULT NULL)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  base_slug text;
  candidate text;
  counter   int := 2;
BEGIN
  base_slug := slugify(v_name);
  candidate := base_slug;
  WHILE EXISTS (
    SELECT 1 FROM public.profiles
    WHERE slug = candidate AND (v_id IS NULL OR id != v_id)
  ) LOOP
    candidate := base_slug || '-' || counter;
    counter   := counter + 1;
  END LOOP;
  RETURN candidate;
END;
$$;

-- 5. Trigger: gera slug automaticamente em novos cadastros
CREATE OR REPLACE FUNCTION profiles_auto_slug() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_auto_slug ON public.profiles;
CREATE TRIGGER trg_profiles_auto_slug
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION profiles_auto_slug();

-- 6. Preenche slugs para usuários que já existem
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT id, name FROM public.profiles
    WHERE slug IS NULL
    ORDER BY created_at
  LOOP
    UPDATE public.profiles
    SET slug = generate_unique_slug(r.name, r.id)
    WHERE id = r.id;
  END LOOP;
END $$;

-- 7. RPC pública: registra contato via link de membro
--    Chamada sem autenticação (anon), vincula ao membro pelo slug
CREATE OR REPLACE FUNCTION registrar_contato_por_link(
  p_slug     text,
  p_nome     text,
  p_telefone text,
  p_bairro   text,
  p_igreja   text
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_member_id uuid;
BEGIN
  -- Localiza o membro pelo slug
  SELECT id INTO v_member_id
  FROM public.profiles
  WHERE slug = p_slug;

  IF v_member_id IS NULL THEN
    RETURN json_build_object('error', 'Membro não encontrado');
  END IF;

  -- Verifica telefone duplicado
  IF EXISTS (
    SELECT 1 FROM public.contacts
    WHERE regexp_replace(telefone, '\D', '', 'g')
        = regexp_replace(p_telefone, '\D', '', 'g')
  ) THEN
    RETURN json_build_object('error', 'duplicate');
  END IF;

  INSERT INTO public.contacts (nome, telefone, bairro, igreja, created_by)
  VALUES (p_nome, p_telefone, p_bairro, p_igreja, v_member_id);

  RETURN json_build_object('error', null);
END;
$$;

GRANT EXECUTE ON FUNCTION registrar_contato_por_link TO anon;
