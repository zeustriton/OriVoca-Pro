# Cambios para compatibilidad con Vercel

## Resumen

Se ha modificado el proyecto OriVoca-Pro para eliminar la dependencia de SQLite/Prisma y reemplazarla con una capa de persistencia basada en archivos JSON. Esto permite desplegar la aplicación en Vercel sin necesidad de configurar una base de datos.

## Cambios realizados

### 1. Capa de abstracción JSON (`src/lib/db.ts`)
- Se creó una nueva capa de abstracción de base de datos que usa archivos JSON en lugar de Prisma
- Los datos se almacenan en archivos en la carpeta `data/`:
  - `data/users.json` - Usuarios
  - `data/assessments.json` - Evaluaciones vocacionales
- La interfaz es compatible con Prisma, por lo que las rutas API no requieren cambios significativos

### 2. Actualización de `package.json`
- Se eliminaron las dependencias de Prisma:
  - `@prisma/client`
  - `prisma`
- Se eliminaron los scripts de base de datos:
  - `db:push`
  - `db:generate`
  - `db:migrate`
  - `db:reset`

### 3. Eliminación de archivos de Prisma
- Se eliminó la carpeta `prisma/` con el archivo `schema.prisma`
- Se eliminó la carpeta `db/` con archivos de base de datos

### 4. Actualización de `.gitignore`
- Se agregó `/data` para excluir los archivos JSON de datos del control de versiones

## Funcionalidad

La aplicación funciona exactamente igual que antes, pero ahora:
- Los datos se guardan en archivos JSON en el sistema de archivos
- Compatible con el entorno serverless de Vercel
- No requiere configuración de base de datos
- La capa de abstracción JSON proporciona la misma interfaz que Prisma

## Limitaciones

**IMPORTANTE:** Esta implementación JSON tiene limitaciones importantes:

1. **Escalabilidad**: No es ideal para aplicaciones con muchos usuarios concurrentes
2. **Persistencia**: En Vercel, los archivos se borran cuando el servidor se reinicia (serverless)
3. **Concurrentes**: No maneja múltiples escrituras concurrentes correctamente
4. **Rendimiento**: El rendimiento disminuirá con muchos datos

Para producción, se recomienda usar una base de datos en la nube como:
- Supabase (PostgreSQL)
- Neon (PostgreSQL)
- PlanetScale (MySQL)
- MongoDB Atlas

## Migración a una base de datos real

Para migrar a una base de datos real en el futuro:
1. La capa de abstracción en `src/lib/db.ts` facilita la transición
2. Solo necesitas cambiar la implementación de los métodos para usar un cliente de base de datos real
3. Las rutas API no requieren cambios significativos
