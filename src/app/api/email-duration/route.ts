import { NextRequest, NextResponse } from 'next/server';
import { analyzeEmailDuration, EmailDurationInput } from '@/ai/flows/email-duration-flow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada
    const { subject, content, senderEmail, customPrompt, rules } = body;
    
    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    // Preparar entrada para el análisis
    const input: EmailDurationInput = {
      subject,
      content,
      senderEmail,
      customPrompt,
      rules
    };

    // Analizar el email
    const result = await analyzeEmailDuration(input);
    
    // Agregar metadatos útiles
    const response = {
      ...result,
      timestamp: new Date().toISOString(),
      emailLength: content.length,
      hasAttachments: body.hasAttachments || false,
      processingTime: Date.now()
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error analyzing email duration:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para obtener configuración de duración
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type === 'rules') {
      // Devolver reglas predeterminadas
      const defaultRules = [
        {
          keywords: 'consulta rápida|pregunta|duda simple|información básica|quick|breve',
          duration: 15,
          priority: 1,
          category: 'consulta'
        },
        {
          keywords: 'consulta|cita|revisión|checkup|evaluación|consulta general',
          duration: 30,
          priority: 2,
          category: 'consulta'
        },
        {
          keywords: 'primera vez|primera consulta|primera cita|nuevo paciente|primera visita|inicial',
          duration: 60,
          priority: 3,
          category: 'inicial'
        },
        {
          keywords: 'tratamiento|terapia|procedimiento|intervención|especializado|cirugía menor',
          duration: 90,
          priority: 4,
          category: 'tratamiento'
        },
        {
          keywords: 'urgente|emergencia|dolor|inmediato|cuanto antes|prioritario',
          duration: 45,
          priority: 5,
          category: 'urgencia'
        }
      ];
      
      return NextResponse.json({
        rules: defaultRules,
        totalRules: defaultRules.length
      });
    }
    
    return NextResponse.json({
      status: 'Email duration analysis API is running',
      endpoints: {
        POST: '/api/email-duration - Analyze email content for duration',
        GET: '/api/email-duration?type=rules - Get default rules'
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/email-duration:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
