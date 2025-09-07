import { analyzeEmailDuration, EmailDurationInput, EmailDurationOutput } from '@/ai/flows/email-duration-flow';

export interface EmailProcessingConfig {
  appointmentDurationMode: 'fixed' | 'by_service_category' | 'automatic';
  automaticDurationRules: Array<{
    id: string;
    name: string;
    keywords: string;
    duration: number;
    priority: number;
    active: boolean;
    description?: string;
    category?: string;
  }>;
  enableAIAnalysis: boolean;
  aiAnalysisPrompt: string;
  fallbackDuration: number;
  confidenceThreshold: number;
  defaultAppointmentDuration: number;
}

export interface ProcessedEmail {
  subject: string;
  content: string;
  senderEmail?: string;
  receivedAt: Date;
  originalDuration?: number;
}

export interface EmailDurationResult {
  finalDuration: number;
  method: 'fixed' | 'ai_analysis' | 'keyword_match' | 'fallback';
  confidence: number;
  reasoning: string;
  aiAnalysis?: EmailDurationOutput;
  matchedRule?: {
    id: string;
    name: string;
    keywords: string[];
  };
}

/**
 * Determina la duración apropiada para una cita basada en el contenido del email
 */
export async function determineAppointmentDuration(
  email: ProcessedEmail,
  config: EmailProcessingConfig
): Promise<EmailDurationResult> {
  
  // Si está en modo fijo, usar duración predeterminada
  if (config.appointmentDurationMode === 'fixed') {
    return {
      finalDuration: config.defaultAppointmentDuration,
      method: 'fixed',
      confidence: 1.0,
      reasoning: `Duración fija configurada: ${config.defaultAppointmentDuration} minutos`
    };
  }

  // Si está en modo automático, procesar con IA y reglas
  if (config.appointmentDurationMode === 'automatic') {
    try {
      // Preparar reglas activas para el análisis
      const activeRules = config.automaticDurationRules
        .filter(rule => rule.active && rule.keywords.trim())
        .map(rule => ({
          keywords: rule.keywords,
          duration: rule.duration,
          priority: rule.priority,
          category: rule.category
        }));

      // Preparar entrada para análisis de IA
      const input: EmailDurationInput = {
        subject: email.subject,
        content: email.content,
        senderEmail: email.senderEmail,
        customPrompt: config.enableAIAnalysis ? config.aiAnalysisPrompt : undefined,
        rules: activeRules
      };

      // Realizar análisis
      const aiAnalysis = await analyzeEmailDuration(input);

      // Determinar si usar el resultado de IA o fallback
      if (aiAnalysis.confidence >= config.confidenceThreshold) {
        // Buscar regla coincidente para metadatos
        let matchedRule = undefined;
        if (aiAnalysis.matchedKeywords.length > 0) {
          const matchedRuleData = config.automaticDurationRules.find(rule => {
            const keywords = rule.keywords.split('|').map(k => k.trim().toLowerCase());
            return keywords.some(keyword => 
              aiAnalysis.matchedKeywords.some(matched => 
                matched.toLowerCase().includes(keyword) || keyword.includes(matched.toLowerCase())
              )
            );
          });
          
          if (matchedRuleData) {
            matchedRule = {
              id: matchedRuleData.id,
              name: matchedRuleData.name,
              keywords: aiAnalysis.matchedKeywords
            };
          }
        }

        return {
          finalDuration: aiAnalysis.suggestedDuration,
          method: matchedRule ? 'keyword_match' : 'ai_analysis',
          confidence: aiAnalysis.confidence,
          reasoning: aiAnalysis.reasoning,
          aiAnalysis,
          matchedRule
        };
      } else {
        // Confianza baja, usar duración de respaldo
        return {
          finalDuration: config.fallbackDuration,
          method: 'fallback',
          confidence: aiAnalysis.confidence,
          reasoning: `Confianza de IA (${Math.round(aiAnalysis.confidence * 100)}%) menor al umbral (${Math.round(config.confidenceThreshold * 100)}%). Usando duración de respaldo: ${config.fallbackDuration} minutos.`,
          aiAnalysis
        };
      }

    } catch (error) {
      console.error('Error analyzing email duration:', error);
      
      // Error en análisis, usar duración de respaldo
      return {
        finalDuration: config.fallbackDuration,
        method: 'fallback',
        confidence: 0,
        reasoning: `Error en análisis automático: ${error instanceof Error ? error.message : 'Error desconocido'}. Usando duración de respaldo: ${config.fallbackDuration} minutos.`
      };
    }
  }

  // Modo by_service_category o cualquier otro caso
  return {
    finalDuration: config.defaultAppointmentDuration,
    method: 'fixed',
    confidence: 1.0,
    reasoning: `Usando duración predeterminada del sistema: ${config.defaultAppointmentDuration} minutos`
  };
}

/**
 * Analiza un lote de emails para obtener estadísticas sobre duraciones
 */
export async function batchAnalyzeEmails(
  emails: ProcessedEmail[],
  config: EmailProcessingConfig
): Promise<{
  results: Array<EmailDurationResult & { email: ProcessedEmail }>;
  stats: {
    totalEmails: number;
    averageDuration: number;
    averageConfidence: number;
    methodDistribution: Record<string, number>;
    durationDistribution: Record<number, number>;
  };
}> {
  const results = await Promise.all(
    emails.map(async (email) => {
      const result = await determineAppointmentDuration(email, config);
      return { ...result, email };
    })
  );

  // Calcular estadísticas
  const totalEmails = results.length;
  const averageDuration = results.reduce((sum, r) => sum + r.finalDuration, 0) / totalEmails;
  const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / totalEmails;
  
  const methodDistribution = results.reduce((acc, r) => {
    acc[r.method] = (acc[r.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const durationDistribution = results.reduce((acc, r) => {
    acc[r.finalDuration] = (acc[r.finalDuration] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    results,
    stats: {
      totalEmails,
      averageDuration: Math.round(averageDuration),
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      methodDistribution,
      durationDistribution
    }
  };
}

/**
 * Valida la configuración de duración automática
 */
export function validateDurationConfig(config: EmailProcessingConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validaciones básicas
  if (config.defaultAppointmentDuration <= 0) {
    errors.push('La duración predeterminada debe ser mayor a 0');
  }

  if (config.fallbackDuration <= 0) {
    errors.push('La duración de respaldo debe ser mayor a 0');
  }

  if (config.confidenceThreshold < 0 || config.confidenceThreshold > 1) {
    errors.push('El umbral de confianza debe estar entre 0 y 1');
  }

  // Validaciones para modo automático
  if (config.appointmentDurationMode === 'automatic') {
    const activeRules = config.automaticDurationRules.filter(rule => rule.active);
    
    if (activeRules.length === 0 && !config.enableAIAnalysis) {
      warnings.push('Modo automático activado pero no hay reglas activas ni análisis de IA habilitado');
    }

    if (config.confidenceThreshold > 0.9) {
      warnings.push('Umbral de confianza muy alto puede resultar en uso frecuente de duración de respaldo');
    }

    // Validar reglas
    activeRules.forEach((rule, index) => {
      if (!rule.keywords.trim()) {
        warnings.push(`Regla ${index + 1} "${rule.name}" no tiene palabras clave definidas`);
      }

      if (rule.duration <= 0) {
        errors.push(`Regla ${index + 1} "${rule.name}" tiene duración inválida`);
      }
    });

    // Verificar solapamiento de prioridades
    const priorities = activeRules.map(rule => rule.priority);
    const uniquePriorities = new Set(priorities);
    if (priorities.length !== uniquePriorities.size) {
      warnings.push('Algunas reglas tienen la misma prioridad, esto puede causar comportamiento impredecible');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
