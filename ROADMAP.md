# Roadmap de CalendarIA

Esta hoja de ruta sirve para seguir el progreso (✔ Hecho, ☐ Pendiente). Iremos marcando y afinando según avanzamos.

## Hecho
- ✔ Multitenancy y auth con NextAuth + Prisma
- ✔ Invitaciones (enviar, aceptar, revocar, reenvío)
- ✔ Selección de plan y add-ons en signup
- ✔ Config central de planes, límites y add-ons (public y server)
- ✔ Tabla de precios alineada (capacidades claras, Enterprise 50 usuarios, sin “integraciones incluidas”)
- ✔ API de billing (portal, cambio plan, add-on)
- ✔ Webhook Stripe básico (estado suscripción, items de add-ons, facturas)
- ✔ Cálculo de límites efectivos (plan + add-ons) y gating por features
- ✔ API pública de config
- ✔ API Keys y guards requireCompany/requireRole
- ✔ JSON seguro para BigInt
- ✔ Documentación comercial (FUNCIONALIDADES.md) alineada

## En curso / Siguiente (prioritario)
- ☐ Enforcers de límites en runtime
  - ✔ Usuarios: impedir crear > max_users (plan + packs) [Invitaciones: envío/aceptación]
  - ☐ Recordatorios: bloquear al superar “incluidos” (sin cobro extra)
  - ☐ API calls: rate limiting/cuota mensual + logging
- ☐ Webhooks Stripe (casos edge): prorrateo, downgrade/upgrade con quantities, cancel_at_period_end, reintentos + idempotencia
- ☐ Tests mínimos (unit + integration): límites efectivos, packs 5 usuarios, signup → Stripe items, webhook sync
- ☐ i18n: completar keys nuevas de pricing + enforcers
- ☐ Observabilidad: logging estructurado y métricas de consumo por compañía
- ☐ Cohesión de “integraciones”: limpiar config si no se usa o redefinir política

## Backlog / Nice to have
- ☐ Auto-provisión de suscripción tras signup (menos fricción)
- ☐ Panel de uso/consumo en dashboard (avisos de cercanía a límite)
- ☐ Auditoría/export (GDPR) y backups/DR

---

## Sesión actual
- Tarea 1: Enforcer de límite de usuarios (crear/invitar). Estado: Hecho.
- Tarea 2: Recordatorios – helpers añadidos (ensureCanSendReminder/trackReminderSent). Pendiente de cablear en el flujo de envío.
  - Endpoint creado: POST /api/reminders/send con enforcement y tracking (envío simulado por ahora).
