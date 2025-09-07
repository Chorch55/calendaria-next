"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InfoCard from '@/components/ui/info-card';
import AIFeedbackPanel from '@/components/ai-feedback-panel';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Target,
  MessageSquare,
  CheckCircle
} from 'lucide-react';

interface DurationAnalysisWithFeedbackProps {
  className?: string;
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

const DurationAnalysisWithFeedback: React.FC<DurationAnalysisWithFeedbackProps> = ({ 
  className 
}) => {
  const [activeTab, setActiveTab] = useState('demo');
  const [analysisResults] = useState([
    {
      id: '1',
      emailContent: 'Hola, necesito una consulta de seguimiento para revisar los resultados de mis análisis de sangre. No es urgente.',
      suggestedDuration: 30,
      confidence: 0.85,
      reasoning: 'Consulta de seguimiento con análisis - duración estándar para revisión de resultados.',
      timestamp: new Date()
    },
    {
      id: '2', 
      emailContent: 'Primera consulta para dolor de espalda crónico que tengo desde hace meses. Necesito un examen completo.',
      suggestedDuration: 60,
      confidence: 0.92,
      reasoning: 'Primera consulta para problema crónico - requiere examen completo y evaluación detallada.',
      timestamp: new Date()
    }
  ]);

  const handleFeedback = async (feedback: FeedbackData): Promise<void> => {
    console.log('Feedback recibido:', feedback);
    // Aquí se enviaría el feedback al API
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Sistema de Duración Automática con Feedback
          </CardTitle>
          <CardDescription>
            Demostración del sistema inteligente de análisis y feedback continuo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tarjetas informativas */}
          <div className="space-y-3 mb-6">
            <InfoCard
              id="feedback-demo-info"
              title="🚀 Nuevo: Sistema de Feedback Inteligente"
              description="Ahora puedes evaluar cada análisis de la IA para ayudar a mejorar la precisión del sistema. Cada feedback cuenta para el aprendizaje automático."
              type="feature"
            />
            
            <InfoCard
              id="how-feedback-works"
              title="¿Cómo funciona el feedback?"
              description="La IA analiza tu contenido, tú evalúas el resultado, y el sistema aprende de tus correcciones para mejorar futuras predicciones automáticamente."
              type="ai"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="demo">Demostración</TabsTrigger>
              <TabsTrigger value="feedback">Panel de Feedback</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="demo" className="space-y-4">
              <div className="grid gap-4">
                {analysisResults.map((result) => (
                  <Card key={result.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Análisis #{result.id}</CardTitle>
                        <Badge 
                          variant={result.confidence >= 0.8 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {Math.round(result.confidence * 100)}% confianza
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                        <strong>Email:</strong> &ldquo;{result.emailContent}&rdquo;
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Duración sugerida: {result.suggestedDuration} min</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setActiveTab('feedback')}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Dar Feedback
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <strong>Razonamiento:</strong> {result.reasoning}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              <AIFeedbackPanel
                analysisResult={analysisResults[0]}
                onSubmitFeedback={handleFeedback}
                showStats={true}
              />
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">23</div>
                    <div className="text-xs text-muted-foreground">Análisis realizados</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">4.2</div>
                    <div className="text-xs text-muted-foreground">Valoración promedio</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">87%</div>
                    <div className="text-xs text-muted-foreground">Precisión actual</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">+12%</div>
                    <div className="text-xs text-muted-foreground">Mejora semanal</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4" />
                    Progreso del Aprendizaje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Reglas básicas configuradas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">IA entrenada con 23 casos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Sistema de feedback activo</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">Aprendizaje automático habilitado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DurationAnalysisWithFeedback;
