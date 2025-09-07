'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Bot, Clock, Mail, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EmailDurationTestProps {
  rules: Array<{
    keywords: string;
    duration: number;
    priority: number;
    category?: string;
  }>;
  customPrompt: string;
  confidenceThreshold: number;
  fallbackDuration: number;
}

interface AnalysisResult {
  suggestedDuration: number;
  confidence: number;
  reasoning: string;
  matchedKeywords: string[];
  category: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  isFirstVisit: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
}

export default function EmailDurationTest({ 
  rules, 
  customPrompt, 
  confidenceThreshold, 
  fallbackDuration 
}: EmailDurationTestProps) {
  const [testEmail, setTestEmail] = useState({
    subject: '',
    content: '',
    senderEmail: ''
  });
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const exampleEmails = [
    {
      subject: "Consulta rápida sobre resultado de análisis",
      content: "Hola, recibí los resultados de mis análisis de sangre y tengo una pregunta rápida sobre uno de los valores. ¿Podrían explicarme qué significa? Gracias.",
      senderEmail: "paciente@email.com"
    },
    {
      subject: "Primera cita - Nuevo paciente",
      content: "Buenos días, soy nuevo en la clínica y me gustaría agendar mi primera consulta. Tengo varios síntomas que me preocupan desde hace algunas semanas y mi médico de cabecera me derivó para una evaluación más detallada. Necesito hacer una historia clínica completa.",
      senderEmail: "nuevo.paciente@email.com"
    },
    {
      subject: "URGENTE - Dolor severo necesito cita cuanto antes",
      content: "Doctor, tengo un dolor muy fuerte desde ayer que no me deja dormir. He tomado analgésicos pero no mejora. Necesito una cita lo antes posible, es urgente. El dolor está empeorando.",
      senderEmail: "urgencia@email.com"
    },
    {
      subject: "Consulta para procedimiento de cirugía menor",
      content: "Estimado doctor, necesito agendar una cita para discutir el procedimiento de extracción que me comentó la semana pasada. También quiero revisar los pasos a seguir, tiempos de recuperación y cuidados post-operatorios. Tengo varias dudas sobre el procedimiento.",
      senderEmail: "cirugia@email.com"
    }
  ];

  const loadExample = (example: typeof exampleEmails[0]) => {
    setTestEmail(example);
    setResult(null);
  };

  const analyzeEmail = async () => {
    if (!testEmail.subject.trim() || !testEmail.content.trim()) {
      toast.error('Por favor completa el asunto y contenido del email');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/email-duration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: testEmail.subject,
          content: testEmail.content,
          senderEmail: testEmail.senderEmail,
          customPrompt,
          rules: rules.filter(rule => rule.keywords && rule.duration > 0)
        }),
      });

      if (!response.ok) {
        throw new Error('Error al analizar el email');
      }

      const data = await response.json();
      setResult(data);
      
      toast.success('¡Análisis completado!', {
        description: `Duración sugerida: ${data.suggestedDuration} minutos`
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al analizar el email', {
        description: 'Por favor intenta nuevamente'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getUrgencyColor = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
    }
  };

  const getComplexityColor = (complexity: 'simple' | 'moderate' | 'complex') => {
    switch (complexity) {
      case 'complex': return 'destructive';
      case 'moderate': return 'default';
      case 'simple': return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Probador de Duración Automática
        </CardTitle>
        <CardDescription>
          Prueba cómo funciona el sistema de análisis inteligente con diferentes tipos de emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ejemplos predefinidos */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Ejemplos para probar:</Label>
          <div className="grid gap-2 md:grid-cols-2">
            {exampleEmails.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => loadExample(example)}
                className="justify-start text-left h-auto p-3"
              >
                <div>
                  <div className="font-medium text-sm">{example.subject}</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {example.content.substring(0, 60)}...
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Formulario de prueba */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-subject">Asunto del email</Label>
            <Input
              id="test-subject"
              value={testEmail.subject}
              onChange={(e) => setTestEmail(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Ej: Consulta urgente sobre resultado de análisis"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-content">Contenido del email</Label>
            <Textarea
              id="test-content"
              value={testEmail.content}
              onChange={(e) => setTestEmail(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              placeholder="Escribe aquí el contenido del email que quieres analizar..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-sender">Email del remitente (opcional)</Label>
            <Input
              id="test-sender"
              type="email"
              value={testEmail.senderEmail}
              onChange={(e) => setTestEmail(prev => ({ ...prev, senderEmail: e.target.value }))}
              placeholder="remitente@email.com"
            />
          </div>

          <Button 
            onClick={analyzeEmail} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Analizar Email
              </>
            )}
          </Button>
        </div>

        {/* Resultados */}
        {result && (
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Label className="font-medium">Resultado del Análisis</Label>
            </div>

            {/* Duración principal */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <Label className="text-sm">Duración Sugerida</Label>
                </div>
                <div className="text-2xl font-bold">{result.suggestedDuration} min</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <Label className="text-sm">Confianza</Label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getConfidenceColor(result.confidence)}`}
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{Math.round(result.confidence * 100)}%</span>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  <Label className="text-sm">Categoría</Label>
                </div>
                <Badge variant="outline" className="text-sm">
                  {result.category}
                </Badge>
              </Card>
            </div>

            {/* Información adicional */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="text-sm text-muted-foreground">Urgencia</Label>
                <div className="mt-1">
                  <Badge variant={getUrgencyColor(result.urgencyLevel)}>
                    {result.urgencyLevel}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Complejidad</Label>
                <div className="mt-1">
                  <Badge variant={getComplexityColor(result.complexity)}>
                    {result.complexity}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Primera Visita</Label>
                <div className="mt-1">
                  <Badge variant={result.isFirstVisit ? "default" : "secondary"}>
                    {result.isFirstVisit ? "Sí" : "No"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Palabras clave encontradas */}
            {result.matchedKeywords && result.matchedKeywords.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground">Palabras clave detectadas:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.matchedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Razonamiento */}
            <div>
              <Label className="text-sm text-muted-foreground">Razonamiento de la IA:</Label>
              <p className="text-sm mt-1 p-3 bg-white dark:bg-slate-800 rounded border">
                {result.reasoning}
              </p>
            </div>

            {/* Indicador de uso de configuración */}
            <div className="pt-2 border-t text-xs text-muted-foreground">
              {result.confidence >= confidenceThreshold ? (
                <span className="text-green-600">✓ Duración aceptada (confianza ≥ {confidenceThreshold})</span>
              ) : (
                <span className="text-orange-600">⚠ Se usaría duración de respaldo ({fallbackDuration} min) por baja confianza</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
