# 🚀 Supabase Local Development Setup

Este proyecto está configurado para trabajar tanto con Supabase en la nube como en local.

## 📋 Prerrequisitos

1. **Docker Desktop** - Descarga e instala desde [docker.com](https://www.docker.com/products/docker-desktop/)
2. **Node.js y pnpm** (ya tienes instalados)

## 🔧 Configuración Local

### 1. Iniciar Docker Desktop
Asegúrate de que Docker Desktop esté corriendo antes de continuar.

### 2. Iniciar Supabase Local
```bash
# Iniciar todos los servicios de Supabase
pnpm run db:start

# Ver logs de los servicios
pnpm run db:logs

# Parar los servicios
pnpm run db:stop

# Resetear la base de datos (elimina todos los datos)
pnpm run db:reset
```

### 3. Cambiar entre Entornos

#### Para usar Supabase LOCAL:
```bash
pnpm run env:local
pnpm run dev:local
```

#### Para usar Supabase REMOTO (nube):
```bash
pnpm run env:remote
pnpm run dev
```

## 🌐 URLs y Accesos

### Supabase Local:
- **API URL**: http://127.0.0.1:54321
- **Studio (Dashboard)**: http://127.0.0.1:54323
- **Base de datos**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Email Testing**: http://127.0.0.1:54324

### Credenciales por defecto:
- **Database Password**: `postgres`
- **JWT Secret**: `super-secret-jwt-token-with-at-least-32-characters-long`

## 📁 Estructura de Archivos

```
supabase/
├── config.toml           # Configuración principal
├── migrations/           # Migraciones de BD
│   └── 20250804000000_init.sql
├── seed.sql             # Datos iniciales
├── functions/           # Edge Functions
│   ├── hello/
│   └── main/
└── volumes/             # Datos persistentes
    ├── api/
    │   └── kong.yml     # Configuración API Gateway
    └── storage/         # Archivos subidos
```

## 🔄 Comandos Útiles

```bash
# Desarrollo
pnpm run dev          # Usar Supabase remoto
pnpm run dev:local    # Usar Supabase local

# Base de datos
pnpm run db:start     # Iniciar Supabase local
pnpm run db:stop      # Parar Supabase local
pnpm run db:reset     # Resetear BD local
pnpm run db:logs      # Ver logs

# Entornos
pnpm run env:local    # Cambiar a local
pnpm run env:remote   # Cambiar a remoto
```

## 🗃️ Archivos de Entorno

- `.env.local` - Variables activas (cambia según el entorno)
- `.env.local.supabase` - Configuración para Supabase local
- `.env.local.remote` - Configuración para Supabase remoto

## 🔀 Migración de Datos

### De Remoto a Local:
1. Exporta datos desde Supabase Studio (remoto)
2. Inicia Supabase local: `pnpm run db:start`
3. Importa datos en http://127.0.0.1:54323

### De Local a Remoto:
1. Exporta datos desde Studio local
2. Importa en tu proyecto de Supabase en la nube

## ✅ Ventajas del Setup Local

- **Sin límites** de requests, storage, usuarios
- **Desarrollo offline**
- **Testing rápido** sin latencia de red
- **Control total** sobre la configuración
- **Migración fácil** a producción

## 🚀 Siguiente Paso

1. **Inicia Docker Desktop**
2. Ejecuta: `pnpm run db:start`
3. Espera a que todos los servicios estén corriendo
4. Ve a http://127.0.0.1:54323 para acceder a Supabase Studio
5. Ejecuta: `pnpm run dev:local`

## 🆘 Troubleshooting

### Docker no funciona:
- Asegúrate de que Docker Desktop esté ejecutándose
- Reinicia Docker Desktop si es necesario

### Puerto ocupado:
- Los puertos 54321-54324 deben estar libres
- Cambia los puertos en `docker-compose.supabase.yml` si es necesario

### Servicios no inician:
- Ejecuta `pnpm run db:logs` para ver errores
- Ejecuta `pnpm run db:reset` para reiniciar limpio

¡Ya tienes todo configurado para desarrollar con Supabase local! 🎉
