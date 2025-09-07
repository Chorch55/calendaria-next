# Sistema de Duración Automática por Contenido de Email - Documentación Técnica

## Arquitectura del Sistema

El sistema de duración automática está compuesto por varios componentes que trabajan en conjunto:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Email Input   │───▶│  Analysis Engine │───▶│  Duration Output│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   AI + Rules     │
                    │   Processing     │
                    └──────────────────┘
```

## Componentes Principales

### 1. AI Flow (`/src/ai/flows/email-duration-flow.ts`)

**Responsabilidad**: Análisis inteligente de emails usando IA

**Funciones principales**:
- `analyzeEmailDuration()`: Punto de entrada principal
- Combinación de análisis por reglas y IA
- Generación de prompts contextuales
- Validación de resultados

**Tipos**:
```typescript
interface EmailDurationInput {
  subject: string;
  content: string;
  senderEmail?: string;
  customPrompt?: string;
  rules?: AutomaticDurationRule[];
}

interface EmailDurationOutput {
  suggestedDuration: number;
  confidence: number;
  reasoning: string;
  matchedKeywords: string[];
  category: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  isFirstVisit: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
}
```

### 2. Servicio de Procesamiento (`/src/lib/services/email-duration-service.ts`)

**Responsabilidad**: Lógica de negocio y coordinación

**Funciones principales**:
- `determineAppointmentDuration()`: Determina duración final
- `batchAnalyzeEmails()`: Procesamiento en lote
- `validateDurationConfig()`: Validación de configuración

**Flujo de decisión**:
```typescript
if (mode === 'fixed') {
  return defaultDuration;
} else if (mode === 'automatic') {
  const aiResult = await analyzeWithAI();
  if (aiResult.confidence >= threshold) {
    return aiResult.duration;
  } else {
    return fallbackDuration;
  }
}
```

### 3. API Routes

#### `/api/email-duration` - Análisis individual
```bash
POST /api/email-duration
Content-Type: application/json

{
  "subject": "Consulta urgente",
  "content": "Necesito una cita lo antes posible...",
  "senderEmail": "paciente@email.com",
  "customPrompt": "Analiza considerando urgencia médica",
  "rules": [...]
}
```

#### `/api/process-email` - Procesamiento completo
```bash
POST /api/process-email
Content-Type: application/json

{
  "email": {
    "subject": "...",
    "content": "...",
    "senderEmail": "..."
  },
  "config": {
    "appointmentDurationMode": "automatic",
    "automaticDurationRules": [...],
    "enableAIAnalysis": true,
    "confidenceThreshold": 0.7,
    "fallbackDuration": 60
  }
}
```

### 4. Componentes UI

#### `EmailDurationTest` - Herramienta de prueba
- Interfaz para probar el sistema con emails de ejemplo
- Visualización de resultados en tiempo real
- Ejemplos predefinidos para diferentes casos

#### `AutomaticDurationStats` - Dashboard de métricas
- Estadísticas de rendimiento del sistema
- Distribución de métodos usados
- Análisis de confianza y tendencias

## Integración con el Sistema Principal

### Configuración en Appointment Management

El sistema se integra a través de la interfaz de configuración:

```typescript
interface ChannelConfig {
  appointmentDurationMode: 'fixed' | 'by_service_category' | 'automatic';
  automaticDurationRules: AutomaticDurationRule[];
  enableAIAnalysis: boolean;
  aiAnalysisPrompt: string;
  fallbackDuration: number;
  confidenceThreshold: number;
}
```

### Flujo de Procesamiento de Email

1. **Recepción**: Email llega al sistema
2. **Extracción**: Se extrae subject, content, sender
3. **Configuración**: Se obtiene config del canal email
4. **Análisis**: Se llama a `determineAppointmentDuration()`
5. **Resultado**: Se aplica duración al crear la cita

## Algoritmo de Análisis

### Prioridad de Métodos

1. **Análisis por Reglas** (Prioridad Alta)
   - Búsqueda de palabras clave exactas
   - Aplicación por orden de prioridad
   - Rápido y predecible

2. **Análisis de IA** (Prioridad Media)
   - Análisis contextual completo
   - Considera matices y complejidad
   - Más lento pero más flexible

3. **Combinación** (Óptimo)
   - Si hay coincidencia de reglas + IA con alta confianza
   - Promedio ponderado de ambos resultados
   - Boost de confianza por coincidencia múltiple

### Lógica de Confianza

```typescript
if (keywordMatch && aiAnalysis.confidence > 0.7) {
  // Combinar ambos métodos
  finalDuration = (keywordMatch.duration + aiAnalysis.duration) / 2;
  finalConfidence = Math.min(aiAnalysis.confidence + 0.1, 1.0);
} else if (keywordMatch) {
  // Solo reglas
  finalDuration = keywordMatch.duration;
  finalConfidence = 0.8;
} else if (aiAnalysis.confidence >= threshold) {
  // Solo IA
  finalDuration = aiAnalysis.duration;
  finalConfidence = aiAnalysis.confidence;
} else {
  // Fallback
  finalDuration = fallbackDuration;
  finalConfidence = 0.0;
}
```

## Configuración de Desarrollo

### Variables de Entorno

```bash
# Configuración de IA
GOOGLE_AI_API_KEY=your_api_key_here
AI_MODEL=googleai/gemini-2.0-flash

# Configuración de base de datos (si se usa)
DATABASE_URL=your_db_url_here
```

### Dependencias Principales

```json
{
  "genkit": "^1.15.5",
  "@genkit-ai/googleai": "^1.15.5",
  "zod": "^4.0.15"
}
```

### Scripts de Desarrollo

```bash
# Desarrollo local
npm run dev

# Construir para producción
npm run build

# Ejecutar tests
npm run test

# Linting
npm run lint
```

## Testing

### Tests Unitarios

```typescript
describe('Email Duration Analysis', () => {
  test('should detect urgent emails', async () => {
    const input = {
      subject: 'URGENTE - Dolor severo',
      content: 'Necesito cita inmediata...'
    };
    
    const result = await analyzeEmailDuration(input);
    
    expect(result.urgencyLevel).toBe('high');
    expect(result.suggestedDuration).toBeGreaterThan(30);
  });
});
```

### Tests de Integración

```typescript
describe('Process Email API', () => {
  test('should process email end-to-end', async () => {
    const response = await fetch('/api/process-email', {
      method: 'POST',
      body: JSON.stringify({
        email: mockEmail,
        config: mockConfig
      })
    });
    
    expect(response.ok).toBe(true);
    const result = await response.json();
    expect(result.finalDuration).toBeGreaterThan(0);
  });
});
```

## Monitoreo y Logs

### Métricas Clave

- **Latencia**: Tiempo de procesamiento por email
- **Precisión**: % de duraciones correctas vs ajustes manuales
- **Cobertura**: % de emails procesados automáticamente
- **Distribución de métodos**: Uso de reglas vs IA vs fallback

### Logging

```typescript
console.log('Email duration analysis', {
  emailId,
  method: result.method,
  duration: result.finalDuration,
  confidence: result.confidence,
  processingTime: Date.now() - startTime
});
```

## Optimización y Performance

### Caching de Resultados

Para emails similares, se pueden cachear resultados:

```typescript
const cacheKey = `${hashContent(email.content)}_${configHash}`;
const cached = await cache.get(cacheKey);
if (cached) return cached;
```

### Procesamiento en Lote

Para múltiples emails:

```typescript
const results = await Promise.all(
  emails.map(email => analyzeEmailDuration(email))
);
```

### Optimización de Prompts

- Prompts más específicos = mejor precisión
- Prompts más cortos = menor latencia
- Ejemplos en el prompt = mejor consistencia

## Troubleshooting

### Problemas Comunes

1. **Baja Precisión**
   - Revisar y refinar reglas de palabras clave
   - Ajustar prompt de IA para el contexto específico
   - Calibrar umbral de confianza

2. **Alta Latencia**
   - Optimizar prompts (más concisos)
   - Implementar caching
   - Considerar procesamiento asíncrono

3. **Errores de IA**
   - Verificar configuración de API key
   - Revisar límites de rate limiting
   - Implementar retry con backoff

### Debug Mode

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Analysis details:', {
    input,
    rules: matchedRules,
    aiResult,
    finalDecision
  });
}
```

## Roadmap

### Versión Actual (v1.0)
- ✅ Análisis básico por reglas y IA
- ✅ Interfaz de configuración
- ✅ API de procesamiento
- ✅ Componente de prueba

### Próximas Versiones

#### v1.1
- [ ] Machine Learning para mejorar precisión
- [ ] Análisis de attachments en emails
- [ ] Integración con calendario para optimización

#### v1.2
- [ ] Procesamiento de emails en tiempo real
- [ ] Webhook para sistemas externos
- [ ] Dashboard avanzado de analytics

#### v2.0
- [ ] Multi-idioma y localización
- [ ] Análisis de sentiment avanzado
- [ ] Integración con sistemas de CRM

## Contribución

### Estructura de Commits

```
feat(duration): add new rule type for treatments
fix(api): handle edge case in confidence calculation
docs(readme): update integration examples
test(service): add unit tests for batch processing
```

### Pull Request Process

1. Fork del repositorio
2. Crear branch feature/bugfix
3. Desarrollar con tests
4. Actualizar documentación
5. Crear PR con descripción detallada

Para más información, consulta el archivo principal de documentación `AUTOMATIC_DURATION_SYSTEM.md`.
