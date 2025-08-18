# Funcionalidades de CalendarIA (memoria funcional)

Documento de referencia vivo para entender qué hace cada módulo, qué pantallas existen, el estado de cada funcionalidad y cómo se conectan con el backend. Sirve como guía para desarrollo, QA y producto.

---

## 1. Autenticación y multitenancy

- Stack: NextAuth (credenciales) + Prisma + JWT.
- Modelos: `User`, `Company`, `Invitation`.
- Flujo:
   1) Login con email/contraseña.
   2) Invitaciones vía email (token) para unirse a una compañía.
   3) El token JWT incluye `role`, `companyId` y `companyName`.
- Páginas: `/auth/login-mt` (custom signIn).
- Código clave: `src/lib/auth.ts`, `src/lib/auth-helpers.ts`.
- Estado: Hecho. Roles disponibles: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `EMPLOYEE`, `USER`.

Pendiente:
- [ ] Páginas de recuperación de contraseña y cambio de contraseña.

---

## 2. Suscripciones, planes y add‑ons

- Stack: Stripe (server SDK), Prisma.
- Modelos: `Subscription`, `SubscriptionAddon`, `Invoice`.
- Endpoints: `/api/billing/*` (portal, cambio plan, add-on), `/api/subscription/*`, `/api/webhooks/*` (Stripe).
- Configuración:
   - Límites/planes: `src/lib/stripe.ts` (`PLAN_LIMITS`, `STRIPE_PLANS`, `STRIPE_ADDONS`).
   - Feature gating: `src/config/features.ts` (`FEATURE_MATRIX`).
   - UI comparativa: `src/components/ui/pricing-comparison.tsx` (llama a `/api/config/plans`).
- Estado: Hecho (webhook básico y cálculo de límites). Pendiente completar casos edge en webhooks y enforcers runtime para todos los recursos.

Pendiente:
- [ ] Enforcers completos: recordatorios y API calls (cuota mensual + rate limit).
- [ ] Pruebas automáticas de cálculo de límites (plan + add‑ons) y packs de usuarios.

---

## 3. Panel y uso (dashboard)

- Objetivo: mostrar plan activo, consumo vs límites, avisos de cercanía.
- Fuente: `getUsageSummary(companyId)` en `src/lib/middleware/limits.ts` con caché TTL.
- Estado: Backend listo. UI básica en `components/dashboard/usage-overview.tsx` (si aplica) y se integra en el layout del dashboard.

Pendiente:
- [ ] Tarjetas/indicadores de uso visibles en el dashboard principal.

---

## 4. Agenda, servicios y reservas

- Modelos: `Service`, `Booking`, `Schedule`, `Payment`.
- Funciones:
   - Definición de servicios (duración, precio, estado).
   - Creación/edición de citas (estado: pending, confirmed, cancelled, completed).
   - Horarios de personal con `Schedule` por día de la semana.
   - Pagos asociados a `Booking` (Stripe/Cash/Transfer…).
- Estado: Modelado completo en Prisma. Falta wiring de UI de reserva pública y flujos de confirmación/recordatorio.

Pendiente:
- [ ] Widget público de reserva embebible.
- [ ] Envío de recordatorios usando límites del plan.

---

## 5. Contactos y empresas (mini‑CRM)

- Modelos: `Company`, `User` (asociación), y entidades relacionadas en reservas y servicios.
- Funciones: listado, creación, edición, búsqueda y filtros.
- Estado: Estructura de datos disponible. UI CRUD por completar.

Pendiente:
- [ ] Vistas CRUD de empresas y contactos con filtros.

---

## 6. Llamadas y analítica

- Funciones previstas: bot de voz, transferencia a humano, grabación, resúmenes IA, analítica avanzada.
- Estado: Gating por features y precios definidos. Implementación de telefonía/voz pendiente de integrar con proveedor.

Pendiente:
- [ ] Integración proveedor de voz (SIP/CPaaS) y webhooks.
- [ ] Grabaciones seguras y retención.

---

## 7. Tareas (Kanban)

- Modelo: `Task` (status: todo, in_progress, completed, cancelled; prioridad; due_date; asignación).
- Funciones: crear, asignar, mover entre columnas, filtros.
- Estado: Modelo listo. UI Kanban a implementar.

Pendiente:
- [ ] Tablero Kanban con drag & drop y permisos.

---

## 8. RR. HH.: Horas y ausencias

- Modelos: `TimeLog` (fichaje y horas), `Schedule` (turnos).
- Funciones: fichaje entrada/salida, cálculo de horas, calendario mensual, ausencias.
- Estado: Modelos listos, UI por implementar.

Pendiente:
- [ ] Fichaje y calendario de ausencias con validaciones.

---

## 9. Asistente con IA

- Stack: Genkit + @genkit-ai/googleai (Gemini 2.0 Flash).
- Código: `src/ai/genkit.ts`, `src/ai/flows/assistant-flow.ts`.
- Funciones: preguntas/respuestas guiadas sobre el uso de la app, ayuda contextual.
- Estado: Listo (flow server). UI de chat a integrar en dashboard.

Pendiente:
- [ ] Componente de chat en dashboard con llamadas a `askAssistant`.

---

## 10. API y seguridad

- Endpoints clave (App Router):
   - `/api/api-keys/*`: gestión de API keys por compañía.
   - `/api/billing/*`: portal, cambio de plan, add‑ons, facturas.
   - `/api/config/*`: configuración pública (planes y límites).
   - `/api/invitations/*`: invitaciones a usuarios.
   - `/api/reminders/*`: envío y tracking de recordatorios.
   - `/api/subscription/*`: estado y cambios de suscripción.
   - `/api/usage/*`: consumo y límites.
   - `/api/webhooks/*`: webhooks (Stripe, futuros integradores).
- Guards: `requireCompany`, `requireRole` y middleware `withLimitsCheck`/`createLimitsMiddleware`.
- Estado: Listo a nivel de helpers y estructura. Endpoints de negocio se irán completando iterativamente.

---

## 11. UI/UX y componentes

- Base: Tailwind 4 + Radix + shadcn UI.
- Componentes destacados: `pricing-comparison`, `addon-card`, layouts modernos.
- Estado: Pricing comparativo animado y layout público listos; dashboard en construcción.

Pendiente:
- [ ] Páginas CRUD y vistas de detalle (servicios, reservas, tareas, RR. HH.).

---

## 12. Observabilidad y calidad

- Sentry (opcional): paquete presente, wiring aún no activado.
- Caché in‑memory TTL para datos de uso.
- Lint/Typescript no bloquean build durante la fase inicial.

Pendiente:
- [ ] Habilitar Sentry en `@sentry/nextjs` y DSN por entorno.
- [ ] Tests unitarios y de integración mínimos.

---

## 13. Glosario rápido

- Planes: BASIC (Individual), PREMIUM (Professional), ENTERPRISE (Enterprise).
- Add‑on: Extra que habilita capacidades adicionales o amplía límites.
- Gating: control de acceso a features según plan/add‑on (`FEATURE_MATRIX`).

---

## 14. Siguientes pasos sugeridos

1) Conectar UI del dashboard con `getUsageSummary` y mostrar límites/uso.
2) Completar enforcers de recordatorios y API calls.
3) Implementar Kanban de tareas y fichaje RR. HH.
4) Implementar widget público de reserva y recordatorios.
5) Activar Sentry y añadir tests de regresión en billing/webhooks.
