# 🤝 Configuración para Colaboradores - CalendarIA

## 📥 Cómo obtener el proyecto

```bash
# Clona el repositorio
git clone https://github.com/Chorch55/calendaria-next.git

# Entra al directorio del proyecto
cd calendaria-next

# Instala las dependencias
pnpm install
```

## 🔧 Configuración inicial

### 1. Variables de entorno
Copia el archivo de ejemplo y configura las variables:

```bash
# Copia el archivo de ejemplo
cp .env.example .env.local
```

### 2. Configuración mínima para desarrollo
Edita `.env.local` con estas variables básicas:

```env
# Base de datos (puedes usar la de Supabase incluida para desarrollo)
NEXT_PUBLIC_SUPABASE_URL=https://lfhkozbdyqbvklefjgan.supabase.co/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaGtvemJkeXFidmtsZWZqZ2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTMyOTcsImV4cCI6MjA2ODgyOTI5N30.JWHhLYvX5-BY6TG_k-fhVtarqlKgl8HU1X1nHwhvGkw

# Autenticación (para desarrollo local)
NEXTAUTH_SECRET=tu-secret-key-aqui
NEXTAUTH_URL=http://localhost:3000

# Stripe (keys de prueba - solicitar al owner del proyecto)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🚀 Iniciar el proyecto

### Opción 1: Con base de datos en la nube (Supabase)
```bash
# Inicia el servidor de desarrollo
pnpm run dev
```

### Opción 2: Con base de datos local (Docker)
```bash
# Inicia la base de datos local
pnpm run db:start

# En otra terminal, inicia el servidor
pnpm run dev
```

## 🌐 Acceder a la aplicación

Una vez iniciado, abre tu navegador en:
- **Aplicación**: http://localhost:3000
- **Base de datos local** (si usas Docker): http://localhost:8080 (Adminer)

## 📝 Scripts útiles

```bash
# Desarrollo
pnpm run dev              # Servidor de desarrollo
pnpm run dev:local        # Desarrollo con env local

# Base de datos
pnpm run db:start         # Iniciar DB local
pnpm run db:stop          # Detener DB local
pnpm run db:restart       # Reiniciar DB local
pnpm run db:reset         # Reset completo de DB

# Producción
pnpm run build            # Build para producción
pnpm run start            # Iniciar en modo producción
```

## 🆘 Problemas comunes

### Error de instalación de dependencias
```bash
# Limpia la caché y reinstala
pnpm store prune
rm -rf node_modules
pnpm install
```

### Error de base de datos
```bash
# Si usas Docker, reinicia los contenedores
pnpm run db:reset
```

### Error de autenticación
- Asegúrate de tener `NEXTAUTH_SECRET` configurado
- Verifica que `NEXTAUTH_URL` apunte a `http://localhost:3000`

## 🔗 Enlaces útiles

- **Repositorio**: https://github.com/Chorch55/calendaria-next
- **Documentación completa**: Ver `README.md`
- **Funcionalidades**: Ver `FUNCIONALIDADES.md`

## 📞 Contacto

Si tienes problemas con la configuración, contacta al owner del proyecto para:
- Obtener las keys de Stripe de desarrollo
- Acceso a servicios externos
- Dudas sobre la arquitectura del proyecto
