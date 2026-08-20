# Conectado por el Cambio

Aplicacion territorial para gestionar coordinadores, dirigentes, miembros, eventos, accesos y perfil institucional.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Prisma ORM 7
- PostgreSQL local para desarrollo
- Neon para produccion
- Cloudflare R2 para fotos de perfil en produccion

## Variables de entorno

Usa `.env` en local y configura las mismas claves en Vercel:

```bash
DATABASE_URL="postgresql://conectados:conectados_dev@localhost:5432/conectados?schema=public"
DATABASE_URL_NEON=""
APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@conectados.local"
ADMIN_PASSWORD="conectados"
R2_BUCKET_URL=""
R2_PUBLIC_BASE_URL=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
```

Notas:

- `DATABASE_URL` sirve para PostgreSQL local.
- `DATABASE_URL_NEON` se usa como prioridad cuando existe.
- `APP_URL` define la URL canonica para `metadata`, `robots` y `sitemap`.
- La clave de R2 debe tener permisos de lectura y escritura sobre el bucket.

## Desarrollo local

1. Instala dependencias:

```bash
npm install
```

2. Prepara la base de datos:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

3. Inicia la app:

```bash
npm run dev
```

La app queda en `http://localhost:3000`.

## Produccion en Vercel

1. Configura en Vercel:
   - `DATABASE_URL_NEON`
   - `APP_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `R2_BUCKET_URL`
   - `R2_PUBLIC_BASE_URL`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
2. Ejecuta migraciones contra Neon antes del primer despliegue productivo.
3. Verifica que la Access Key de R2 tenga escritura sobre el bucket configurado.
4. Despliega con:

```bash
npm run build
```

## Comandos utiles

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run db:generate
npm run db:migrate
npm run db:seed
```
