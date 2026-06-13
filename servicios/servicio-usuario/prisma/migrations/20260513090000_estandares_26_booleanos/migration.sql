-- ============================================================
-- MIGRACION: Cumplimiento EstandaresCodificacion_GS (seccion 2.6)
-- Cambios:
--   1. usuarios.verificado -> esta_verificado
--   2. notificaciones.leida -> esta_leida (+ indice)
--   3. respuestas_examen.marcada -> esta_marcada
--   4. examenes.permite_reanudar -> puede_reanudar
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'bebras' AND table_name = 'usuarios' AND column_name = 'verificado'
  ) THEN
    EXECUTE 'ALTER TABLE "bebras"."usuarios" RENAME COLUMN "verificado" TO "esta_verificado"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'bebras' AND table_name = 'notificaciones' AND column_name = 'leida'
  ) THEN
    EXECUTE 'ALTER TABLE "bebras"."notificaciones" RENAME COLUMN "leida" TO "esta_leida"';
  END IF;
END $$;

DROP INDEX IF EXISTS "bebras"."idx_notificaciones_leida";
CREATE INDEX IF NOT EXISTS "idx_notificaciones_esta_leida"
  ON "bebras"."notificaciones" USING btree ("esta_leida" ASC NULLS LAST);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'bebras' AND table_name = 'respuestas_examen' AND column_name = 'marcada'
  ) THEN
    EXECUTE 'ALTER TABLE "bebras"."respuestas_examen" RENAME COLUMN "marcada" TO "esta_marcada"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'bebras' AND table_name = 'examenes' AND column_name = 'permite_reanudar'
  ) THEN
    EXECUTE 'ALTER TABLE "bebras"."examenes" RENAME COLUMN "permite_reanudar" TO "puede_reanudar"';
  END IF;
END $$;
