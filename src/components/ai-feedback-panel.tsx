"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import InfoCard from '@/components/ui/info-card';
import { 
  Star, 
  Send, 
  CheckCircle, 
  Brain,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Target,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisResult {
  id: string;
  emailContent: string;
  suggestedDuration: number;
  confidence: number;
  reasoning: string;
  timestamp: Date;
}

interface FeedbackData {
  analysisId: string;
  emailContent: string;
  originalDuration: number;
  correctedDuration?: number;
  rating: number;
  category: 'precisión' | 'relevancia' | 'utilidad' | 'claridad';
  comments?: string;
}

interface AIFeedbackPanelProps {
  analysisResult?: AnalysisResult;
  onSubmitFeedback?: (feedback: FeedbackData) => Promise<void>;
  showStats?: boolean;
}

const AIFeedbackPanel: React.FC<AIFeedbackPanelProps> = ({
  analysisResult,
  onSubmitFeedback,
  showStats = false
}) => {
  const [feedback, setFeedback] = useState<Partial<FeedbackData>>({
    rating: 0,
    category: 'precisión'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    averageRating: 0,
    accuracyImprovement: 0,
    learningProgress: 0
  });

  const handleRatingChange = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async () => {
    if (!analysisResult || !onSubmitFeedback || !feedback.rating || feedback.rating === 0) return;

    setIsSubmitting(true);
    try {
      const feedbackData: FeedbackData = {
        analysisId: analysisResult.id,
        emailContent: analysisResult.emailContent,
        originalDuration: analysisResult.suggestedDuration,
        correctedDuration: feedback.correctedDuration,
        rating: feedback.rating,
        category: feedback.category as 'precisión' | 'relevancia' | 'utilidad' | 'claridad',
        comments: feedback.comments
      };

      await onSubmitFeedback(feedbackData);
      setSubmitted(true);
      
      // Simular actualización de estadísticas
      setStats(prev => ({
        ...prev,
        totalFeedbacks: prev.totalFeedbacks + 1,
        averageRating: (prev.averageRating * prev.totalFeedbacks + feedback.rating!) / (prev.totalFeedbacks + 1),
        accuracyImprovement: prev.accuracyImprovement + (feedback.rating! >= 4 ? 0.5 : -0.2),
        learningProgress: Math.min(100, prev.learningProgress + 2)
      }));
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingChange(star)}
            className={cn(
              "p-1 rounded transition-colors",
              (feedback.rating || 0) >= star 
                ? "text-yellow-500 hover:text-yellow-600" 
                : "text-gray-300 hover:text-gray-400"
            )}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
        {(feedback.rating || 0) > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {feedback.rating === 5 ? 'Excelente' : 
             feedback.rating === 4 ? 'Bueno' :
             feedback.rating === 3 ? 'Regular' :
             feedback.rating === 2 ? 'Malo' : 'Muy malo'}
          </span>
        )}
      </div>
    );
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-100">
                ¡Gracias por tu feedback!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-200">
                Tu valoración nos ayuda a mejorar el sistema de análisis inteligente.
              </p>
            </div>
          </div>
          {showStats && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalFeedbacks}</div>
                <div className="text-xs text-green-700">Feedbacks totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.averageRating.toFixed(1)}</div>
                <div className="text-xs text-green-700">Valoración promedio</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas informativas */}
      <div className="space-y-3">
        <InfoCard
          id="feedback-importance"
          title="🎯 Tu feedback es importante"
          description="Cada valoración ayuda a la IA a aprender y mejorar la precisión de los análisis futuros. Tu experiencia hace la diferencia."
          type="ai"
        />
        
        {(feedback.rating || 0) > 0 && (feedback.rating || 0) <= 2 && (
          <InfoCard
            id="low-rating-help"
            title="💡 Ayúdanos a mejorar"
            description="Parece que el análisis no fue muy preciso. Por favor, comparte más detalles en los comentarios para que podamos aprender de este caso."
            type="tip"
          />
        )}
      </div>

      {/* Panel principal de feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Feedback del Análisis de IA
          </CardTitle>
          <CardDescription>
            Evalúa la precisión del análisis y ayuda a mejorar el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mostrar resultado del análisis */}
          {analysisResult && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Resultado del Análisis</h4>
                <Badge 
                  variant={analysisResult.confidence >= 0.8 ? 'default' : 
                          analysisResult.confidence >= 0.6 ? 'secondary' : 'outline'}
                >
                  Confianza: {Math.round(analysisResult.confidence * 100)}%
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div><strong>Duración sugerida:</strong> {analysisResult.suggestedDuration} minutos</div>
                <div><strong>Razonamiento:</strong> {analysisResult.reasoning}</div>
              </div>
            </div>
          )}

          {/* Valoración con estrellas */}
          <div className="space-y-2">
            <Label>¿Qué tan preciso fue el análisis?</Label>
            {renderStarRating()}
          </div>

          {/* Categoría de feedback */}
          <div className="space-y-2">
            <Label>Categoría de feedback</Label>
            <Select
              value={feedback.category}
              onValueChange={(value) => setFeedback(prev => ({ 
                ...prev, 
                category: value as 'precisión' | 'relevancia' | 'utilidad' | 'claridad' 
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="precisión">Precisión del análisis</SelectItem>
                <SelectItem value="relevancia">Relevancia del contexto</SelectItem>
                <SelectItem value="utilidad">Utilidad práctica</SelectItem>
                <SelectItem value="claridad">Claridad del razonamiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duración corregida */}
          <div className="space-y-2">
            <Label>Duración correcta (opcional)</Label>
            <Input
              type="number"
              placeholder="Ej: 45"
              value={feedback.correctedDuration || ''}
              onChange={(e) => setFeedback(prev => ({ 
                ...prev, 
                correctedDuration: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Si el análisis fue incorrecto, indica la duración que debería haber sugerido
            </p>
          </div>

          {/* Comentarios adicionales */}
          <div className="space-y-2">
            <Label>Comentarios adicionales (opcional)</Label>
            <Textarea
              placeholder="Comparte detalles sobre por qué el análisis fue o no fue preciso..."
              value={feedback.comments || ''}
              onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Botón de envío */}
          <Button 
            onClick={handleSubmit}
            disabled={(feedback.rating || 0) === 0 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Enviando feedback...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Feedback
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Panel de estadísticas de aprendizaje */}
      {showStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progreso del Aprendizaje
            </CardTitle>
            <CardDescription>
              Cómo tu feedback está mejorando el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalFeedbacks}</div>
                <div className="text-xs text-muted-foreground">Feedbacks dados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.averageRating.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Valoración promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.accuracyImprovement.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Mejora de precisión</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.learningProgress}%</div>
                <div className="text-xs text-muted-foreground">Progreso aprendizaje</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso del aprendizaje</span>
                <span>{stats.learningProgress}%</span>
              </div>
              <Progress value={stats.learningProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones rápidas de feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Feedback Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFeedback(prev => ({ ...prev, rating: 5, category: 'precisión' }))}
              className="flex items-center gap-1"
            >
              <ThumbsUp className="h-3 w-3" />
              Muy preciso
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFeedback(prev => ({ ...prev, rating: 2, category: 'precisión' }))}
              className="flex items-center gap-1"
            >
              <ThumbsDown className="h-3 w-3" />
              Poco preciso
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFeedback(prev => ({ ...prev, rating: 4, category: 'utilidad' }))}
              className="flex items-center gap-1"
            >
              <Lightbulb className="h-3 w-3" />
              Útil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIFeedbackPanel;
