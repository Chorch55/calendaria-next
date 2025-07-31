# CalendarIA

**CalendarIA** es una plataforma de comunicaciones y calendario potenciada con IA, construida con **Next.js**, **Tailwind CSS** y **shadcn/ui**, e integrada con servicios como **Supabase**, **Stripe** y **N8N**.

---

## 📋 Tabla de contenidos

1. [Requisitos previos](#-requisitos-previos)
2. [Instalación](#-instalación)
3. [Variables de entorno](#-variables-de-entorno)
4. [Scripts disponibles](#-scripts-disponibles)
5. [Estructura del proyecto](#-estructura-del-proyecto)
6. [Funcionalidades principales](#-funcionalidades-principales)
7. [Workflow de desarrollo](#-workflow-de-desarrollo)
8. [Despliegue](#-despliegue)

---

## 🛠 Requisitos previos

* **Node.js** v18 o superior
* **pnpm** (recomendado para instalar dependencias)
* Cuenta activa en **Supabase** con un proyecto configurado
* (Opcional) Cuenta en **Stripe** y **N8N** para pagos y automatizaciones

---

## 🚀 Instalación

Clona el repositorio e instala las dependencias usando **pnpm**:

```bash
git clone https://github.com/tu-usuario/calendaria-next.git
cd calendaria-next
pnpm install
```

> **Importante:** No mezclar con `npm` o `yarn`, siempre usar `pnpm` para garantizar compatibilidad y reproducibilidad.

---

## 🔒 Variables de entorno

Copia el fichero de ejemplo y rellena tus credenciales:

```bash
cp .env.example .env.local
```

Edita `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=your-stripe-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
N8N_WEBHOOK_BASE_URL=http://localhost:5678
```

> El fichero `.env.local` está ignorado por Git (`.gitignore`), mientras que `.env.example` sí debe versionarse.

---

## 📦 Scripts disponibles

| Comando       | Descripción                            |
| ------------- | -------------------------------------- |
| `pnpm dev`    | Arranca el servidor en modo desarrollo |
| `pnpm build`  | Compila la aplicación para producción  |
| `pnpm start`  | Inicia el servidor en modo producción  |
| `pnpm lint`   | Ejecuta ESLint                         |
| `pnpm format` | Formatea el código con Prettier        |

---

## 🗂 Estructura del proyecto

```
/
├── app/                   # Rutas de Next.js (App Router)
├── components/            # Componentes reutilizables (UI, layouts)
├── lib/                   # Clientes y utilidades (supabaseClient, stripe)
├── prisma/                # (Opcional) Esquema de Prisma
├── public/                # Archivos estáticos
├── styles/                # CSS global y configuraciones
├── .env.example           # Plantilla de variables de entorno
├── tailwind.config.ts     
├── postcss.config.mjs     
├── next.config.js         
└── README.md              # Documentación del proyecto
```

---

## ✨ Funcionalidades principales

Consulta [`FUNCIONALIDADES.md`](./FUNCIONALIDADES.md) para un detalle completo. A grandes rasgos:

* **Bandeja de entrada unificada**: Gmail, Outlook y WhatsApp con IA para respuestas y resúmenes.
* **Calendario & eventos**: Crear, editar, eliminar y listar eventos con RLS en Supabase.
* **Kanban de tareas**: Tablero para gestión de tareas en equipo.
* **Registro de llamadas**: Summaries de llamadas y análisis de sentimiento.
* **Contactos & empresas**: CRUD completo con filtros y diálogos.
* **Control horario & ausencias**: Tracking de horas y gestión de vacaciones.
* **Asistente conversacional**: Chat integrado usando Genkit.
* **Automatizaciones IA**: Workflows en N8N conectados vía webhooks.
* **Pagos**: Stripe Checkout para suscripciones y cargos puntuales.
* **Roles & seguridad**: RLS, JWT, HTTPS y roles custom en Supabase.

---

## 🧑‍💻 Workflow de desarrollo

1. **Clonar** e **instalar** dependencias con `pnpm install`.
2. **Configurar** credenciales en `.env.local`.
3. **Ejecutar** `pnpm dev` para desarrollo.
4. **Crear** nuevas ramas por funcionalidad o bugfix.
5. **Commit** con mensajes claros (ej. `feat: ...`, `fix: ...`).
6. **Abrir PR** para revisión y merge.
7. **Desplegar** en Vercel o tu plataforma preferida.

---

## 🌐 Despliegue

Recomendamos **Vercel** para el hosting frontend (Next.js) y **Supabase** para backend y BBDD:

1. Conecta tu repositorio en Vercel y configura las mismas variables de entorno.
2. En Supabase, asegúrate de tener RLS activado y las políticas definidas.
3. Para Stripe y N8N, configura sus webhooks apuntando a tu dominio de producción.

¡Y listo! Tu aplicación estará en línea con HTTPS y escalable.

