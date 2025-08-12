¡Perfecto! He reescrito tu README para que explique de forma clara todo lo que hace **CalendarIA** y, además, incluya un apartado de **planes, precios y add-ons** (según la tabla de tu captura). Lo tienes listo para copiar/pegar:

---

# CalendarIA

**CalendarIA** es una plataforma de comunicación unificada y calendario con IA para automatizar citas, centralizar mensajes (Email/WhatsApp/SMS), gestionar equipo y tareas, y analizar llamadas con ayuda de modelos de inteligencia artificial.

## Tecnologías

* **Frontend:** Next.js + Tailwind CSS + shadcn/ui
* **Autenticación:** NextAuth.js (JWT, Credentials Provider)
* **Base de datos:** PostgreSQL + Prisma ORM
* **Automatización:** N8N vía webhooks/API
* **Pagos:** Stripe Checkout
* **Hosting:** Frontend en Vercel; backend/BD en PostgreSQL
* **Seguridad:** HTTPS, JWT, control de roles/permisos, variables de entorno protegidas

---

## Funcionalidades

### 1) Bandeja de entrada unificada

* Centraliza **Gmail/Outlook**, **WhatsApp** y **SMS** en un solo lugar.
* Etiquetado por canal y estado; búsqueda y filtrado.
* IA para **resumir**, **responder automáticamente** y marcar **“requiere atención”**.
* Registro de conversación por hilo y trazabilidad.

### 2) Reserva online y calendario

* Widget de **reserva de citas** para clientes.
* Gestión de **servicios**, huecos y citas programadas.
* Recordatorios automáticos (ver límites por plan en “Precios”).

### 3) Contactos y empresas (mini-CRM)

* Altas, edición y búsqueda avanzada de **contactos** y **empresas**.
* Favoritos, filtros por texto y relación contacto⇄empresa.
* Vista vinculada: al abrir una empresa, ves sus contactos asociados.

### 4) Llamadas telefónicas y bot de voz

* **Bot de llamadas** que atiende como un humano y puede **concertar citas**.
* **Transferencia a agente humano** (según plan).
* **Registro de llamadas** con **resumen por IA**, **análisis de sentimiento** y enlace a **grabación** (si está activada).
* **Analítica avanzada** opcional (palabras clave, perfilado, etc., según plan).

### 5) Gestión de tareas (Kanban)

* Tablero estilo Kanban para **crear, asignar y mover tareas** por estados.
* Formularios de creación/edición y filtros.

### 6) Control horario y ausencias (RR. HH.)

* **Fichaje** (entrada/salida), cómputo de tiempo por tarea y edición puntual.
* **Calendario mensual** y **solicitudes de vacaciones/ausencias** con validaciones.
* (Módulo RR. HH. incluido o como add-on según plan.)

### 7) Asistente conversacional con IA

* **Chat** con un asistente entrenado en CalendarIA (vía **Genkit**).
* Explica funciones, guía al usuario y sugiere acciones en la app.

### 8) Personalización, conexiones e integraciones

* Conexión de **cuentas**: Gmail, Outlook, WhatsApp, teléfono (estado por conexión).
* **Ajustes de interfaz**: orden del menú, idioma, tamaño de fuente, notificaciones.
* **Gestión de equipo y roles**: invita usuarios y define permisos.
* **Automatizaciones N8N** para flujos personalizados (webhooks/API).

---

## Planes, precios y add-ons

> Los planes de CalendarIA se ofrecen en tres modos: **Basic**, **Professional** y **Enterprise**.
> Los precios son **mensuales** y **orientativos** (pueden variar). La contratación y el cobro se realizan mediante **Stripe Checkout**.

### Comparativa de planes

| Característica                                               |        **Basic** |     **Professional** |                  **Enterprise** |
| ------------------------------------------------------------ | ---------------: | -------------------: | ------------------------------: |
| **Precio**                                                   |     **19 €/mes** |         **99 €/mes** |                   **299 €/mes** |
| **Reserva online y calendario**                              |               ✔︎ |                   ✔︎ |                              ✔︎ |
| **Bot de Email** (responde y agenda por email)               |               ✔︎ |                   ✔︎ |                              ✔︎ |
| **Bot de WhatsApp** (responde y agenda por WhatsApp)         |               ✔︎ |                   ✔︎ |                              ✔︎ |
| **Gestión de contactos**                                     |               ✔︎ |                   ✔︎ |                              ✔︎ |
| **Bandeja unificada (WhatsApp, Email, SMS)**                 |               ✔︎ |                   ✔︎ |                              ✔︎ |
| **Usuarios incluidos**                                       |            **1** |               **20** |                          **50** |
| **Bot de llamadas (voz)**                                    | **Add-on +10 €** |                   ✔︎ |                              ✔︎ |
| **Transferencia de llamadas a humanos**                      |                — |                   ✔︎ |                              ✔︎ |
| **Recordatorios incluidos**                                  |           **50** |              **200** |                       **1.000** |
| **Idiomas incluidos**                                        |           **ES** |            **ES/EN** |        **ES/EN/FR/DE/PT/IT/AR** |
| **Grabación de llamadas**                                    | **Add-on +15 €** |     **Add-on +10 €** |                              ✔︎ |
| **IA chat integrable personalizada** (widget embebible)      | **Add-on +10 €** |      **Add-on +5 €** |                              ✔︎ |
| **Módulo RR. HH.** (horas, vacaciones, ausencias)            | **Add-on +20 €** |     **Add-on +20 €** |                              ✔︎ |
| **Gestión de tareas (Kanban)**                               |                — |     **Add-on +20 €** |                              ✔︎ |
| **Estadísticas de personal y monitorización en tiempo real** |                — |     **Add-on +25 €** |                              ✔︎ |
| **Analítica avanzada de llamadas**                           |                — |     **Add-on +25 €** |                              ✔︎ |
| **Atención al cliente**                                      |        **Email** | **WhatsApp + Email** | **Teléfono + WhatsApp + Email** |

**Notas sobre idiomas (multilingüe):**

* **Basic:** Español incluido. Otros idiomas (**EN, FR, DE, PT, IT, AR**) a **+5 € por idioma** o **+15 € pack completo**.
* **Professional:** Español e inglés incluidos. Idiomas extra a **+4 € por idioma** o **+10 € pack completo**.
* **Enterprise:** Todos los idiomas anteriores incluidos.

**Usuarios adicionales (packs):**

* **Basic:** packs de **5 usuarios** a **+7,99 €**/mes por pack.
* **Professional:** packs de **5 usuarios** a **+6,99 €**/mes por pack.
* **Enterprise:** packs de **5 usuarios** a **+5,99 €**/mes por pack.

**Recordatorios:**

* Cada plan incluye un cupo mensual. Si necesitas más, puedes ampliar tu plan o solicitar un incremento de cupo desde soporte. (Se contabilizan recordatorios enviados por email/SMS/WhatsApp según configuración y disponibilidad del canal).

### Add-ons disponibles (resumen)

* **Bot de llamadas (Basic):** +10 €/mes
* **Grabación de llamadas:** +15 €/mes (Basic) · +10 €/mes (Professional)
* **IA chat integrable personalizada:** +10 €/mes (Basic) · +5 €/mes (Professional)
* **RR. HH. (horas, vacaciones, ausencias):** +20 €/mes (Basic/Professional)
* **Gestión de tareas (Kanban):** +20 €/mes (Professional)
* **Estadísticas de personal y monitorización en tiempo real:** +25 €/mes (Professional)
* **Analítica avanzada de llamadas:** +25 €/mes (Professional)
* **Idiomas adicionales:** ver notas por plan
* **Usuarios extra:** packs de 5 (precio por plan)

> **Cómo se factura:** Los add-ons y packs se **suman al plan base** y se cobran mensualmente vía **Stripe**. Puedes activar/desactivar add-ons según tus necesidades.

---

## Requisitos y despliegue

1. **Variables de entorno** (ejemplos):

   * `DATABASE_URL` (PostgreSQL)
   * `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
   * Credenciales de Gmail/Outlook/WhatsApp/N8N/Stripe
2. **Migraciones:** `prisma migrate deploy`
3. **Build:** `pnpm build`
4. **Start:** `pnpm start` (o despliegue en Vercel para frontend)

> La app utiliza **NextAuth** para autenticación, **Prisma** para acceso a datos, y **N8N** para flujos de automatización. Stripe gestiona el checkout y la suscripción.

---

## Seguridad y privacidad

* Comunicación sobre **HTTPS**, tokens **JWT**, y **roles/permiso** por área.
* Principio de **mínimos privilegios** para integraciones.
* Registros esenciales para auditoría (eventos clave, llamadas y actividad de IA).

---

## Soporte

* **Basic:** atención por **email**.
* **Professional:** **WhatsApp + email**.
* **Enterprise:** **teléfono + WhatsApp + email**.

---

### FAQ (breve)

* **¿Puedo ampliar usuarios sin cambiar de plan?** Sí: packs de 5 usuarios (precio según plan).
* **¿Qué ocurre al superar los recordatorios incluidos?** Se aplica el precio por unidad del plan.
* **¿Puedo usar varios idiomas?** Sí. En Basic/Professional puedes añadir idiomas o activar el pack completo; en Enterprise todos ya están incluidos.
* **¿Cómo activo add-ons?** Desde la configuración de tu espacio. La facturación se gestiona por **Stripe**.

---

¿Quieres que lo entregue también en **inglés** o que lo formatee con un **índice** al principio? Si te va bien, lo dejo así para sustituir tu README actual.
