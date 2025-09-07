'use server';
/**
 * @fileOverview Análisis inteligente de duración de citas basado en contenido de email
 *
 * - analyzeEmailDuration - Función que analiza emails y determina duración óptima
 * - EmailDurationInput - Tipo de entrada para el análisis
 * - EmailDurationOutput - Tipo de salida con duración sugerida y confianza
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmailDurationInputSchema = z.object({
  subject: z.string().describe('Asunto del email'),
  content: z.string().describe('Contenido del email'),
  senderEmail: z.string().optional().describe('Email del remitente'),
  customPrompt: z.string().optional().describe('Prompt personalizado para el análisis'),
  rules: z.array(z.object({
    keywords: z.string(),
    duration: z.number(),
    priority: z.number(),
    category: z.string().optional()
  })).optional().describe('Reglas de duración por palabras clave')
});

export type EmailDurationInput = z.infer<typeof EmailDurationInputSchema>;

const EmailDurationOutputSchema = z.object({
  suggestedDuration: z.number().describe('Duración sugerida en minutos'),
  confidence: z.number().min(0).max(1).describe('Nivel de confianza de 0 a 1'),
  reasoning: z.string().describe('Explicación del razonamiento usado'),
  matchedKeywords: z.array(z.string()).describe('Palabras clave que influyeron en la decisión'),
  category: z.string().describe('Categoría identificada del tipo de cita'),
  urgencyLevel: z.enum(['low', 'medium', 'high']).describe('Nivel de urgencia detectado'),
  isFirstVisit: z.boolean().describe('Si parece ser una primera visita'),
  complexity: z.enum(['simple', 'moderate', 'complex']).describe('Complejidad percibida del caso')
});

export type EmailDurationOutput = z.infer<typeof EmailDurationOutputSchema>;

export async function analyzeEmailDuration(input: EmailDurationInput): Promise<EmailDurationOutput> {
  return emailDurationFlow(input);
}

const durationAnalysisPrompt = ai.definePrompt({
  name: 'emailDurationPrompt',
  input: {schema: EmailDurationInputSchema},
  output: {schema: EmailDurationOutputSchema},
  prompt: `Eres un asistente experto en análisis de emails para programación de citas médicas/profesionales.

Tu tarea es analizar el contenido de un email y determinar la duración más apropiada para la cita solicitada.

INFORMACIÓN A ANALIZAR:
Asunto: {{{subject}}}
Contenido: {{{content}}}
{{#if senderEmail}}Remitente: {{{senderEmail}}}{{/if}}

{{#if customPrompt}}
INSTRUCCIONES ESPECÍFICAS:
{{{customPrompt}}}
{{/if}}

{{#if rules}}
REGLAS DISPONIBLES:
{{#each rules}}
- Palabras clave: {{{keywords}}} → {{{duration}}} minutos (Prioridad: {{{priority}}})
{{/each}}
{{/if}}

CRITERIOS DE ANÁLISIS:

1. **TIPO DE CONSULTA:**
   - Consulta simple/información: 15-30 min
   - Consulta estándar: 30-45 min
   - Primera visita: 45-60 min
   - Tratamiento especializado: 60-90+ min
   - Urgencia/emergencia: 30-45 min (pero prioritaria)

2. **INDICADORES DE DURACIÓN:**
   - Palabras como "rápido", "simple", "pregunta" → Menor duración
   - "Primera vez", "nuevo paciente", "nunca he ido" → Mayor duración
   - "Tratamiento", "procedimiento", "cirugía" → Mayor duración
   - "Urgente", "dolor", "inmediato" → Duración media pero prioritaria

3. **COMPLEJIDAD:**
   - Descripción detallada de síntomas → Mayor duración
   - Múltiples problemas mencionados → Mayor duración
   - Preguntas simples → Menor duración

4. **CONTEXTO:**
   - Menciona estudios/análisis previos → Puede requerir más tiempo
   - Follow-up/seguimiento → Duración estándar
   - Consulta de segunda opinión → Mayor duración

RESPONDE con:
- Una duración entre 15-120 minutos
- Confianza alta (0.8-1.0) para casos claros, media (0.5-0.7) para casos ambiguos
- Razonamiento claro del por qué elegiste esa duración
- Palabras clave específicas que influyeron en tu decisión
- Categoría apropiada (consulta, tratamiento, urgencia, seguimiento, etc.)

Sé preciso y fundamenta tu análisis en el contenido específico del email.`,
});

const emailDurationFlow = ai.defineFlow(
  {
    name: 'emailDurationFlow',
    inputSchema: EmailDurationInputSchema,
    outputSchema: EmailDurationOutputSchema,
  },
  async input => {
    // Primero intentamos análisis por reglas de palabras clave
    let keywordMatch = null;
    let matchedKeywords: string[] = [];
    
    if (input.rules) {
      const emailText = `${input.subject} ${input.content}`.toLowerCase();
      
      // Ordenar reglas por prioridad (mayor prioridad primero)
      const sortedRules = input.rules.sort((a, b) => b.priority - a.priority);
      
      for (const rule of sortedRules) {
        const keywords = rule.keywords.split('|').map(k => k.trim().toLowerCase());
        const matchedWords = keywords.filter(keyword => 
          emailText.includes(keyword)
        );
        
        if (matchedWords.length > 0) {
          keywordMatch = rule;
          matchedKeywords = matchedWords;
          break; // Usar la primera regla que coincida (mayor prioridad)
        }
      }
    }
    
    // Luego usar IA para análisis más sofisticado
    const {output} = await durationAnalysisPrompt(input);
    
    // Si tenemos coincidencia de palabras clave y alta confianza, la usamos
    if (keywordMatch && output!.confidence > 0.7) {
      // Combinar ambos análisis
      const finalDuration = Math.round((keywordMatch.duration + output!.suggestedDuration) / 2);
      
      return {
        ...output!,
        suggestedDuration: finalDuration,
        confidence: Math.min(output!.confidence + 0.1, 1.0), // Boost de confianza por coincidencia
        matchedKeywords: [...matchedKeywords, ...output!.matchedKeywords].filter((v, i, a) => a.indexOf(v) === i),
        reasoning: `Análisis combinado: Regla "${keywordMatch.category || 'keyword'}" coincidió con palabras clave [${matchedKeywords.join(', ')}]. ${output!.reasoning}`
      };
    }
    
    // Si solo hay coincidencia de palabras clave
    if (keywordMatch) {
      return {
        suggestedDuration: keywordMatch.duration,
        confidence: 0.8,
        reasoning: `Coincidencia directa con regla de palabras clave: [${matchedKeywords.join(', ')}]`,
        matchedKeywords,
        category: keywordMatch.category || 'keyword-based',
        urgencyLevel: output!.urgencyLevel,
        isFirstVisit: output!.isFirstVisit,
        complexity: output!.complexity
      };
    }
    
    // Si no hay coincidencias de palabras clave, usar solo análisis de IA
    return output!;
  }
);
