-- Baseline migration generated from docs/bebras GC.sql
CREATE SCHEMA IF NOT EXISTS "bebras";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

/*
 Navicat Premium Data Transfer

 Source Server         : UMSS
 Source Server Type    : PostgreSQL
 Source Server Version : 180003 (180003)
 Source Host           : localhost:5432
 Source Catalog        : GS
 Source Schema         : bebras

 Target Server Type    : PostgreSQL
 Target Server Version : 180003 (180003)
 File Encoding         : 65001

 Date: 07/05/2026 18:52:10
*/


-- ----------------------------
-- Type structure for estado_intento
-- ----------------------------
CREATE TYPE "bebras"."estado_intento" AS ENUM (
  'pendiente',
  'en_progreso',
  'finalizado',
  'cancelado'
);

-- ----------------------------
-- Type structure for nivel_dificultad
-- ----------------------------
CREATE TYPE "bebras"."nivel_dificultad" AS ENUM (
  'facil',
  'medio',
  'dificil'
);

-- ----------------------------
-- Type structure for rol_usuario
-- ----------------------------
CREATE TYPE "bebras"."rol_usuario" AS ENUM (
  'administrador',
  'coordinador',
  'profesor',
  'estudiante'
);

-- ----------------------------
-- Type structure for tipo_notificacion
-- ----------------------------
CREATE TYPE "bebras"."tipo_notificacion" AS ENUM (
  'general',
  'resultado',
  'recordatorio',
  'registro',
  'examen'
);

-- ----------------------------
-- Type structure for tipo_recurso
-- ----------------------------
CREATE TYPE "bebras"."tipo_recurso" AS ENUM (
  'imagen',
  'archivo'
);

-- ----------------------------
-- Type structure for tipo_token
-- ----------------------------
CREATE TYPE "bebras"."tipo_token" AS ENUM (
  'verificacion_correo',
  'recuperar_contrasena'
);

-- ----------------------------
-- Sequence structure for auditoria_id_seq
-- ----------------------------
CREATE SEQUENCE "bebras"."auditoria_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for registro_accesos_id_seq
-- ----------------------------
CREATE SEQUENCE "bebras"."registro_accesos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Table structure for auditoria
-- ----------------------------
CREATE TABLE "bebras"."auditoria" (
  "id" int8 NOT NULL DEFAULT nextval('"bebras".auditoria_id_seq'::regclass),
  "usuario_id" uuid,
  "accion" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "tabla" varchar(100) COLLATE "pg_catalog"."default",
  "registro_id" uuid,
  "detalle" text COLLATE "pg_catalog"."default",
  "ip" inet,
  "creado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for categorias
-- ----------------------------
CREATE TABLE "bebras"."categorias" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "nombre" varchar(150) COLLATE "pg_catalog"."default" NOT NULL,
  "descripcion" text COLLATE "pg_catalog"."default",
  "padre_id" uuid,
  "creado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for coordinadores_institucion
-- ----------------------------
CREATE TABLE "bebras"."coordinadores_institucion" (
  "institucion_id" uuid NOT NULL,
  "usuario_id" uuid NOT NULL,
  "asignado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for detalle_resultados
-- ----------------------------
CREATE TABLE "bebras"."detalle_resultados" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "intento_id" uuid NOT NULL,
  "pregunta_id" uuid NOT NULL,
  "opcion_id" uuid,
  "es_correcta" bool NOT NULL,
  "puntos" numeric(5,2) NOT NULL DEFAULT 0
)
;

-- ----------------------------
-- Table structure for estudiantes
-- ----------------------------
CREATE TABLE "bebras"."estudiantes" (
  "usuario_id" uuid NOT NULL,
  "institucion_id" uuid,
  "grupo_id" uuid,
  "codigo" varchar(50) COLLATE "pg_catalog"."default",
  "creado_en" timestamptz(6) NOT NULL DEFAULT now(),
  "actualizado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for etiquetas
-- ----------------------------
CREATE TABLE "bebras"."etiquetas" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "nombre" varchar(100) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Table structure for examen_preguntas
-- ----------------------------
CREATE TABLE "bebras"."examen_preguntas" (
  "examen_id" uuid NOT NULL,
  "pregunta_id" uuid NOT NULL,
  "orden" int2 NOT NULL DEFAULT 0
)
;

-- ----------------------------
-- Table structure for examenes
-- ----------------------------
CREATE TABLE "bebras"."examenes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "titulo" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "descripcion" text COLLATE "pg_catalog"."default",
  "instrucciones" text COLLATE "pg_catalog"."default",
  "duracion_minutos" int2 NOT NULL,
  "inicio_en" timestamptz(6),
  "fin_en" timestamptz(6),
  "permite_reanudar" bool NOT NULL DEFAULT true,
  "activo" bool NOT NULL DEFAULT true,
  "creado_por" uuid,
  "creado_en" timestamptz(6) NOT NULL DEFAULT now(),
  "actualizado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for grupos
-- ----------------------------
CREATE TABLE "bebras"."grupos" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "nombre" varchar(150) COLLATE "pg_catalog"."default" NOT NULL,
  "institucion_id" uuid NOT NULL,
  "activo" bool NOT NULL DEFAULT true,
  "creado_en" timestamptz(6) NOT NULL DEFAULT now(),
  "actualizado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for instituciones
-- ----------------------------
CREATE TABLE "bebras"."instituciones" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "nombre" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "codigo" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "activo" bool NOT NULL DEFAULT true,
  "creado_en" timestamptz(6) NOT NULL DEFAULT now(),
  "actualizado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for intentos_examen
-- ----------------------------
CREATE TABLE "bebras"."intentos_examen" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "examen_id" uuid NOT NULL,
  "estudiante_id" uuid NOT NULL,
  "estado" "bebras"."estado_intento" NOT NULL DEFAULT 'pendiente'::"bebras".estado_intento,
  "iniciado_en" timestamptz(6),
  "finalizado_en" timestamptz(6),
  "puntaje" numeric(6,2),
  "creado_en" timestamptz(6) NOT NULL DEFAULT now(),
  "actualizado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for notificaciones
-- ----------------------------
CREATE TABLE "bebras"."notificaciones" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usuario_id" uuid,
  "tipo" "bebras"."tipo_notificacion" NOT NULL DEFAULT 'general'::"bebras".tipo_notificacion,
  "titulo" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "mensaje" text COLLATE "pg_catalog"."default" NOT NULL,
  "leida" bool NOT NULL DEFAULT false,
  "enviada_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for opciones_pregunta
-- ----------------------------
CREATE TABLE "bebras"."opciones_pregunta" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "pregunta_id" uuid NOT NULL,
  "texto" text COLLATE "pg_catalog"."default" NOT NULL,
  "es_correcta" bool NOT NULL DEFAULT false,
  "orden" int2 NOT NULL DEFAULT 0
)
;

-- ----------------------------
-- Table structure for pregunta_etiquetas
-- ----------------------------
CREATE TABLE "bebras"."pregunta_etiquetas" (
  "pregunta_id" uuid NOT NULL,
  "etiqueta_id" uuid NOT NULL
)
;

-- ----------------------------
-- Table structure for preguntas
-- ----------------------------
CREATE TABLE "bebras"."preguntas" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "titulo" varchar(300) COLLATE "pg_catalog"."default" NOT NULL,
  "contenido" text COLLATE "pg_catalog"."default" NOT NULL,
  "categoria_id" uuid,
  "dificultad" "bebras"."nivel_dificultad" NOT NULL,
  "puntaje" int2 NOT NULL DEFAULT 1,
  "explicacion" text COLLATE "pg_catalog"."default",
  "activo" bool NOT NULL DEFAULT true,
  "creado_por" uuid,
  "creado_en" timestamptz(6) NOT NULL DEFAULT now(),
  "actualizado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for profesores
-- ----------------------------
CREATE TABLE "bebras"."profesores" (
  "usuario_id" uuid NOT NULL,
  "institucion_id" uuid,
  "creado_en" timestamptz(6) NOT NULL DEFAULT now(),
  "actualizado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for profesores_grupos
-- ----------------------------
CREATE TABLE "bebras"."profesores_grupos" (
  "profesor_id" uuid NOT NULL,
  "grupo_id" uuid NOT NULL,
  "asignado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for recursos_pregunta
-- ----------------------------
CREATE TABLE "bebras"."recursos_pregunta" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "pregunta_id" uuid NOT NULL,
  "url" text COLLATE "pg_catalog"."default" NOT NULL,
  "tipo" "bebras"."tipo_recurso" NOT NULL DEFAULT 'imagen'::"bebras".tipo_recurso,
  "creado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for registro_accesos
-- ----------------------------
CREATE TABLE "bebras"."registro_accesos" (
  "id" int8 NOT NULL DEFAULT nextval('"bebras".registro_accesos_id_seq'::regclass),
  "usuario_id" uuid,
  "accion" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "ip" inet,
  "creado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for respuestas_examen
-- ----------------------------
CREATE TABLE "bebras"."respuestas_examen" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "intento_id" uuid NOT NULL,
  "pregunta_id" uuid NOT NULL,
  "opcion_id" uuid,
  "marcada" bool NOT NULL DEFAULT false,
  "respondida_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for respuestas_practica
-- ----------------------------
CREATE TABLE "bebras"."respuestas_practica" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "sesion_id" uuid NOT NULL,
  "pregunta_id" uuid NOT NULL,
  "opcion_id" uuid,
  "es_correcta" bool,
  "respondida_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for sesiones
-- ----------------------------
CREATE TABLE "bebras"."sesiones" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usuario_id" uuid NOT NULL,
  "token" varchar(512) COLLATE "pg_catalog"."default" NOT NULL,
  "ip" inet,
  "expira_en" timestamptz(6) NOT NULL,
  "creado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for sesiones_practica
-- ----------------------------
CREATE TABLE "bebras"."sesiones_practica" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "estudiante_id" uuid NOT NULL,
  "categoria_id" uuid,
  "dificultad" "bebras"."nivel_dificultad",
  "puntaje" numeric(6,2),
  "creado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for tokens_auth
-- ----------------------------
CREATE TABLE "bebras"."tokens_auth" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usuario_id" uuid NOT NULL,
  "token" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "tipo" "bebras"."tipo_token" NOT NULL,
  "expira_en" timestamptz(6) NOT NULL,
  "usado_en" timestamptz(6),
  "creado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for usuarios
-- ----------------------------
CREATE TABLE "bebras"."usuarios" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "correo" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "nombre_usuario" varchar(100) COLLATE "pg_catalog"."default",
  "contrasena_hash" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "rol" "bebras"."rol_usuario" NOT NULL,
  "nombres" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "apellidos" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "activo" bool NOT NULL DEFAULT true,
  "verificado" bool NOT NULL DEFAULT false,
  "intentos_fallidos" int4 NOT NULL DEFAULT 0,
  "bloqueado_hasta" timestamptz(6),
  "ultimo_acceso_en" timestamptz(6),
  "ultimo_acceso_ip" inet,
  "creado_en" timestamptz(6) NOT NULL DEFAULT now(),
  "actualizado_en" timestamptz(6) NOT NULL DEFAULT now(),
  "telefono" varchar(20) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Table structure for versiones_pregunta
-- ----------------------------
CREATE TABLE "bebras"."versiones_pregunta" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "pregunta_id" uuid NOT NULL,
  "version" int2 NOT NULL DEFAULT 1,
  "contenido" text COLLATE "pg_catalog"."default" NOT NULL,
  "datos_extra" jsonb,
  "creado_por" uuid,
  "creado_en" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "bebras"."auditoria_id_seq"
OWNED BY "bebras"."auditoria"."id";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "bebras"."registro_accesos_id_seq"
OWNED BY "bebras"."registro_accesos"."id";

-- ----------------------------
-- Indexes structure for table auditoria
-- ----------------------------
CREATE INDEX "idx_auditoria_tabla" ON "bebras"."auditoria" USING btree (
  "tabla" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_auditoria_usuario" ON "bebras"."auditoria" USING btree (
  "usuario_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table auditoria
-- ----------------------------
ALTER TABLE "bebras"."auditoria" ADD CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table categorias
-- ----------------------------
ALTER TABLE "bebras"."categorias" ADD CONSTRAINT "categorias_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table coordinadores_institucion
-- ----------------------------
ALTER TABLE "bebras"."coordinadores_institucion" ADD CONSTRAINT "coordinadores_institucion_pkey" PRIMARY KEY ("institucion_id", "usuario_id");

-- ----------------------------
-- Indexes structure for table detalle_resultados
-- ----------------------------
CREATE INDEX "idx_detalle_intento" ON "bebras"."detalle_resultados" USING btree (
  "intento_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table detalle_resultados
-- ----------------------------
ALTER TABLE "bebras"."detalle_resultados" ADD CONSTRAINT "detalle_resultados_intento_id_pregunta_id_key" UNIQUE ("intento_id", "pregunta_id");

-- ----------------------------
-- Primary Key structure for table detalle_resultados
-- ----------------------------
ALTER TABLE "bebras"."detalle_resultados" ADD CONSTRAINT "detalle_resultados_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table estudiantes
-- ----------------------------
CREATE INDEX "idx_estudiantes_grupo" ON "bebras"."estudiantes" USING btree (
  "grupo_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
CREATE INDEX "idx_estudiantes_institucion" ON "bebras"."estudiantes" USING btree (
  "institucion_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table estudiantes
-- ----------------------------
ALTER TABLE "bebras"."estudiantes" ADD CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("usuario_id");

-- ----------------------------
-- Uniques structure for table etiquetas
-- ----------------------------
ALTER TABLE "bebras"."etiquetas" ADD CONSTRAINT "etiquetas_nombre_key" UNIQUE ("nombre");

-- ----------------------------
-- Primary Key structure for table etiquetas
-- ----------------------------
ALTER TABLE "bebras"."etiquetas" ADD CONSTRAINT "etiquetas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table examen_preguntas
-- ----------------------------
ALTER TABLE "bebras"."examen_preguntas" ADD CONSTRAINT "examen_preguntas_pkey" PRIMARY KEY ("examen_id", "pregunta_id");

-- ----------------------------
-- Checks structure for table examenes
-- ----------------------------
ALTER TABLE "bebras"."examenes" ADD CONSTRAINT "chk_examenes_fechas" CHECK (fin_en IS NULL OR inicio_en IS NULL OR fin_en > inicio_en);

-- ----------------------------
-- Primary Key structure for table examenes
-- ----------------------------
ALTER TABLE "bebras"."examenes" ADD CONSTRAINT "examenes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table grupos
-- ----------------------------
ALTER TABLE "bebras"."grupos" ADD CONSTRAINT "grupos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table instituciones
-- ----------------------------
ALTER TABLE "bebras"."instituciones" ADD CONSTRAINT "instituciones_codigo_key" UNIQUE ("codigo");

-- ----------------------------
-- Primary Key structure for table instituciones
-- ----------------------------
ALTER TABLE "bebras"."instituciones" ADD CONSTRAINT "instituciones_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table intentos_examen
-- ----------------------------
CREATE INDEX "idx_intentos_estado" ON "bebras"."intentos_examen" USING btree (
  "estado" "pg_catalog"."enum_ops" ASC NULLS LAST
);
CREATE INDEX "idx_intentos_estudiante" ON "bebras"."intentos_examen" USING btree (
  "estudiante_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
CREATE INDEX "idx_intentos_examen" ON "bebras"."intentos_examen" USING btree (
  "examen_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table intentos_examen
-- ----------------------------
ALTER TABLE "bebras"."intentos_examen" ADD CONSTRAINT "intentos_examen_examen_id_estudiante_id_key" UNIQUE ("examen_id", "estudiante_id");

-- ----------------------------
-- Primary Key structure for table intentos_examen
-- ----------------------------
ALTER TABLE "bebras"."intentos_examen" ADD CONSTRAINT "intentos_examen_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table notificaciones
-- ----------------------------
CREATE INDEX "idx_notificaciones_leida" ON "bebras"."notificaciones" USING btree (
  "leida" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_notificaciones_usuario" ON "bebras"."notificaciones" USING btree (
  "usuario_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table notificaciones
-- ----------------------------
ALTER TABLE "bebras"."notificaciones" ADD CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table opciones_pregunta
-- ----------------------------
ALTER TABLE "bebras"."opciones_pregunta" ADD CONSTRAINT "opciones_pregunta_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table pregunta_etiquetas
-- ----------------------------
ALTER TABLE "bebras"."pregunta_etiquetas" ADD CONSTRAINT "pregunta_etiquetas_pkey" PRIMARY KEY ("pregunta_id", "etiqueta_id");

-- ----------------------------
-- Indexes structure for table preguntas
-- ----------------------------
CREATE INDEX "idx_preguntas_activo" ON "bebras"."preguntas" USING btree (
  "activo" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_preguntas_categoria" ON "bebras"."preguntas" USING btree (
  "categoria_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
CREATE INDEX "idx_preguntas_dificultad" ON "bebras"."preguntas" USING btree (
  "dificultad" "pg_catalog"."enum_ops" ASC NULLS LAST
);
CREATE INDEX "idx_preguntas_fts" ON "bebras"."preguntas" USING gin (
  to_tsvector('spanish'::regconfig, (titulo::text || ' '::text) || contenido) "pg_catalog"."tsvector_ops"
);

-- ----------------------------
-- Primary Key structure for table preguntas
-- ----------------------------
ALTER TABLE "bebras"."preguntas" ADD CONSTRAINT "preguntas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table profesores
-- ----------------------------
CREATE INDEX "idx_profesores_institucion" ON "bebras"."profesores" USING btree (
  "institucion_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table profesores
-- ----------------------------
ALTER TABLE "bebras"."profesores" ADD CONSTRAINT "profesores_pkey" PRIMARY KEY ("usuario_id");

-- ----------------------------
-- Primary Key structure for table profesores_grupos
-- ----------------------------
ALTER TABLE "bebras"."profesores_grupos" ADD CONSTRAINT "profesores_grupos_pkey" PRIMARY KEY ("profesor_id", "grupo_id");

-- ----------------------------
-- Primary Key structure for table recursos_pregunta
-- ----------------------------
ALTER TABLE "bebras"."recursos_pregunta" ADD CONSTRAINT "recursos_pregunta_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table registro_accesos
-- ----------------------------
CREATE INDEX "idx_registro_accesos" ON "bebras"."registro_accesos" USING btree (
  "usuario_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table registro_accesos
-- ----------------------------
ALTER TABLE "bebras"."registro_accesos" ADD CONSTRAINT "registro_accesos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table respuestas_examen
-- ----------------------------
CREATE INDEX "idx_respuestas_intento" ON "bebras"."respuestas_examen" USING btree (
  "intento_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table respuestas_examen
-- ----------------------------
ALTER TABLE "bebras"."respuestas_examen" ADD CONSTRAINT "respuestas_examen_intento_id_pregunta_id_key" UNIQUE ("intento_id", "pregunta_id");

-- ----------------------------
-- Primary Key structure for table respuestas_examen
-- ----------------------------
ALTER TABLE "bebras"."respuestas_examen" ADD CONSTRAINT "respuestas_examen_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table respuestas_practica
-- ----------------------------
ALTER TABLE "bebras"."respuestas_practica" ADD CONSTRAINT "respuestas_practica_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table sesiones
-- ----------------------------
CREATE INDEX "idx_sesiones_expira" ON "bebras"."sesiones" USING btree (
  "expira_en" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "idx_sesiones_usuario" ON "bebras"."sesiones" USING btree (
  "usuario_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table sesiones
-- ----------------------------
ALTER TABLE "bebras"."sesiones" ADD CONSTRAINT "sesiones_token_key" UNIQUE ("token");

-- ----------------------------
-- Primary Key structure for table sesiones
-- ----------------------------
ALTER TABLE "bebras"."sesiones" ADD CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table sesiones_practica
-- ----------------------------
ALTER TABLE "bebras"."sesiones_practica" ADD CONSTRAINT "sesiones_practica_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table tokens_auth
-- ----------------------------
CREATE INDEX "idx_tokens_usuario" ON "bebras"."tokens_auth" USING btree (
  "usuario_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table tokens_auth
-- ----------------------------
ALTER TABLE "bebras"."tokens_auth" ADD CONSTRAINT "tokens_auth_token_key" UNIQUE ("token");

-- ----------------------------
-- Primary Key structure for table tokens_auth
-- ----------------------------
ALTER TABLE "bebras"."tokens_auth" ADD CONSTRAINT "tokens_auth_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table usuarios
-- ----------------------------
CREATE INDEX "idx_usuarios_activo" ON "bebras"."usuarios" USING btree (
  "activo" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_usuarios_correo" ON "bebras"."usuarios" USING btree (
  "correo" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_usuarios_fts" ON "bebras"."usuarios" USING gin (
  to_tsvector('spanish'::regconfig, (((nombres::text || ' '::text) || apellidos::text) || ' '::text) || correo::text) "pg_catalog"."tsvector_ops"
);
CREATE INDEX "idx_usuarios_rol" ON "bebras"."usuarios" USING btree (
  "rol" "pg_catalog"."enum_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table usuarios
-- ----------------------------
ALTER TABLE "bebras"."usuarios" ADD CONSTRAINT "usuarios_correo_key" UNIQUE ("correo");
ALTER TABLE "bebras"."usuarios" ADD CONSTRAINT "usuarios_nombre_usuario_key" UNIQUE ("nombre_usuario");

-- ----------------------------
-- Primary Key structure for table usuarios
-- ----------------------------
ALTER TABLE "bebras"."usuarios" ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table versiones_pregunta
-- ----------------------------
CREATE INDEX "idx_versiones_pregunta" ON "bebras"."versiones_pregunta" USING btree (
  "pregunta_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table versiones_pregunta
-- ----------------------------
ALTER TABLE "bebras"."versiones_pregunta" ADD CONSTRAINT "versiones_pregunta_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table auditoria
-- ----------------------------
ALTER TABLE "bebras"."auditoria" ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "bebras"."usuarios" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table categorias
-- ----------------------------
ALTER TABLE "bebras"."categorias" ADD CONSTRAINT "categorias_padre_id_fkey" FOREIGN KEY ("padre_id") REFERENCES "bebras"."categorias" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table coordinadores_institucion
-- ----------------------------
ALTER TABLE "bebras"."coordinadores_institucion" ADD CONSTRAINT "coordinadores_institucion_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "bebras"."instituciones" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "bebras"."coordinadores_institucion" ADD CONSTRAINT "coordinadores_institucion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "bebras"."usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table detalle_resultados
-- ----------------------------
ALTER TABLE "bebras"."detalle_resultados" ADD CONSTRAINT "detalle_resultados_intento_id_fkey" FOREIGN KEY ("intento_id") REFERENCES "bebras"."intentos_examen" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "bebras"."detalle_resultados" ADD CONSTRAINT "detalle_resultados_opcion_id_fkey" FOREIGN KEY ("opcion_id") REFERENCES "bebras"."opciones_pregunta" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "bebras"."detalle_resultados" ADD CONSTRAINT "detalle_resultados_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "bebras"."preguntas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table estudiantes
-- ----------------------------
ALTER TABLE "bebras"."estudiantes" ADD CONSTRAINT "estudiantes_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "bebras"."grupos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "bebras"."estudiantes" ADD CONSTRAINT "estudiantes_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "bebras"."instituciones" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "bebras"."estudiantes" ADD CONSTRAINT "estudiantes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "bebras"."usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table examen_preguntas
-- ----------------------------
ALTER TABLE "bebras"."examen_preguntas" ADD CONSTRAINT "examen_preguntas_examen_id_fkey" FOREIGN KEY ("examen_id") REFERENCES "bebras"."examenes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "bebras"."examen_preguntas" ADD CONSTRAINT "examen_preguntas_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "bebras"."preguntas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table examenes
-- ----------------------------
ALTER TABLE "bebras"."examenes" ADD CONSTRAINT "examenes_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "bebras"."usuarios" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table grupos
-- ----------------------------
ALTER TABLE "bebras"."grupos" ADD CONSTRAINT "grupos_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "bebras"."instituciones" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table intentos_examen
-- ----------------------------
ALTER TABLE "bebras"."intentos_examen" ADD CONSTRAINT "intentos_examen_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "bebras"."estudiantes" ("usuario_id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "bebras"."intentos_examen" ADD CONSTRAINT "intentos_examen_examen_id_fkey" FOREIGN KEY ("examen_id") REFERENCES "bebras"."examenes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table notificaciones
-- ----------------------------
ALTER TABLE "bebras"."notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "bebras"."usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table opciones_pregunta
-- ----------------------------
ALTER TABLE "bebras"."opciones_pregunta" ADD CONSTRAINT "opciones_pregunta_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "bebras"."preguntas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table pregunta_etiquetas
-- ----------------------------
ALTER TABLE "bebras"."pregunta_etiquetas" ADD CONSTRAINT "pregunta_etiquetas_etiqueta_id_fkey" FOREIGN KEY ("etiqueta_id") REFERENCES "bebras"."etiquetas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "bebras"."pregunta_etiquetas" ADD CONSTRAINT "pregunta_etiquetas_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "bebras"."preguntas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table preguntas
-- ----------------------------
ALTER TABLE "bebras"."preguntas" ADD CONSTRAINT "preguntas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "bebras"."categorias" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "bebras"."preguntas" ADD CONSTRAINT "preguntas_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "bebras"."usuarios" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table profesores
-- ----------------------------
ALTER TABLE "bebras"."profesores" ADD CONSTRAINT "profesores_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "bebras"."instituciones" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "bebras"."profesores" ADD CONSTRAINT "profesores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "bebras"."usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table profesores_grupos
-- ----------------------------
ALTER TABLE "bebras"."profesores_grupos" ADD CONSTRAINT "profesores_grupos_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "bebras"."grupos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "bebras"."profesores_grupos" ADD CONSTRAINT "profesores_grupos_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "bebras"."profesores" ("usuario_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table recursos_pregunta
-- ----------------------------
ALTER TABLE "bebras"."recursos_pregunta" ADD CONSTRAINT "recursos_pregunta_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "bebras"."preguntas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table registro_accesos
-- ----------------------------
ALTER TABLE "bebras"."registro_accesos" ADD CONSTRAINT "registro_accesos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "bebras"."usuarios" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table respuestas_examen
-- ----------------------------
ALTER TABLE "bebras"."respuestas_examen" ADD CONSTRAINT "respuestas_examen_intento_id_fkey" FOREIGN KEY ("intento_id") REFERENCES "bebras"."intentos_examen" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "bebras"."respuestas_examen" ADD CONSTRAINT "respuestas_examen_opcion_id_fkey" FOREIGN KEY ("opcion_id") REFERENCES "bebras"."opciones_pregunta" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "bebras"."respuestas_examen" ADD CONSTRAINT "respuestas_examen_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "bebras"."preguntas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table respuestas_practica
-- ----------------------------
ALTER TABLE "bebras"."respuestas_practica" ADD CONSTRAINT "respuestas_practica_opcion_id_fkey" FOREIGN KEY ("opcion_id") REFERENCES "bebras"."opciones_pregunta" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "bebras"."respuestas_practica" ADD CONSTRAINT "respuestas_practica_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "bebras"."preguntas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "bebras"."respuestas_practica" ADD CONSTRAINT "respuestas_practica_sesion_id_fkey" FOREIGN KEY ("sesion_id") REFERENCES "bebras"."sesiones_practica" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table sesiones
-- ----------------------------
ALTER TABLE "bebras"."sesiones" ADD CONSTRAINT "sesiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "bebras"."usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table sesiones_practica
-- ----------------------------
ALTER TABLE "bebras"."sesiones_practica" ADD CONSTRAINT "sesiones_practica_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "bebras"."categorias" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "bebras"."sesiones_practica" ADD CONSTRAINT "sesiones_practica_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "bebras"."estudiantes" ("usuario_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tokens_auth
-- ----------------------------
ALTER TABLE "bebras"."tokens_auth" ADD CONSTRAINT "tokens_auth_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "bebras"."usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table versiones_pregunta
-- ----------------------------
ALTER TABLE "bebras"."versiones_pregunta" ADD CONSTRAINT "versiones_pregunta_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "bebras"."usuarios" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "bebras"."versiones_pregunta" ADD CONSTRAINT "versiones_pregunta_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "bebras"."preguntas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
