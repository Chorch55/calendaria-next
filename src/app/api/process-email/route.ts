import { NextRequest, NextResponse } from 'next/server';
import { determineAppointmentDuration, validateDurationConfig, EmailProcessingConfig, ProcessedEmail } from '@/lib/services/email-duration-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada
    const { email, config } = body;
    
    if (!email || !email.subject || !email.content) {
      return NextResponse.json(
        { error: 'Email object with subject and content is required' },
        { status: 400 }
      );
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Email processing configuration is required' },
        { status: 400 }
      );
    }

    // Validar configuración
    const validation = validateDurationConfig(config);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid configuration',
          validationErrors: validation.errors,
          warnings: validation.warnings
        },
        { status: 400 }
      );
    }

    // Procesar email
    const processedEmail: ProcessedEmail = {
      subject: email.subject,
      content: email.content,
      senderEmail: email.senderEmail,
      receivedAt: new Date(email.receivedAt || new Date())
    };

    const result = await determineAppointmentDuration(processedEmail, config);
    
    // Agregar metadatos útiles para el sistema
    const response = {
      ...result,
      email: processedEmail,
      processedAt: new Date().toISOString(),
      configValidation: {
        warnings: validation.warnings
      },
      suggestedCalendarEvent: {
        title: `Cita - ${extractPatientName(email.senderEmail) || 'Paciente'}`,
        duration: result.finalDuration,
        description: `${email.subject}\n\nDuración determinada por: ${result.method}\nConfianza: ${Math.round(result.confidence * 100)}%\n\n${result.reasoning}`,
        category: result.aiAnalysis?.category || 'general',
        urgency: result.aiAnalysis?.urgencyLevel || 'medium',
        isFirstVisit: result.aiAnalysis?.isFirstVisit || false
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error processing email for duration:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Endpoint para procesar múltiples emails en lote
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails, config } = body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Array of emails is required' },
        { status: 400 }
      );
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Email processing configuration is required' },
        { status: 400 }
      );
    }

    // Validar configuración
    const validation = validateDurationConfig(config);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid configuration',
          validationErrors: validation.errors
        },
        { status: 400 }
      );
    }

    // Procesar emails en lotes pequeños para evitar timeouts
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (email: { subject: string; content: string; senderEmail?: string; receivedAt?: string }) => {
          try {
            const processedEmail: ProcessedEmail = {
              subject: email.subject,
              content: email.content,
              senderEmail: email.senderEmail,
              receivedAt: new Date(email.receivedAt || new Date())
            };

            const result = await determineAppointmentDuration(processedEmail, config);
            
            return {
              ...result,
              email: processedEmail,
              success: true as const
            };
          } catch (error) {
            return {
              email,
              success: false as const,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      results.push(...batchResults);
    }

    // Calcular estadísticas
    const successful = results.filter(r => r.success) as Array<{
      email: ProcessedEmail;
      success: true;
      finalDuration: number;
      method: string;
      confidence: number;
    }>;
    const failed = results.filter(r => !r.success);
    
    const stats = {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      averageDuration: successful.length > 0 
        ? Math.round(successful.reduce((sum, r) => sum + r.finalDuration, 0) / successful.length)
        : 0,
      averageConfidence: successful.length > 0
        ? Math.round(successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length * 100) / 100
        : 0,
      methodDistribution: successful.reduce((acc, r) => {
        acc[r.method] = (acc[r.method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      results,
      stats,
      configValidation: {
        warnings: validation.warnings
      },
      processedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in batch email processing:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process emails batch',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para obtener estadísticas y configuración de prueba
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type === 'sample-emails') {
      // Devolver emails de ejemplo para pruebas
      const sampleEmails = [
        {
          subject: "Consulta rápida sobre resultado de análisis",
          content: "Hola, recibí los resultados de mis análisis de sangre y tengo una pregunta rápida sobre uno de los valores. ¿Podrían explicarme qué significa? Gracias.",
          senderEmail: "paciente@email.com",
          receivedAt: new Date().toISOString()
        },
        {
          subject: "Primera cita - Nuevo paciente",
          content: "Buenos días, soy nuevo en la clínica y me gustaría agendar mi primera consulta. Tengo varios síntomas que me preocupan desde hace algunas semanas y mi médico de cabecera me derivó para una evaluación más detallada.",
          senderEmail: "nuevo.paciente@email.com",
          receivedAt: new Date().toISOString()
        },
        {
          subject: "URGENTE - Dolor severo necesito cita",
          content: "Doctor, tengo un dolor muy fuerte desde ayer que no me deja dormir. He tomado analgésicos pero no mejora. Necesito una cita lo antes posible, es urgente.",
          senderEmail: "urgencia@email.com",
          receivedAt: new Date().toISOString()
        }
      ];
      
      return NextResponse.json({ sampleEmails });
    }
    
    if (type === 'default-config') {
      // Devolver configuración predeterminada
      const defaultConfig: EmailProcessingConfig = {
        appointmentDurationMode: 'automatic',
        automaticDurationRules: [
          {
            id: '1',
            name: 'Consulta rápida',
            keywords: 'consulta rápida|pregunta|duda simple|información básica|quick|breve',
            duration: 15,
            priority: 1,
            active: true,
            description: 'Para consultas simples o preguntas básicas',
            category: 'consulta'
          },
          {
            id: '2',
            name: 'Consulta estándar',
            keywords: 'consulta|cita|revisión|checkup|evaluación',
            duration: 30,
            priority: 2,
            active: true,
            description: 'Consulta estándar de rutina',
            category: 'consulta'
          },
          {
            id: '3',
            name: 'Primera visita',
            keywords: 'primera vez|primera consulta|nuevo paciente|primera visita|inicial',
            duration: 60,
            priority: 3,
            active: true,
            description: 'Primera visita o consulta inicial',
            category: 'inicial'
          }
        ],
        enableAIAnalysis: true,
        aiAnalysisPrompt: 'Analiza el email para determinar la duración apropiada de la cita médica.',
        fallbackDuration: 60,
        confidenceThreshold: 0.6,
        defaultAppointmentDuration: 60
      };
      
      return NextResponse.json({ defaultConfig });
    }
    
    return NextResponse.json({
      status: 'Email processing API is running',
      endpoints: {
        'POST': '/api/process-email - Process single email for duration',
        'PUT': '/api/process-email - Process multiple emails in batch',
        'GET sample-emails': '/api/process-email?type=sample-emails - Get sample emails',
        'GET default-config': '/api/process-email?type=default-config - Get default configuration'
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/process-email:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Helper function para extraer nombre del email
function extractPatientName(email?: string): string | null {
  if (!email) return null;
  
  const namePart = email.split('@')[0];
  if (namePart.includes('.')) {
    return namePart.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  }
  
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}
