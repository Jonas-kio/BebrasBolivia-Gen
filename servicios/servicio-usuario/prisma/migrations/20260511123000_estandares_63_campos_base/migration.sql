-- ============================================================
-- MIGRACION: Cumplimiento EstandaresCodificacion_GS (seccion 6.3)
-- Cambios:
--   1. activo -> esta_activo (renombrar columna + indices)
--   2. Agregar actualizado_en donde falta
--   3. Agregar creado_en donde falta
--   4. Agregar esta_activo donde falta
-- ============================================================

-- ------------------------------------------------------------
-- 1. RENOMBRAR activo -> esta_activo
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'bebras' AND table_name = 'examenes' AND column_name = 'activo'
  ) THEN
    EXECUTE 'ALTER TABLE "bebras"."examenes" RENAME COLUMN "activo" TO "esta_activo"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'bebras' AND table_name = 'grupos' AND column_name = 'activo'
  ) THEN
    EXECUTE 'ALTER TABLE "bebras"."grupos" RENAME COLUMN "activo" TO "esta_activo"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'bebras' AND table_name = 'instituciones' AND column_name = 'activo'
  ) THEN
    EXECUTE 'ALTER TABLE "bebras"."instituciones" RENAME COLUMN "activo" TO "esta_activo"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'bebras' AND table_name = 'preguntas' AND column_name = 'activo'
  ) THEN
    EXECUTE 'ALTER TABLE "bebras"."preguntas" RENAME COLUMN "activo" TO "esta_activo"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'bebras' AND table_name = 'usuarios' AND column_name = 'activo'
  ) THEN
    EXECUTE 'ALTER TABLE "bebras"."usuarios" RENAME COLUMN "activo" TO "esta_activo"';
  END IF;
END $$;

DROP INDEX IF EXISTS "bebras"."idx_usuarios_activo";
CREATE INDEX IF NOT EXISTS "idx_usuarios_esta_activo"
  ON "bebras"."usuarios" USING btree ("esta_activo" ASC NULLS LAST);

DROP INDEX IF EXISTS "bebras"."idx_preguntas_activo";
CREATE INDEX IF NOT EXISTS "idx_preguntas_esta_activo"
  ON "bebras"."preguntas" USING btree ("esta_activo" ASC NULLS LAST);

-- ------------------------------------------------------------
-- 2. AGREGAR actualizado_en donde falta
-- ------------------------------------------------------------
ALTER TABLE "bebras"."auditoria"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."categorias"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."coordinadores_institucion"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."detalle_resultados"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."etiquetas"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."examen_preguntas"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."notificaciones"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."opciones_pregunta"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."pregunta_etiquetas"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."profesores_grupos"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."recursos_pregunta"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."registro_accesos"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."respuestas_examen"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."respuestas_practica"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."sesiones"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."sesiones_practica"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."tokens_auth"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."versiones_pregunta"
  ADD COLUMN IF NOT EXISTS "actualizado_en" timestamptz(6) NOT NULL DEFAULT now();

-- ------------------------------------------------------------
-- 3. AGREGAR creado_en donde falta
-- ------------------------------------------------------------
ALTER TABLE "bebras"."coordinadores_institucion"
  ADD COLUMN IF NOT EXISTS "creado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."detalle_resultados"
  ADD COLUMN IF NOT EXISTS "creado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."etiquetas"
  ADD COLUMN IF NOT EXISTS "creado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."examen_preguntas"
  ADD COLUMN IF NOT EXISTS "creado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."notificaciones"
  ADD COLUMN IF NOT EXISTS "creado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."opciones_pregunta"
  ADD COLUMN IF NOT EXISTS "creado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."pregunta_etiquetas"
  ADD COLUMN IF NOT EXISTS "creado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."profesores_grupos"
  ADD COLUMN IF NOT EXISTS "creado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."respuestas_examen"
  ADD COLUMN IF NOT EXISTS "creado_en" timestamptz(6) NOT NULL DEFAULT now();

ALTER TABLE "bebras"."respuestas_practica"
  ADD COLUMN IF NOT EXISTS "creado_en" timestamptz(6) NOT NULL DEFAULT now();

-- ------------------------------------------------------------
-- 4. AGREGAR esta_activo donde falta
-- ------------------------------------------------------------
ALTER TABLE "bebras"."auditoria"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."categorias"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."coordinadores_institucion"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."detalle_resultados"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."estudiantes"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."etiquetas"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."examen_preguntas"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."intentos_examen"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."notificaciones"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."opciones_pregunta"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."pregunta_etiquetas"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."profesores"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."profesores_grupos"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."recursos_pregunta"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."registro_accesos"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."respuestas_examen"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."respuestas_practica"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."sesiones"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."sesiones_practica"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."tokens_auth"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;

ALTER TABLE "bebras"."versiones_pregunta"
  ADD COLUMN IF NOT EXISTS "esta_activo" bool NOT NULL DEFAULT true;
