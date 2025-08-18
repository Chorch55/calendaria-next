# Verificación de Add-ons y planes (memoria de precios)

Documento de referencia para alinear los precios/planes del sitio con la implementación real en el código. Los nombres de plan se corresponden con las claves del backend: BASIC (Individual), PREMIUM (Professional) y ENTERPRISE (Enterprise).

---

## 🧭 Resumen por característica

| # | Característica                                     | BASIC (Individual)        | PREMIUM (Professional) | ENTERPRISE |
| - | -------------------------------------------------- | ------------------------- | ---------------------- | ---------- |
| 1 | Añadir usuarios (pack 5)                           | +7,99 €                   | +6,99 €                | +5,99 €    |
| 2 | Bot de llamadas (voz)                              | +10 €                     | Incluido               | Incluido   |
| 3 | Transferencia de llamadas a humano                 | —                         | Incluido               | Incluido   |
| 4 | Recordatorios incluidos                             | 50 (+0,05 €/u extra)      | 200 (+0,03 €/u extra)  | 1000 (+0,015 €/u extra) |
| 5 | Multilingüe (pack)                                 | +15 € (todos)             | +10 € (todos)          | Incluido   |
| 6 | Grabación de llamadas                              | +15 €                     | +10 €                  | Incluido   |
| 7 | IA chat integrable (widget)                        | +10 €                     | +5 €                   | Incluido   |
| 8 | Gestión de personal (RR. HH.)                      | +20 €                     | +20 €                  | Incluido   |
| 9 | Gestión de tareas (Kanban equipo)                  | —                         | +20 €                  | Incluido   |
|10 | Estadísticas de personal y tiempo real             | —                         | +25 €                  | Incluido   |
|11 | Analítica avanzada de llamadas                     | —                         | +25 €                  | Incluido   |

Notas:
- “—” significa no disponible en ese plan base.
- Los add‑ons se suman al precio del plan y se facturan mensualmente en Stripe.

---

## � Mapeo con el código

- Matriz de features: `src/config/features.ts` (FEATURE_MATRIX) controla qué features vienen por plan o por add‑on.
- Límites de plan y catálogos Stripe (server): `src/lib/stripe.ts` define `STRIPE_PLANS`, `STRIPE_ADDONS` y `PLAN_LIMITS`.
- UI de tabla de precios: `src/components/ui/pricing-comparison.tsx` (lee `/api/config/plans`).
- Enforcers y chequeso de límites: `src/lib/middleware/limits.ts` y `SubscriptionService`.

Si cambias precio/nombre en Stripe, recuerda actualizar:
1) Precios/Product IDs en `STRIPE_PLANS` y `STRIPE_ADDONS` (server).
2) Copia/leyendas en `pricing-comparison.tsx` y traducciones.
3) Reglas en `FEATURE_MATRIX` si la disponibilidad por plan cambia.

---

## 📊 Precios base de planes

- Individual (BASIC): 19 €/mes
- Professional (PREMIUM): 99 €/mes
- Enterprise (ENTERPRISE): 299 €/mes

---

## ✅ Estado de verificación

- Añade usuarios: Implementado
- Bot de llamadas: Implementado
- Transferencia a humano: Implementado
- Recordatorios (cupos y unitarios): Implementado (pendiente cableado completo en envío)
- Multilingüe (pack): Implementado (gating por feature)
- Grabación de llamadas: Implementado (gating por feature)
- IA chat integrable: Implementado
- Gestión de personal (RR. HH.): Implementado
- Gestión de tareas: Implementado
- Estadísticas de personal y tiempo real: Implementado
- Analítica avanzada de llamadas: Implementado

Este documento sirve de “fuente de verdad comercial” y memoria para QA y producto.
