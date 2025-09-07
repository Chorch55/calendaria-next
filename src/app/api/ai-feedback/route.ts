import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para validar el feedback
const FeedbackSchema = z.object({
  analysisId: z.string(),
  emailContent: z.string(),
  originalDuration: z.number(),
  correctedDuration: z.number().optional(),
  rating: z.number().min(1).max(5),
  category: z.enum(['precisión', 'relevancia', 'utilidad', 'claridad']),
  comments: z.string().optional(),
  userId: z.string().optional(),
  timestamp: z.date().default(() => new Date())
});

const BatchFeedbackSchema = z.object({
  feedbacks: z.array(FeedbackSchema),
  userId: z.string().optional()
});

// Tipos para el feedback
type FeedbackData = z.infer<typeof FeedbackSchema>;

// Interfaces para insights
interface SuggestedAdjustment {
  type: string;
  description: string;
  confidence: number;
}

interface LearningPoint {
  keyword: string;
  context: string;
  relevance: string;
}

interface CategoryCount {
  category: string;
  count: number;
  percentage: number;
}

interface FeedbackInsights {
  accuracyImprovement: string;
  suggestedAdjustments: SuggestedAdjustment[];
  learningPoints: LearningPoint[];
}

interface CombinedInsights {
  overallAccuracy: number;
  commonIssues: CategoryCount[];
  improvementAreas: CategoryCount[];
  successPatterns: CategoryCount[];
}

// Base de datos en memoria para demo (en producción usar una base de datos real)
const feedbackStorage: FeedbackData[] = [];

// Endpoint para enviar feedback individual
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const feedback = FeedbackSchema.parse(body);
    
    // Simular guardado en base de datos
    feedbackStorage.push(feedback);
    
    // Simular procesamiento de feedback para mejorar la IA
    const insights = await processFeedback(feedback);
    
    return NextResponse.json({
      success: true,
      message: 'Feedback recibido correctamente',
      insights,
      feedbackId: feedback.analysisId
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de feedback inválidos', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para feedback en lote
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const batchFeedback = BatchFeedbackSchema.parse(body);
    
    // Procesar cada feedback
    const results = [];
    for (const feedback of batchFeedback.feedbacks) {
      feedbackStorage.push(feedback);
      const insights = await processFeedback(feedback);
      results.push({
        feedbackId: feedback.analysisId,
        insights
      });
    }
    
    // Generar insights combinados
    const combinedInsights = await generateCombinedInsights(batchFeedback.feedbacks);
    
    return NextResponse.json({
      success: true,
      message: `${batchFeedback.feedbacks.length} feedbacks procesados`,
      results,
      combinedInsights
    });
  } catch (error) {
    console.error('Error processing batch feedback:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de feedback en lote inválidos', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para obtener estadísticas de feedback
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const category = url.searchParams.get('category');
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');
    
    let filteredFeedback = feedbackStorage;
    
    // Filtrar por usuario si se especifica
    if (userId) {
      filteredFeedback = filteredFeedback.filter(f => f.userId === userId);
    }
    
    // Filtrar por categoría si se especifica
    if (category) {
      filteredFeedback = filteredFeedback.filter(f => f.category === category);
    }
    
    // Filtrar por fecha si se especifica
    if (fromDate) {
      const from = new Date(fromDate);
      filteredFeedback = filteredFeedback.filter(f => f.timestamp >= from);
    }
    
    if (toDate) {
      const to = new Date(toDate);
      filteredFeedback = filteredFeedback.filter(f => f.timestamp <= to);
    }
    
    // Generar estadísticas
    const stats = generateFeedbackStats(filteredFeedback);
    
    return NextResponse.json({
      success: true,
      stats,
      totalFeedbacks: filteredFeedback.length
    });
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    return NextResponse.json(
      { error: 'Error obteniendo estadísticas de feedback' },
      { status: 500 }
    );
  }
}

// Función para procesar un feedback individual
async function processFeedback(feedback: FeedbackData): Promise<FeedbackInsights> {
  // Simular análisis del feedback
  const insights: FeedbackInsights = {
    accuracyImprovement: feedback.rating >= 4 ? 'Buena precisión' : 'Necesita mejora',
    suggestedAdjustments: [],
    learningPoints: []
  };
  
  // Analizar diferencias de duración
  if (feedback.correctedDuration && feedback.correctedDuration !== feedback.originalDuration) {
    const difference = feedback.correctedDuration - feedback.originalDuration;
    insights.suggestedAdjustments.push({
      type: 'duration_adjustment',
      description: `Ajustar duración en ${difference} minutos para casos similares`,
      confidence: feedback.rating / 5
    });
  }
  
  // Analizar comentarios para extraer patrones
  if (feedback.comments) {
    const keywords = extractKeywords(feedback.comments);
    insights.learningPoints = keywords.map(keyword => ({
      keyword,
      context: 'feedback_comment',
      relevance: 'high'
    }));
  }
  
  return insights;
}

// Función para generar insights combinados
async function generateCombinedInsights(feedbacks: FeedbackData[]): Promise<CombinedInsights> {
  const insights: CombinedInsights = {
    overallAccuracy: 0,
    commonIssues: [],
    improvementAreas: [],
    successPatterns: []
  };
  
  // Calcular precisión general
  const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
  insights.overallAccuracy = feedbacks.length > 0 ? totalRating / feedbacks.length : 0;
  
  // Identificar problemas comunes
  const lowRatingFeedbacks = feedbacks.filter(f => f.rating <= 2);
  const issueCategories = lowRatingFeedbacks.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  insights.commonIssues = Object.entries(issueCategories)
    .map(([category, count]) => ({ category, count, percentage: (count / feedbacks.length) * 100 }))
    .sort((a, b) => b.count - a.count);
  
  // Identificar patrones de éxito
  const highRatingFeedbacks = feedbacks.filter(f => f.rating >= 4);
  const successCategories = highRatingFeedbacks.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  insights.successPatterns = Object.entries(successCategories)
    .map(([category, count]) => ({ category, count, percentage: (count / feedbacks.length) * 100 }))
    .sort((a, b) => b.count - a.count);
  
  return insights;
}

// Función para generar estadísticas de feedback
function generateFeedbackStats(feedbacks: FeedbackData[]) {
  return {
    total: feedbacks.length,
    averageRating: feedbacks.length > 0 ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length : 0,
    ratingDistribution: {
      1: feedbacks.filter(f => f.rating === 1).length,
      2: feedbacks.filter(f => f.rating === 2).length,
      3: feedbacks.filter(f => f.rating === 3).length,
      4: feedbacks.filter(f => f.rating === 4).length,
      5: feedbacks.filter(f => f.rating === 5).length
    },
    categoryBreakdown: feedbacks.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recentTrends: {
      last7Days: feedbacks.filter(f => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return f.timestamp >= weekAgo;
      }).length,
      last30Days: feedbacks.filter(f => {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return f.timestamp >= monthAgo;
      }).length
    },
    improvementMetrics: {
      accuracyTrend: calculateAccuracyTrend(feedbacks),
      responseQuality: calculateResponseQuality(feedbacks)
    }
  };
}

// Función para extraer palabras clave de comentarios
function extractKeywords(comment: string): string[] {
  // Implementación simple de extracción de palabras clave
  const stopWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'muy', 'más', 'pero', 'sus', 'me', 'mi', 'si', 'ya', 'fue'];
  
  return comment
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 5); // Tomar solo las primeras 5 palabras relevantes
}

// Función para calcular tendencia de precisión
function calculateAccuracyTrend(feedbacks: FeedbackData[]): number {
  if (feedbacks.length < 2) return 0;
  
  const sorted = feedbacks.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const half = Math.floor(sorted.length / 2);
  
  const firstHalfAvg = sorted.slice(0, half).reduce((sum, f) => sum + f.rating, 0) / half;
  const secondHalfAvg = sorted.slice(half).reduce((sum, f) => sum + f.rating, 0) / (sorted.length - half);
  
  return secondHalfAvg - firstHalfAvg;
}

// Función para calcular calidad de respuesta
function calculateResponseQuality(feedbacks: FeedbackData[]): number {
  const withComments = feedbacks.filter(f => f.comments && f.comments.trim().length > 0);
  const qualityIndicators = withComments.filter(f => 
    f.comments!.includes('preciso') || 
    f.comments!.includes('útil') || 
    f.comments!.includes('correcto') ||
    f.rating >= 4
  );
  
  return withComments.length > 0 ? qualityIndicators.length / withComments.length : 0;
}
