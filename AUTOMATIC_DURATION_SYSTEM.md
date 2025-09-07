# Sistema de Duración Automática por Contenido de Email

## Descripción General

El sistema de duración automática por contenido de email es una funcionalidad avanzada de CalendarIA que utiliza inteligencia artificial para analizar el contenido de los emails entrantes y determinar automáticamente la duración más apropiada para las citas solicitadas.

## Características Principales

### 🤖 Análisis Inteligente con IA
- Análisis contextual del asunto y contenido del email
- Detección de tipo de consulta, urgencia y complejidad
- Identificación automática de primeras visitas
- Evaluación de nivel de confianza del análisis

### 🎯 Sistema de Reglas por Palabras Clave
- Reglas personalizables basadas en palabras clave específicas
- Sistema de prioridades para manejar múltiples coincidencias
- Categorización automática de tipos de cita
- Combinación inteligente con análisis de IA

### ⚙️ Configuración Flexible
- Múltiples modos: fijo, por categoría de servicio, o automático
- Umbrales de confianza ajustables
- Duración de respaldo configurable
- Prompts personalizables para la IA

## Cómo Funciona

### Proceso de Análisis

1. **Recepción del Email**: El sistema recibe un nuevo email solicitando una cita
2. **Análisis por Reglas**: Busca coincidencias con palabras clave predefinidas
3. **Análisis de IA**: Si está habilitado, la IA analiza el contexto completo
4. **Combinación de Resultados**: Combina ambos análisis para mayor precisión
5. **Aplicación de Duración**: Aplica la duración sugerida si la confianza es suficiente

### Tipos de Análisis

#### Análisis por Palabras Clave
- **Ventajas**: Rápido, predecible, fácil de configurar
- **Uso**: Casos comunes y patrones específicos del negocio
- **Ejemplo**: "consulta rápida" → 15 minutos

#### Análisis con IA
- **Ventajas**: Contextual, adaptable, maneja casos complejos
- **Uso**: Emails ambiguos o contenido no cubierto por reglas
- **Ejemplo**: Análisis de síntomas complejos → duración personalizada

## Configuración

### Reglas de Palabras Clave

#### Estructura de una Regla
```typescript
{
  id: "1",
  name: "Consulta rápida",
  keywords: "consulta rápida|pregunta|duda simple|información básica",
  duration: 15,
  priority: 1,
  active: true,
  description: "Para consultas simples o preguntas básicas",
  category: "consulta"
}
```

#### Mejores Prácticas
- **Palabras Clave Específicas**: Usa términos específicos de tu sector
- **Separación con |**: Separa sinónimos con el símbolo |
- **Prioridades Lógicas**: Asigna prioridades según especificidad
- **Descripciones Claras**: Documenta el propósito de cada regla

### Configuración de IA

#### Prompt Personalizado
El prompt debe ser claro y específico para tu contexto de negocio:

```
Analiza el siguiente email para determinar la duración apropiada de la cita médica. 
Considera: tipo de consulta, complejidad del problema, si es primera visita, 
tratamientos específicos mencionados, y nivel de urgencia. 
Devuelve la duración en minutos (15, 30, 45, 60, 90) y un nivel de confianza del 0 al 1.
```

#### Umbrales Recomendados
- **Confianza Alta (≥0.8)**: Para casos muy claros
- **Confianza Media (0.6-0.7)**: Balance entre precisión y cobertura
- **Confianza Baja (<0.6)**: Solo casos extremadamente claros

## Casos de Uso Típicos

### Consulta Médica

#### Email de Ejemplo
```
Asunto: Consulta rápida sobre resultado de análisis
Contenido: Hola, recibí los resultados de mis análisis de sangre y tengo 
una pregunta rápida sobre uno de los valores. ¿Podrían explicarme qué significa?
```

#### Análisis del Sistema
- **Palabras Clave Detectadas**: "consulta rápida", "pregunta"
- **Duración Sugerida**: 15 minutos
- **Método**: Coincidencia de regla + confirmación IA
- **Confianza**: 0.9

### Primera Visita

#### Email de Ejemplo
```
Asunto: Primera cita - Nuevo paciente
Contenido: Buenos días, soy nuevo en la clínica y me gustaría agendar mi primera 
consulta. Tengo varios síntomas que me preocupan desde hace algunas semanas.
```

#### Análisis del Sistema
- **Palabras Clave Detectadas**: "primera cita", "nuevo paciente", "primera consulta"
- **Duración Sugerida**: 60 minutos
- **Factores IA**: Primera visita + múltiples síntomas
- **Confianza**: 0.95

### Urgencia

#### Email de Ejemplo
```
Asunto: URGENTE - Dolor severo necesito cita
Contenido: Doctor, tengo un dolor muy fuerte desde ayer que no me deja dormir. 
Necesito una cita lo antes posible, es urgente.
```

#### Análisis del Sistema
- **Palabras Clave Detectadas**: "urgente", "dolor"
- **Duración Sugerida**: 45 minutos
- **Factores IA**: Urgencia alta + descripción detallada
- **Prioridad**: Alta (cita prioritaria)

## Integración con el Sistema

### API Endpoints

#### Análisis Individual
```typescript
POST /api/email-duration
{
  "subject": "Asunto del email",
  "content": "Contenido del email",
  "senderEmail": "paciente@email.com",
  "customPrompt": "Prompt personalizado",
  "rules": [...reglas]
}
```

#### Procesamiento en Lote
```typescript
PUT /api/process-email
{
  "emails": [...emails],
  "config": {...configuración}
}
```

### Flujo de Trabajo

1. **Email Entrante** → Sistema de Email
2. **Extracción de Contenido** → Procesador de Email
3. **Análisis de Duración** → API de Duración
4. **Creación de Cita** → Sistema de Calendario
5. **Confirmación** → Notificación al Usuario

## Métricas y Monitoreo

### Indicadores Clave
- **Precisión**: % de duraciones correctas vs. ajustes manuales
- **Cobertura**: % de emails procesados automáticamente
- **Confianza Promedio**: Nivel de confianza de las predicciones
- **Distribución de Métodos**: Uso de reglas vs. IA vs. fallback

### Optimización Continua
- Análisis de emails que requieren ajuste manual
- Refinamiento de reglas basado en patrones recurrentes
- Ajuste de umbrales según resultados históricos
- Actualización de prompts de IA según feedback

## Beneficios

### Para el Personal Administrativo
- ⏱️ **Ahorro de Tiempo**: Automatización del proceso de asignación de duración
- 🎯 **Mayor Precisión**: Análisis consistente y objetivo
- 📊 **Insights Automáticos**: Datos sobre tipos de consulta y patrones

### Para los Profesionales
- 📅 **Planificación Mejorada**: Horarios más precisos y realistas
- ⚡ **Respuesta Más Rápida**: Procesamiento automático de solicitudes
- 🔍 **Información Contextual**: Datos adicionales sobre cada cita

### Para los Pacientes/Clientes
- 🚀 **Respuesta Inmediata**: Confirmación automática de citas
- ⏰ **Duración Apropiada**: Tiempo suficiente para sus necesidades
- 📱 **Experiencia Fluida**: Proceso sin fricción de solicitud de citas

## Requisitos Técnicos

### Dependencias
- **Genkit AI**: Framework de IA para análisis de texto
- **Google AI**: Modelo de lenguaje para análisis contextual
- **Next.js API Routes**: Endpoints para procesamiento
- **TypeScript**: Tipado fuerte para mayor confiabilidad

### Configuración Mínima
- Modelo de IA configurado y funcionando
- Al menos 3-5 reglas básicas definidas
- Umbrales de confianza apropiados para el contexto
- Duración de respaldo razonable (típicamente 30-60 min)

## Soporte y Mantenimiento

### Actualizaciones Recomendadas
- **Mensual**: Revisión de métricas y ajuste de reglas
- **Trimestral**: Análisis de precisión y optimización de prompts
- **Semestral**: Evaluación completa del sistema y mejoras

### Solución de Problemas
- **Baja Precisión**: Revisar y refinar reglas, ajustar umbrales
- **Alta Latencia**: Optimizar prompts, revisar configuración de IA
- **Errores Frecuentes**: Validar configuración, revisar logs de sistema

Para más información técnica, consulta la documentación de desarrollo o contacta al equipo de soporte.
