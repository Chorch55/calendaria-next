# CalendarIA

Plataforma de calendario y comunicaciones unificadas con IA. SaaS multi‑tenant con planes, add‑ons y límites por suscripción.

---

## 📋 Tabla de contenidos

1) Requisitos previos
2) Instalación rápida
3) Variables de entorno
4) Scripts disponibles
5) Estructura del proyecto
6) Funcionalidades principales
7) Despliegue
8) Tecnologías y decisiones técnicas

---

## 🛠 Requisitos previos

- Node.js 18+ (recomendado 20+)
- pnpm
- Docker (para la base de datos local con Postgres)
- Cuenta en Stripe (para pruebas de suscripción)

---

## 🚀 Instalación rápida

1) Instalar dependencias

```powershell
pnpm install
```

2) Levantar la base de datos (PostgreSQL via Docker Compose)

```powershell
pnpm db:start
```

3) Configurar variables de entorno (ver sección siguiente) y aplicar Prisma

```powershell
# crear .env.local y ejecutar migraciones
# (si no existen migraciones, generarlas primero en desarrollo)
npx prisma migrate dev
```

4) Arrancar en desarrollo

```powershell
pnpm dev
```

---

## 🔒 Variables de entorno

Mínimas para arrancar en local:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
NEXTAUTH_SECRET=your-long-random-secret
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
# IA (Genkit + GoogleAI)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

Opcionales, según integración:

- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
- SENTRY_DSN=... (si se habilita observabilidad con Sentry)

El archivo `.env.local` no se versiona. Asegúrate de que `DATABASE_URL` apunta a tu Postgres local o gestionado.

---

## 📦 Scripts disponibles

| Comando             | Descripción                                          |
| ------------------- | ---------------------------------------------------- |
| `pnpm dev`          | Next.js en desarrollo (Turbopack)                    |
| `pnpm build`        | Compila para producción                              |
| `pnpm start`        | Arranca en producción                                |
| `pnpm lint`         | Linter                                              |
| `pnpm db:start`     | Inicia Postgres (Docker Compose simple)              |
| `pnpm db:stop`      | Detiene Postgres                                     |
| `pnpm db:restart`   | Reinicia Postgres                                    |
| `pnpm db:reset`     | Reinicia contenedor borrando datos (desarrollo)      |
| `pnpm db:logs`      | Logs del contenedor de base de datos                 |

---

## 🗂 Estructura del proyecto

```
/
├─ app/                       # App Router (Next.js 15)
├─ src/
│  ├─ ai/                     # Flujos Genkit (assistant)
│  ├─ config/                 # Matriz de features y configuración
│  ├─ lib/                    # Prisma, Stripe, auth helpers, cachés
│  └─ components/             # UI (shadcn/Radix), pricing, layouts
├─ prisma/                    # schema.prisma y migraciones
├─ public/                    # estáticos
├─ docker-compose.simple.yml  # Postgres local
└─ README.md
```

---

## ✨ Funcionalidades principales

Resumen (detallado en `FUNCIONALIDADES.md`):

- Multi‑tenant: compañías, usuarios, invitaciones y roles.
- Suscripciones y add‑ons con Stripe. Límites por plan y gating de features.
- Panel de uso (límites/consumo) y API pública de configuración de planes.
- Recordatorios y automatizaciones básicas (endpoints /api/reminders, /api/webhooks).
- Asistente conversacional integrado (Genkit + GoogleAI).
- UI moderna con Tailwind + shadcn/Radix y comparativa de precios.

Más detalle y estado por módulo: ver `FUNCIONALIDADES.md`.

---

## 🌐 Despliegue

- Frontend/SSR: Vercel (recomendado). Configura las mismas variables de entorno.
- Base de datos: PostgreSQL gestionado (Neon, Railway, Render, etc.). Ajusta `DATABASE_URL`.
- Stripe: configura webhooks y precios (products/prices) para planes y add‑ons.

---

## 🧪 Notas de desarrollo

- Tipos y ESLint están configurados para no bloquear builds en CI mientras evoluciona el proyecto (`ignoreBuildErrors`, `ignoreDuringBuilds`).
- Prisma Client se inicializa de forma segura en desarrollo para evitar múltiples instancias.

---

## 🧰 Tecnologías y decisiones técnicas

- Next.js 15 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 + Radix UI + shadcn/ui
- Prisma ORM 6 + PostgreSQL (Docker en local)
- Autenticación: NextAuth (Credentials) + JWT
- Pagos y suscripciones: Stripe (SDK Server)
- IA: Genkit + @genkit-ai/googleai (Gemini 2.0 Flash)
- Caché simple in‑memory (TTL) para resúmenes de uso
- Docker Compose para desarrollo de BBDD

Nota: el proyecto ya no usa Supabase. La API/ORM principal es Prisma sobre PostgreSQL. Integraciones como N8N o Redis/BullMQ no están activas en el código actual.