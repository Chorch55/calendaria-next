'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InfoCard, { useInfoCards } from '@/components/ui/info-card'
import { 
  Search, 
  BookOpen, 
  Calendar, 
  Inbox, 
  Users, 
  PhoneCall, 
  CheckSquare, 
  Bot, 
  Clock,
  Contact,
  MessageSquare,
  Zap,
  Mail,
  HelpCircle,
  Play,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Target,
  Shield,
  Rocket,
  User,
  Send,
  Paperclip,
  X,
  Brain,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  category: 'getting-started' | 'features' | 'advanced' | 'troubleshooting'
  content: {
    overview: string
    steps: { title: string; description: string; tips?: string[] }[]
    tips?: string[]
    videoUrl?: string
  }
}

interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  isTyping?: boolean
}

interface QuickAction {
  id: string
  label: string
  prompt: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Primeros Pasos',
    description: 'Aprende lo básico para comenzar a usar CalendarIA',
    icon: Rocket,
    category: 'getting-started',
    content: {
      overview: 'CalendarIA es una plataforma integral de gestión empresarial que combina calendario, comunicaciones, IA y herramientas de productividad.',
      steps: [
        {
          title: 'Configurar tu perfil',
          description: 'Ve a Configuración > Perfil para añadir tu información personal y preferencias.',
          tips: ['Añade una foto de perfil', 'Configura tu zona horaria', 'Establece tus idiomas preferidos']
        },
        {
          title: 'Conectar tus herramientas',
          description: 'En Integraciones, conecta tu email, WhatsApp y otras herramientas de trabajo.',
          tips: ['Comienza con las integraciones más importantes', 'Verifica los permisos necesarios']
        },
        {
          title: 'Configurar tu calendario',
          description: 'Añade tus primeros eventos y configura tus horarios de disponibilidad.'
        }
      ]
    }
  },
  {
    id: 'calendar-management',
    title: 'Gestión del Calendario',
    description: 'Aprende a gestionar eventos, citas y disponibilidad',
    icon: Calendar,
    category: 'features',
    content: {
      overview: 'El calendario es el corazón de CalendarIA. Aquí puedes gestionar todos tus eventos, citas y horarios de manera eficiente.',
      steps: [
        {
          title: 'Crear eventos',
          description: 'Haz clic en cualquier hora del calendario o usa el botón "+" para crear un nuevo evento.',
          tips: ['Usa títulos descriptivos', 'Añade ubicaciones y notas', 'Invita a participantes']
        },
        {
          title: 'Gestionar disponibilidad',
          description: 'Configura tus horarios de trabajo y tiempo libre en la sección de disponibilidad.',
          tips: ['Bloquea tiempo para tareas importantes', 'Configura diferentes horarios por día']
        },
        {
          title: 'Reservas online',
          description: 'Permite que otros reserven tiempo contigo usando el enlace de reservas online.'
        }
      ]
    }
  },
  {
    id: 'unified-inbox',
    title: 'Bandeja de Entrada Unificada',
    description: 'Gestiona todos tus mensajes desde un solo lugar',
    icon: Inbox,
    category: 'features',
    content: {
      overview: 'La bandeja unificada centraliza todos tus mensajes de email, WhatsApp, llamadas y notificaciones de IA.',
      steps: [
        {
          title: 'Filtrar mensajes',
          description: 'Usa los filtros por tipo (Email, WhatsApp, AI, etc.) para organizar tus mensajes.',
          tips: ['Haz clic en las categorías para filtrar automáticamente', 'Usa la búsqueda para encontrar mensajes específicos']
        },
        {
          title: 'Responder eficientemente',
          description: 'Usa plantillas de respuesta rápida y la función de respuesta por IA.',
          tips: ['Crea plantillas para respuestas comunes', 'Usa la IA para generar respuestas profesionales']
        },
        {
          title: 'Organizar conversaciones',
          description: 'Marca mensajes importantes, archiva conversaciones completadas.'
        }
      ]
    }
  },
  {
    id: 'ai-assistant',
    title: 'Asistente de IA',
    description: 'Aprovecha la IA para automatizar tareas y obtener insights',
    icon: Bot,
    category: 'features',
    content: {
      overview: 'El asistente de IA te ayuda a automatizar respuestas, analizar datos y optimizar tu productividad.',
      steps: [
        {
          title: 'Configurar respuestas automáticas',
          description: 'Define reglas para que la IA responda automáticamente ciertos tipos de mensajes.',
          tips: ['Empieza con consultas simples', 'Revisa las respuestas automáticas regularmente']
        },
        {
          title: 'Análisis de conversaciones',
          description: 'La IA analiza tus conversaciones para identificar tendencias y oportunidades.',
          tips: ['Revisa los reportes semanales', 'Actúa sobre las recomendaciones de la IA']
        },
        {
          title: 'Optimización de horarios',
          description: 'La IA sugiere mejoras en tu planificación y distribución de tiempo.'
        }
      ]
    }
  },
  {
    id: 'team-collaboration',
    title: 'Colaboración en Equipo',
    description: 'Gestiona equipos, proyectos y comunicación grupal',
    icon: Users,
    category: 'features',
    content: {
      overview: 'Organiza tu equipo, asigna tareas y mantén una comunicación efectiva con herramientas colaborativas.',
      steps: [
        {
          title: 'Invitar miembros',
          description: 'Ve a Equipo > Invitaciones para añadir nuevos miembros a tu organización.',
          tips: ['Define roles claros', 'Envía instrucciones de bienvenida']
        },
        {
          title: 'Asignar tareas',
          description: 'Crea y asigna tareas con fechas límite y prioridades.',
          tips: ['Usa descripciones claras', 'Establece fechas realistas', 'Haz seguimiento regular']
        },
        {
          title: 'Gestionar proyectos',
          description: 'Organiza el trabajo en proyectos con múltiples tareas y colaboradores.'
        }
      ]
    }
  },
  {
    id: 'contacts-management',
    title: 'Gestión de Contactos',
    description: 'Organiza y gestiona tu base de contactos',
    icon: Contact,
    category: 'features',
    content: {
      overview: 'Mantén organizada tu base de contactos con información detallada, etiquetas y historial de interacciones.',
      steps: [
        {
          title: 'Añadir contactos',
          description: 'Importa contactos o añádelos manualmente con información completa.',
          tips: ['Incluye múltiples formas de contacto', 'Añade notas relevantes', 'Usa etiquetas para categorizar']
        },
        {
          title: 'Organizar con etiquetas',
          description: 'Usa etiquetas para categorizar contactos por tipo, proyecto o importancia.',
          tips: ['Crea un sistema consistente de etiquetas', 'Usa colores para identificar rápidamente']
        },
        {
          title: 'Historial de interacciones',
          description: 'Revisa el historial completo de comunicaciones con cada contacto.'
        }
      ]
    }
  },
  {
    id: 'phone-calls',
    title: 'Gestión de Llamadas',
    description: 'Maneja llamadas, grabaciones y análisis de conversaciones',
    icon: PhoneCall,
    category: 'features',
    content: {
      overview: 'Gestiona llamadas telefónicas con grabación automática, transcripción y análisis de sentimientos.',
      steps: [
        {
          title: 'Configurar integración telefónica',
          description: 'Conecta tu sistema telefónico para registrar llamadas automáticamente.',
          tips: ['Verifica la configuración de permisos', 'Prueba con llamadas de ejemplo']
        },
        {
          title: 'Revisar transcripciones',
          description: 'Accede a transcripciones automáticas de tus llamadas para revisión y análisis.',
          tips: ['Edita transcripciones si es necesario', 'Añade notas importantes']
        },
        {
          title: 'Analizar métricas',
          description: 'Revisa estadísticas de llamadas, duración y resultados.'
        }
      ]
    }
  },
  {
    id: 'task-management',
    title: 'Gestión de Tareas',
    description: 'Organiza y da seguimiento a tus tareas y proyectos',
    icon: CheckSquare,
    category: 'features',
    content: {
      overview: 'Sistema completo de gestión de tareas con prioridades, fechas límite y colaboración en equipo.',
      steps: [
        {
          title: 'Crear tareas',
          description: 'Añade tareas con títulos descriptivos, fechas límite y niveles de prioridad.',
          tips: ['Divide tareas grandes en subtareas', 'Asigna prioridades realistas', 'Incluye toda la información necesaria']
        },
        {
          title: 'Organizar por proyectos',
          description: 'Agrupa tareas relacionadas en proyectos para mejor organización.',
          tips: ['Usa nombres de proyecto descriptivos', 'Establece objetivos claros']
        },
        {
          title: 'Hacer seguimiento',
          description: 'Utiliza los dashboards para monitorear el progreso y cumplimiento de tareas.'
        }
      ]
    }
  },
  {
    id: 'time-tracking',
    title: 'Control de Tiempo',
    description: 'Registra y analiza el tiempo dedicado a diferentes actividades',
    icon: Clock,
    category: 'features',
    content: {
      overview: 'Herramienta de seguimiento de tiempo para proyectos, clientes y actividades con reportes detallados.',
      steps: [
        {
          title: 'Iniciar seguimiento',
          description: 'Usa el cronómetro para registrar tiempo en tareas específicas o proyectos.',
          tips: ['Inicia el cronómetro al comenzar una tarea', 'Añade descripciones detalladas']
        },
        {
          title: 'Categorizar actividades',
          description: 'Organiza el tiempo registrado por proyectos, clientes o tipos de actividad.',
          tips: ['Usa categorías consistentes', 'Revisa y corrige entradas diariamente']
        },
        {
          title: 'Generar reportes',
          description: 'Crea reportes de tiempo para facturación, análisis de productividad o gestión de proyectos.'
        }
      ]
    }
  },
  {
    id: 'advanced-automation',
    title: 'Automatización Avanzada',
    description: 'Configura workflows y automatizaciones complejas',
    icon: Zap,
    category: 'advanced',
    content: {
      overview: 'Crea automatizaciones sofisticadas para optimizar tu flujo de trabajo y reducir tareas repetitivas.',
      steps: [
        {
          title: 'Crear workflows',
          description: 'Define secuencias automáticas de acciones basadas en triggers específicos.',
          tips: ['Comienza con workflows simples', 'Prueba antes de activar', 'Documenta tus automatizaciones']
        },
        {
          title: 'Configurar triggers',
          description: 'Establece eventos que activen automáticamente tus workflows.',
          tips: ['Usa triggers específicos', 'Evita duplicaciones', 'Monitorea la actividad']
        },
        {
          title: 'Monitorear resultados',
          description: 'Revisa logs y métricas de tus automatizaciones para optimizar su rendimiento.'
        }
      ]
    }
  },
  {
    id: 'automatic-duration',
    title: 'Duración Automática por Contenido de Email',
    description: 'Sistema inteligente de análisis de emails para determinar duraciones de cita',
    icon: Brain,
    category: 'features',
    content: {
      overview: 'El sistema de duración automática combina reglas personalizadas con análisis de IA para determinar automáticamente la duración más apropiada de cada cita basándose en el contenido del email. Este sistema aprende continuamente de tu feedback para mejorar la precisión.',
      steps: [
        {
          title: 'Configurar reglas básicas por palabras clave',
          description: 'Define reglas basadas en palabras clave para los tipos de cita más comunes en tu negocio.',
          tips: [
            'Usa palabras específicas: "consulta rápida" = 30 min, "primera visita" = 60 min',
            'Crea categorías por especialidad: "seguimiento", "revisión", "tratamiento completo"',
            'Asigna prioridades: reglas más específicas = prioridad más alta (1 = máxima prioridad)',
            'Incluye sinónimos y variaciones: "chequeo", "control", "revisión"'
          ]
        },
        {
          title: 'Activar y configurar el análisis de IA',
          description: 'Habilita el análisis inteligente para casos complejos que no cubren las reglas básicas.',
          tips: [
            'Personaliza el prompt según tu especialidad médica o tipo de servicio',
            'Ajusta el umbral de confianza (recomendado: 0.7 para equilibrio precisión/cobertura)',
            'Define una duración de respaldo para casos donde la IA no tiene suficiente confianza',
            'Revisa y ajusta el prompt basándote en los resultados iniciales'
          ]
        },
        {
          title: 'Configurar el sistema de feedback inteligente',
          description: 'Activa el aprendizaje automático para que la IA mejore continuamente con tu experiencia.',
          tips: [
            'Habilita el feedback automático en la configuración del canal email',
            'Personaliza las categorías de feedback según tus necesidades',
            'Activa el aprendizaje automático para que el sistema mejore solo',
            'Revisa periódicamente las estadísticas de mejora'
          ]
        },
        {
          title: 'Probar y optimizar el sistema',
          description: 'Usa las herramientas integradas para validar y mejorar el funcionamiento.',
          tips: [
            'Usa la pestaña "Pruebas" para probar emails típicos de tu negocio',
            'Revisa las estadísticas en la pestaña "Estadísticas" para identificar patrones',
            'Ajusta reglas basándote en los análisis que requieren más correcciones',
            'Proporciona feedback constante para acelerar el aprendizaje'
          ]
        },
        {
          title: 'Monitorear y mantener la precisión',
          description: 'Supervisa el rendimiento del sistema y realiza ajustes periódicos.',
          tips: [
            'Revisa las métricas semanalmente: precisión promedio, feedbacks dados',
            'Identifica patrones en los errores más comunes',
            'Actualiza reglas cuando detectes nuevos tipos de consultas frecuentes',
            'Celebra las mejoras: el sistema aprende de cada interacción'
          ]
        }
      ]
    }
  }
]

const troubleshootingFAQ = [
  {
    question: '¿Por qué no recibo notificaciones?',
    answer: 'Verifica que las notificaciones estén habilitadas en Configuración > Notificaciones. También revisa los permisos del navegador y que no tengas activado el modo "No molestar".',
    category: 'notifications'
  },
  {
    question: '¿Cómo sincronizo mi calendario externo?',
    answer: 'Ve a Integraciones > Calendarios y conecta tu cuenta de Google Calendar, Outlook o iCal. La sincronización puede tardar unos minutos en completarse.',
    category: 'integration'
  },
  {
    question: '¿Por qué la IA no responde correctamente?',
    answer: 'Revisa la configuración de la IA en el panel de asistente. Asegúrate de que las reglas estén bien definidas y que haya suficiente contexto en las conversaciones.',
    category: 'ai'
  },
  {
    question: '¿Cómo recupero mensajes eliminados?',
    answer: 'Los mensajes eliminados se mueven a la papelera y se pueden recuperar dentro de 30 días. Ve a Inbox > Papelera para restaurarlos.',
    category: 'data'
  },
  {
    question: '¿Por qué no puedo invitar usuarios?',
    answer: 'Verifica que tengas permisos de administrador y que tu plan incluya suficientes licencias de usuario. Contacta a soporte si el problema persiste.',
    category: 'permissions'
  },
  {
    question: '¿Cómo funciona el sistema de duración automática?',
    answer: 'El sistema funciona en dos fases: primero aplica tus reglas de palabras clave (ej: "consulta rápida" = 30min), luego la IA analiza el contexto completo del email para casos más complejos. Si ambos coinciden, usa esa duración. Si difieren, combina ambos resultados según el nivel de confianza. Ve a Gestión de Citas > Email > Duración Automática para configurarlo.',
    category: 'ai'
  },
  {
    question: '¿Por qué la IA sugiere duraciones incorrectas?',
    answer: 'Puede deberse a varias causas: 1) Necesitas más reglas específicas para casos comunes, 2) El prompt de la IA no está adaptado a tu especialidad, 3) El umbral de confianza es muy bajo/alto, 4) Falta feedback para que aprenda tus preferencias. Usa la pestaña "Pruebas" para identificar qué casos fallan más.',
    category: 'ai'
  },
  {
    question: '¿Cómo mejoro la precisión del análisis automático?',
    answer: 'Sigue estos pasos: 1) Crea reglas para los 5-10 tipos de cita más frecuentes, 2) Personaliza el prompt de IA con términos de tu especialidad, 3) Mantén umbral de confianza en 0.7, 4) Da feedback constante - cada evaluación enseña al sistema, 5) Revisa estadísticas semanalmente para detectar patrones de error.',
    category: 'ai'
  },
  {
    question: '¿Qué pasa si la IA no puede determinar la duración?',
    answer: 'Cuando la confianza está por debajo del umbral configurado (ej: 0.7), el sistema automáticamente usa la "duración de respaldo" que hayas definido (por defecto 60min). Esto evita errores grandes. Puedes ajustar tanto el umbral como la duración de respaldo en la configuración.',
    category: 'ai'
  },
  {
    question: '¿El feedback ayuda realmente a mejorar la IA?',
    answer: 'Absolutamente sí. Cada vez que calificas un análisis (1-5 estrellas) o corriges una duración, el sistema aprende patrones específicos de tu práctica. Con 10-20 feedbacks ya verás mejoras notables. El sistema identifica qué palabras clave son más importantes para ti y ajusta sus algoritmos automáticamente.',
    category: 'ai'
  },
  {
    question: '¿Puedo usar el sistema para diferentes tipos de servicios?',
    answer: 'Sí, es muy flexible. Puedes crear reglas específicas por servicio: "masaje relajante" = 60min, "consulta nutricional" = 45min, "terapia inicial" = 90min. La IA también aprende a distinguir entre diferentes contextos y especialidades basándose en tu feedback.',
    category: 'ai'
  }
]

const quickTips = [
  {
    title: 'Atajos de teclado',
    description: 'Usa Ctrl+K para búsqueda rápida, Ctrl+N para nuevo evento, y Ctrl+/ para ver todos los atajos.',
    icon: Target
  },
  {
    title: 'Plantillas de respuesta',
    description: 'Crea plantillas para respuestas comunes en el inbox para ahorrar tiempo.',
    icon: MessageSquare
  },
  {
    title: 'Filtros inteligentes',
    description: 'Usa filtros combinados para encontrar exactamente lo que buscas más rápidamente.',
    icon: Search
  },
  {
    title: 'Backup automático',
    description: 'Tus datos se respaldan automáticamente cada 6 horas. Puedes exportar manualmente desde Configuración.',
    icon: Shield
  }
]

const quickActions: QuickAction[] = [
  {
    id: 'calendar-setup',
    label: 'Configurar mi calendario',
    prompt: '¿Cómo configuro mi calendario por primera vez?',
    icon: Calendar
  },
  {
    id: 'inbox-filters',
    label: 'Filtrar mensajes',
    prompt: '¿Cómo uso los filtros en la bandeja de entrada?',
    icon: Inbox
  },
  {
    id: 'ai-setup',
    label: 'Configurar IA',
    prompt: 'Ve a Gestión de Citas > Email > Duración Automática para configurar el análisis inteligente de emails.',
    icon: Bot
  },
  {
    id: 'team-invite',
    label: 'Invitar equipo',
    prompt: '¿Cómo invito a miembros a mi equipo?',
    icon: Users
  },
  {
    id: 'integrations',
    label: 'Conectar herramientas',
    prompt: '¿Cómo conecto mis herramientas externas?',
    icon: Zap
  },
  {
    id: 'tasks-management',
    label: 'Gestionar tareas',
    prompt: '¿Cómo creo y organizo tareas?',
    icon: CheckSquare
  },
  {
    id: 'automatic-duration-setup',
    label: 'Configurar duración automática',
    prompt: 'Ve a Gestión de Citas, selecciona el canal Email, y activa la Duración Automática. Crea reglas básicas y activa el análisis de IA.',
    icon: Brain
  },
  {
    id: 'ai-feedback-setup',
    label: 'Activar feedback de IA',
    prompt: 'En la configuración de Duración Automática, activa el "Sistema de feedback inteligente" para que la IA aprenda de tus correcciones.',
    icon: TrendingUp
  },
  {
    id: 'duration-rules',
    label: 'Crear reglas de duración',
    prompt: 'En Duración Automática, añade reglas como: "consulta rápida" = 30min, "primera visita" = 60min. Asigna prioridades para resolver conflictos.',
    icon: Clock
  }
]

export default function HelpPage() {
  const { dismissCard } = useInfoCards()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('guides')
  
  // Chat IA states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente de IA para CalendarIA. Estoy aquí para ayudarte a aprender cómo usar todas las funcionalidades de la plataforma. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isAiTyping, setIsAiTyping] = useState(false)

  // Support form states
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    category: 'general',
    description: '',
    attachments: [] as File[]
  })
  const [showSupportForm, setShowSupportForm] = useState(false)

  const categories = [
    { id: 'all', label: 'Todos', count: helpSections.length },
    { id: 'getting-started', label: 'Primeros Pasos', count: helpSections.filter(s => s.category === 'getting-started').length },
    { id: 'features', label: 'Funcionalidades', count: helpSections.filter(s => s.category === 'features').length },
    { id: 'advanced', label: 'Avanzado', count: helpSections.filter(s => s.category === 'advanced').length },
    { id: 'troubleshooting', label: 'Solución de Problemas', count: troubleshootingFAQ.length }
  ]

  const filteredSections = helpSections.filter(section => {
    const matchesSearch = searchTerm === '' || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.overview.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const filteredFAQ = troubleshootingFAQ.filter(faq =>
    searchTerm === '' || 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Chat functions
  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      content: message,
      isUser: true,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsAiTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(message)
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '-ai',
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, aiMessage])
      setIsAiTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    // Respuestas específicas basadas en palabras clave
    if (message.includes('calendar') || message.includes('evento') || message.includes('cita')) {
      return 'Para gestionar tu calendario en CalendarIA:\n\n1. **Crear eventos**: Haz clic en cualquier hora del calendario o usa el botón "+".\n2. **Configurar disponibilidad**: Ve a Configuración > Horarios para establecer tus horas de trabajo.\n3. **Reservas online**: Activa el enlace público en Configuración > Reservas Online.\n\n¿Te gustaría que profundice en alguno de estos puntos?'
    }
    
    if (message.includes('inbox') || message.includes('mensaje') || message.includes('bandeja')) {
      return 'La Bandeja de Entrada Unificada te permite:\n\n1. **Filtrar por tipo**: Haz clic en Email, WhatsApp, AI, etc. para filtrar automáticamente.\n2. **Buscar mensajes**: Usa la barra de búsqueda para encontrar conversaciones específicas.\n3. **Respuestas rápidas**: Crea plantillas en Configuración > Plantillas.\n\n¿Necesitas ayuda con alguna función específica del inbox?'
    }
    
    if (message.includes('ia') || message.includes('asistente') || message.includes('automatización')) {
      return 'El Asistente de IA puede ayudarte con:\n\n1. **Respuestas automáticas**: Configura reglas para responder mensajes comunes.\n2. **Análisis de conversaciones**: Obtén insights sobre tus comunicaciones.\n3. **Sugerencias de horarios**: La IA optimiza tu planificación.\n\nPara configurarlo: Ve a Dashboard > Asistente > Configuración. ¿Qué aspecto te interesa más?'
    }
    
    if (message.includes('equipo') || message.includes('invitar') || message.includes('colaboración')) {
      return 'Para gestionar tu equipo:\n\n1. **Invitar miembros**: Ve a Equipo > Invitaciones y añade emails.\n2. **Asignar roles**: Define permisos en Equipo > Roles.\n3. **Crear tareas**: Asigna tareas con fechas límite en la sección Tareas.\n\n¿Necesitas ayuda con invitaciones, roles o gestión de tareas específicamente?'
    }
    
    if (message.includes('tarea') || message.includes('proyecto')) {
      return 'Para gestionar tareas y proyectos:\n\n1. **Crear tareas**: Ve a Tareas > Nueva Tarea.\n2. **Organizar por proyectos**: Agrupa tareas relacionadas.\n3. **Asignar prioridades**: Usa los niveles Alto, Medio, Bajo.\n4. **Hacer seguimiento**: Revisa el progreso en el dashboard.\n\n¿Te ayudo con la creación de tareas o la organización en proyectos?'
    }
    
    if (message.includes('integración') || message.includes('conectar') || message.includes('sincronizar')) {
      return 'Para conectar herramientas externas:\n\n1. **Ve a Integraciones**: Encuentra todas las conexiones disponibles.\n2. **Calendarios**: Conecta Google Calendar, Outlook, iCal.\n3. **Comunicaciones**: Integra WhatsApp, email, Slack.\n4. **Verificar permisos**: Asegúrate de autorizar las conexiones.\n\n¿Qué herramienta específica quieres conectar?'
    }
    
    if (message.includes('contacto') || message.includes('cliente')) {
      return 'Para gestionar contactos:\n\n1. **Añadir contactos**: Importa desde CSV o añade manualmente.\n2. **Usar etiquetas**: Organiza por tipo, proyecto o importancia.\n3. **Historial**: Revisa todas las interacciones pasadas.\n4. **Sincronización**: Conecta con tu CRM favorito.\n\n¿Necesitas ayuda con la importación, organización o sincronización?'
    }
    
    if (message.includes('configuración') || message.includes('ajustes')) {
      return 'En Configuración puedes:\n\n1. **Perfil**: Actualizar información personal y preferencias.\n2. **Notificaciones**: Personalizar alertas y recordatorios.\n3. **Idioma**: Cambiar idioma y zona horaria.\n4. **Integraciones**: Conectar herramientas externas.\n5. **Seguridad**: Gestionar contraseñas y autenticación.\n\n¿Qué configuración específica te interesa?'
    }
    
    // Respuesta genérica
    return `Entiendo que preguntas sobre "${userMessage}". Te puedo ayudar con:\n\n• **Configuración inicial** del sistema\n• **Gestión de calendario** y eventos\n• **Bandeja unificada** y filtros\n• **Asistente de IA** y automatizaciones\n• **Gestión de equipos** y colaboración\n• **Tareas y proyectos**\n• **Integraciones** con otras herramientas\n\n¿Podrías ser más específico sobre qué aspecto te gustaría aprender?`
  }

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt)
  }

  const handleSupportFormSubmit = () => {
    // Aquí se enviaría el formulario al servidor
    console.log('Enviando formulario de soporte:', supportForm)
    
    // Simular envío exitoso
    alert('Tu solicitud de soporte ha sido enviada. Te responderemos pronto.')
    
    // Resetear formulario
    setSupportForm({
      name: '',
      email: '',
      subject: '',
      priority: 'medium',
      category: 'general',
      description: '',
      attachments: []
    })
    setShowSupportForm(false)
  }

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSupportForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index: number) => {
    setSupportForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Centro de Ayuda</h1>
          <p className="text-muted-foreground">
            Aprende a usar CalendarIA y maximiza tu productividad
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar en la ayuda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.label}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Guías
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Consejos
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Chat en Vivo
          </TabsTrigger>
        </TabsList>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-4">
          {selectedCategory === 'troubleshooting' ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Preguntas Frecuentes</h2>
              {filteredFAQ.map((faq, index) => (
                <Card key={index}>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{faq.question}</CardTitle>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredSections.map((section) => {
                const IconComponent = section.icon
                const isExpanded = expandedSection === section.id

                return (
                  <Card key={section.id}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="flex items-center justify-between">
                            {section.title}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          </CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-2">Descripción General</h4>
                          <p className="text-muted-foreground">{section.content.overview}</p>
                        </div>

                        {/* Tarjetas informativas específicas para duración automática */}
                        {section.id === 'automatic-duration' && (
                          <div className="space-y-3">
                            <InfoCard
                              id={`help-${section.id}-welcome`}
                              title="🎯 Sistema Revolucionario"
                              description="Este es uno de los sistemas más avanzados de CalendarIA. Combina la precisión de reglas personalizadas con la inteligencia contextual de la IA para automatizar completamente la gestión de duraciones."
                              type="ai"
                              onDismiss={dismissCard}
                            />
                            <InfoCard
                              id={`help-${section.id}-learning`}
                              title="🧠 Aprendizaje Continuo"
                              description="Cada feedback que proporcionas hace que el sistema sea más inteligente. Con el tiempo, la IA aprenderá tus patrones específicos y se adaptará a tu estilo de trabajo único."
                              type="feature"
                              onDismiss={dismissCard}
                            />
                          </div>
                        )}

                        {/* Tarjetas informativas para IA Assistant */}
                        {section.id === 'ai-assistant' && (
                          <div className="space-y-3">
                            <InfoCard
                              id={`help-${section.id}-power`}
                              title="⚡ Potencia de la IA"
                              description="El asistente de IA no solo responde automáticamente, sino que analiza patrones, identifica oportunidades de mejora y optimiza tu flujo de trabajo sin intervención manual."
                              type="ai"
                              onDismiss={dismissCard}
                            />
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold mb-4">Pasos a Seguir</h4>
                          <div className="space-y-4">
                            {section.content.steps.map((step, index) => (
                              <div key={index} className="border-l-2 border-primary pl-4">
                                <h5 className="font-medium mb-1">
                                  {index + 1}. {step.title}
                                </h5>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {step.description}
                                </p>
                                {step.tips && step.tips.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-primary mb-1">💡 Consejos:</p>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                      {step.tips.map((tip, tipIndex) => (
                                        <li key={tipIndex} className="flex items-start gap-1">
                                          <span className="text-primary">•</span>
                                          <span>{tip}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Casos de uso prácticos para duración automática */}
                        {section.id === 'automatic-duration' && (
                          <div>
                            <h4 className="font-semibold mb-4">💼 Casos de Uso Prácticos</h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Consulta Médica</h5>
                                <div className="text-sm space-y-1">
                                  <p><strong>Email:</strong> &ldquo;Necesito una revisión de mi diabetes, tengo los análisis listos&rdquo;</p>
                                  <p><strong>Regla:</strong> &ldquo;revisión diabetes&rdquo; = 45 min</p>
                                  <p><strong>IA detecta:</strong> Seguimiento con resultados = duración estándar</p>
                                  <p><strong>Resultado:</strong> 45 minutos (alta confianza)</p>
                                </div>
                              </div>
                              
                              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                                <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">Servicio de Belleza</h5>
                                <div className="text-sm space-y-1">
                                  <p><strong>Email:</strong> &ldquo;Quiero un corte y un tratamiento de hidratación completo&rdquo;</p>
                                  <p><strong>Regla:</strong> &ldquo;corte&rdquo; = 30 min</p>
                                  <p><strong>IA detecta:</strong> Servicios múltiples = tiempo extendido</p>
                                  <p><strong>Resultado:</strong> 90 minutos (combinación inteligente)</p>
                                </div>
                              </div>
                              
                              <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Consultoría</h5>
                                <div className="text-sm space-y-1">
                                  <p><strong>Email:</strong> &ldquo;Primera reunión para discutir estrategia digital integral&rdquo;</p>
                                  <p><strong>Regla:</strong> &ldquo;primera reunión&rdquo; = 60 min</p>
                                  <p><strong>IA detecta:</strong> Proyecto complejo = tiempo adicional</p>
                                  <p><strong>Resultado:</strong> 90 minutos (ajuste inteligente)</p>
                                </div>
                              </div>
                              
                              <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                                <h5 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Terapia</h5>
                                <div className="text-sm space-y-1">
                                  <p><strong>Email:</strong> &ldquo;Necesito hablar, he tenido una semana muy difícil&rdquo;</p>
                                  <p><strong>Regla:</strong> Sin coincidencia directa</p>
                                  <p><strong>IA detecta:</strong> Sesión de apoyo emocional = tiempo estándar</p>
                                  <p><strong>Resultado:</strong> 60 minutos (duración de respaldo)</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {section.content.videoUrl && (
                          <div>
                            <h4 className="font-semibold mb-2">Video Tutorial</h4>
                            <Button variant="outline" className="flex items-center gap-2">
                              <Play className="h-4 w-4" />
                              Ver Video
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Preguntas Frecuentes</h2>
            {filteredFAQ.map((faq, index) => (
              <Card key={index}>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Consejos y Trucos</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {quickTips.map((tip, index) => {
                const IconComponent = tip.icon
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{tip.title}</h4>
                          <p className="text-sm text-muted-foreground">{tip.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        {/* Chat IA Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Quick Actions Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Acciones Rápidas
                  </CardTitle>
                  <CardDescription>
                    Haz clic para preguntar sobre estos temas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickActions.map((action) => {
                    const IconComponent = action.icon
                    return (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-3"
                        onClick={() => handleQuickAction(action)}
                      >
                        <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{action.label}</span>
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Chat en Vivo - Asistente IA
                  </CardTitle>
                  <CardDescription>
                    Pregúntame cualquier cosa sobre cómo usar CalendarIA
                  </CardDescription>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.isUser ? "justify-end" : "justify-start"
                        )}
                      >
                        {!message.isUser && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                            message.isUser
                              ? "bg-primary text-primary-foreground ml-12"
                              : "bg-muted"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {message.isUser && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isAiTyping && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg px-4 py-2 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Pregúntame cómo usar CalendarIA..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage(chatInput)
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => sendMessage(chatInput)}
                        disabled={!chatInput.trim() || isAiTyping}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Presiona Enter para enviar. La IA está especializada en CalendarIA.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Conditional Contact Section */}
      <Card>
        <CardContent className="p-6">
          {activeTab === 'chat' ? (
            // Si estamos en la pestaña de chat, solo mostrar contactar soporte
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">¿El chat no resolvió tu problema?</h3>
              <p className="text-muted-foreground">
                Nuestro equipo de soporte humano está aquí para ayudarte con problemas más complejos.
              </p>
              <Button onClick={() => setShowSupportForm(true)}>
                <Mail className="h-4 w-4 mr-2" />
                Contactar Soporte
              </Button>
            </div>
          ) : (
            // Para otras pestañas, mostrar ambas opciones
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">¿Necesitas más ayuda?</h3>
              <p className="text-muted-foreground">
                Si no encuentras la respuesta que buscas, nuestro equipo de soporte está aquí para ayudarte.
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('chat')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat en Vivo
                </Button>
                <Button onClick={() => setShowSupportForm(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Contactar Soporte
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support Form Modal */}
      {showSupportForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Contactar Soporte
                  </CardTitle>
                  <CardDescription>
                    Describe tu problema y te ayudaremos lo antes posible
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowSupportForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información personal */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nombre completo</label>
                  <Input
                    placeholder="Tu nombre"
                    value={supportForm.name}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="tu.email@ejemplo.com"
                    value={supportForm.email}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Categoría y prioridad */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoría del problema</label>
                  <Select 
                    value={supportForm.category} 
                    onValueChange={(value) => setSupportForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Consulta General</SelectItem>
                      <SelectItem value="technical">Problema Técnico</SelectItem>
                      <SelectItem value="billing">Facturación</SelectItem>
                      <SelectItem value="integration">Integraciones</SelectItem>
                      <SelectItem value="calendar">Calendario</SelectItem>
                      <SelectItem value="inbox">Bandeja de Entrada</SelectItem>
                      <SelectItem value="ai">Asistente IA</SelectItem>
                      <SelectItem value="team">Gestión de Equipo</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Prioridad</label>
                  <Select 
                    value={supportForm.priority} 
                    onValueChange={(value) => setSupportForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Baja - No urgente
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Media
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Alta
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Urgente
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Asunto */}
              <div>
                <label className="text-sm font-medium mb-2 block">Asunto</label>
                <Input
                  placeholder="Describe brevemente tu problema"
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-medium mb-2 block">Descripción detallada</label>
                <Textarea
                  placeholder="Explica tu problema con el mayor detalle posible. Incluye pasos para reproducir el error, mensajes de error, y cualquier información relevante."
                  value={supportForm.description}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                />
              </div>

              {/* Archivos adjuntos */}
              <div>
                <label className="text-sm font-medium mb-2 block">Archivos adjuntos (opcional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleAttachmentChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Paperclip className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Haz clic para seleccionar archivos o arrastra aquí
                    </span>
                    <span className="text-xs text-gray-500">
                      Imágenes, PDF, DOC, TXT (máx. 10MB por archivo)
                    </span>
                  </label>
                </div>

                {/* Lista de archivos adjuntos */}
                {supportForm.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {supportForm.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSupportForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSupportFormSubmit}
                  className="flex-1"
                  disabled={!supportForm.name || !supportForm.email || !supportForm.subject || !supportForm.description}
                >
                  Enviar Solicitud
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
