# Cambios para Vercel Compatibility

## Resumen de Cambios

El proyecto OriVoca-Pro ha sido modificado para funcionar en Vercel sin necesidad de SQLite.

## Cambios Realizados

### 1. Reemplazo de Prisma/SQLite por Almacenamiento en Memoria

**Archivo:** `src/lib/db.ts`

- **Antes:** Usaba Prisma ORM con SQLite (requiere escritura en disco)
- **Ahora:** Usa almacenamiento en memoria (funciona en Vercel serverless)

**Razón:** Vercel tiene un sistema de archivos de solo lectura después del build, por lo que escribir archivos JSON o SQLite no funciona en producción.

### 2. Eliminación de Dependencias de Prisma

**Archivo:** `package.json`

- Eliminado: `@prisma/client` y `prisma`
- Eliminados scripts de Prisma: `db:push`, `db:generate`, `db:migrate`, `db:reset`

### 3. Eliminación de Archivos de Configuración

**Directorios eliminados:**
- `prisma/` - Schema y configuración de Prisma
- `db/` - Archivos de base de datos SQLite

## Limitaciones Importantes

### ⚠️ Almacenamiento No Persistente

**En Vercel:**
- Los datos se almacenan en memoria del servidor
- Los datos se pierden cuando el servidor se reinicia (lambda timeout, cold start)
- **Esto es una limitación técnica de Vercel serverless sin base de datos externa**

**En Local (desarrollo):**
- Los datos también están en memoria
- Los datos se pierden al reiniciar el servidor de desarrollo

### Soluciones Futuras

Si necesitas persistencia de datos en Vercel, considera:

1. **Vercel Postgres** - Base de datos oficial de Vercel
2. **Neon** - PostgreSQL serverless
3. **Supabase** - Firebase-like con PostgreSQL
4. **PlanetScale** - MySQL serverless
5. **Redis** - Para caché y sesiones

Para implementar cualquiera de estas opciones, solo necesitas actualizar el archivo `src/lib/db.ts` con el cliente de la base de datos elegida.

## Funcionalidad Actual

La aplicación funciona completamente con:

✅ Creación de usuarios
✅ Creación de evaluaciones vocacionales
✅ Guardado de respuestas de tests
✅ Análisis de resultados
✅ Generación de recomendaciones con IA
✅ Todas las funcionalidades psicométricas

## Compatibilidad

✅ Vercel (producción)
✅ Local (desarrollo)
✅ TypeScript (sin errores)
✅ Next.js 16 con App Router
✅ Todos los componentes de shadcn/ui

## Notas Técnicas

El cambio a almacenamiento en memoria es completamente transparente para el frontend. La API sigue funcionando de la misma manera, solo cambia la implementación del backend.

Las APIs REST (`/api/vocational/*`) siguen siendo las mismas, por lo que no se requiere cambios en el frontend.

## Estructura de Datos

La estructura de datos permanece igual a la del schema original de Prisma:

- **User**: id, email, name, age, createdAt, updatedAt
- **VocationalAssessment**: Todos los campos del schema original

Esto facilita la migración a una base de datos real en el futuro si es necesario.
