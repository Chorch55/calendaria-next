"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import InfoCard, { useInfoCards } from "@/components/ui/info-card";
import EmailDurationTest from "@/components/email-duration-test";
import AutomaticDurationStats from "@/components/automatic-duration-stats";
import EnhancedOverview from '@/components/dashboard/enhanced-overview';
import EnhancedStats from '@/components/dashboard/enhanced-stats';
import RealtimeStatsPanel from '@/components/dashboard/realtime-stats-panel';



// import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  Globe,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Save,
  Settings2,
  Trash2,
  BarChart3,
  Bot,
  MessageCircle,
  Clock3,
  Timer,
  CalendarClock,
  Coffee
} from 'lucide-react';

interface AutomaticDurationRule {
  id: string;
  name: string;
  keywords: string;
  duration: number;
  priority: number;
  active: boolean;
  description?: string;
  category?: string;
}

interface AIFeedbackConfig {
  enableFeedback: boolean;
  feedbackCategories: string[];
  autoLearnFromFeedback: boolean;
  feedbackPrompt: string;
}


interface ChannelConfig {
  enabled: boolean;
  maxAdvanceBooking: number;
  minAdvanceBooking: number;
  businessHoursOnly: boolean;
  customMessage: string;
  confirmationTemplate: string;
  maxSlotsPerDay: number;
  allowCancellation: boolean;
  cancellationDeadline: number;
  // Opciones básicas inspiradas en sistemas de cita previa
  stepByStepFlow: boolean;
  requireLocation: boolean;
  showServiceSelection: boolean;
  visualCalendar: boolean;
  timeSlotSelection: boolean;
  clientDataForm: boolean;
  paymentOptions: string[];
  confirmationStep: boolean;
  locationOptions: string[];
  customFields: Array<{
    id: string;
    name: string;
    type: 'text' | 'email' | 'phone' | 'select' | 'textarea';
    required: boolean;
    options?: string[];
  }>;
  // Nuevas opciones avanzadas inspiradas en ITV Sitval
  requireLocationSelection: boolean;
  singleLocation: string; // Campo para ubicación única cuando no hay selección múltiple
  allowDocumentAttachments: boolean;
  availableLocations: Array<{ name: string; address: string }>;
  enablePaymentOptions: boolean;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet';
  paymentTiming: 'no_payment' | 'advance_payment' | 'full_payment';
  depositPercentage: number;
  // Confirmación y recordatorios
  autoConfirm: boolean;
  finalConfirmationMethod: 'email' | 'sms' | 'whatsapp' | 'phone_call' | 'multiple';
  reminderEnabled: boolean;
  reminderTiming: number;
  reminderUnit: 'hours' | 'days' | 'weeks';
  // Gestión de tiempos de citas
  appointmentDurationMode: 'fixed' | 'by_service_category' | 'automatic';
  defaultAppointmentDuration: number; // en minutos
  serviceCategoryDurations: Array<{
    id: string;
    categoryName: string;
    duration: number; // en minutos
    active: boolean;
  }>;
  // Sistema de duración automática por contenido de email
  automaticDurationRules: AutomaticDurationRule[];
  enableAIAnalysis: boolean;
  aiAnalysisPrompt: string;
  fallbackDuration: number;
  confidenceThreshold: number;
  // Sistema de feedback de IA
  aiFeedbackConfig: AIFeedbackConfig;
  // Horarios de atención simplificados (copiado de WhatsApp)
  businessHours: {
    enabled: boolean;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
      enabled: boolean;
    }>;
  };
  outOfHoursMessage: string;
  // Funcionalidades específicas de WhatsApp
  whatsappMessageAnalysis: boolean;
  whatsappSentimentAnalysis: boolean;
  whatsappTimeStatistics: boolean;
  whatsappAutoResponse: boolean;
  whatsappAIResponseLevel: 'basic' | 'advanced' | 'expert';
  whatsappResponseTemplates: Array<{
    id: string;
    trigger: string;
    response: string;
    active: boolean;
  }>;
  whatsappBusinessHours: {
    enabled: boolean;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
      enabled: boolean;
    }>;
  };
  whatsappOutOfHoursMessage: string;
}

interface ServiceType {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  enabled: boolean;
  maxBookingsPerDay: number;
  requiresPrePayment: boolean;
}

export default function AppointmentManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { dismissCard } = useInfoCards();

  // Valores por defecto para canales básicos (sin funcionalidades avanzadas)
  const getBasicChannelDefaults = () => ({
    stepByStepFlow: false,
    requireLocation: false,
    showServiceSelection: false,
    visualCalendar: false,
    timeSlotSelection: false,
    clientDataForm: false,
    paymentOptions: ['in_person'] as string[],
    confirmationStep: false,
    locationOptions: [] as string[],
    customFields: [] as Array<{
      id: string;
      name: string;
      type: 'text' | 'email' | 'phone' | 'select' | 'textarea';
      required: boolean;
      options?: string[];
    }>,
    // Nuevas propiedades avanzadas
    requireLocationSelection: false,
    singleLocation: '',
    allowDocumentAttachments: false,
    availableLocations: [] as Array<{ name: string; address: string }>,
    enablePaymentOptions: false,
    paymentMethod: 'cash' as const,
    paymentTiming: 'no_payment' as const,
    depositPercentage: 20,
    // Confirmación y recordatorios
    autoConfirm: false,
    finalConfirmationMethod: 'email' as const,
    reminderEnabled: false,
    reminderTiming: 24,
    reminderUnit: 'hours' as const,
    // Gestión de tiempos de citas
    appointmentDurationMode: 'fixed' as const,
    defaultAppointmentDuration: 60, // 60 minutos por defecto
    serviceCategoryDurations: [] as Array<{
      id: string;
      categoryName: string;
      duration: number;
      active: boolean;
    }>,
    // Sistema de duración automática por contenido de email
    automaticDurationRules: [] as AutomaticDurationRule[],
    enableAIAnalysis: false,
    aiAnalysisPrompt: 'Analiza el siguiente email y determina la duración apropiada para la cita en base al contenido. Considera la complejidad del asunto mencionado.',
    fallbackDuration: 60,
    confidenceThreshold: 0.7,
    // Sistema de feedback de IA
    aiFeedbackConfig: {
      enableFeedback: true,
      feedbackCategories: ['precisión', 'relevancia', 'utilidad', 'claridad'],
      autoLearnFromFeedback: true,
      feedbackPrompt: 'Proporciona feedback sobre la precisión del análisis de duración y sugerencias de mejora.'
    },
    // Horarios de atención simplificados (copiado de WhatsApp)
    businessHours: {
      enabled: false,
      schedule: [
        'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
      ].map(day => ({
        day,
        startTime: '09:00',
        endTime: '18:00',
        enabled: day !== 'Sábado' && day !== 'Domingo'
      }))
    },
    outOfHoursMessage: 'Gracias por contactarnos. Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00.',
    // Funcionalidades específicas de WhatsApp (por defecto desactivadas para otros canales)
    whatsappMessageAnalysis: false,
    whatsappSentimentAnalysis: false,
    whatsappTimeStatistics: false,
    whatsappAutoResponse: false,
    whatsappAIResponseLevel: 'basic' as const,
    whatsappResponseTemplates: [] as Array<{
      id: string;
      trigger: string;
      response: string;
      active: boolean;
    }>,
    whatsappBusinessHours: {
      enabled: false,
      schedule: [] as Array<{
        day: string;
        startTime: string;
        endTime: string;
        enabled: boolean;
      }>
    },
    whatsappOutOfHoursMessage: 'Gracias por contactarnos. Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00.'
  });

  // Configuraciones por canal
  const [webConfig, setWebConfig] = useState<ChannelConfig>({
    enabled: true,
    maxAdvanceBooking: 30,
    minAdvanceBooking: 2,
    businessHoursOnly: true,
    customMessage: 'Bienvenido a nuestro sistema de reservas online. Selecciona el servicio que necesitas.',
    confirmationTemplate: 'Tu cita ha sido confirmada para el {date} a las {time}. Te esperamos!',
    maxSlotsPerDay: 10,
    allowCancellation: true,
    cancellationDeadline: 24,
    ...getBasicChannelDefaults(),
    // Configuraciones específicas para web (sobrescriben defaults)
    stepByStepFlow: true,
    requireLocation: true,
    showServiceSelection: true,
    visualCalendar: true,
    timeSlotSelection: true,
    clientDataForm: true,
    paymentOptions: ['online', 'payment_link', 'in_person', 'prepaid'],
    confirmationStep: true,
    locationOptions: ['Oficina Central - Madrid', 'Sucursal Norte - Barcelona', 'Sucursal Sur - Valencia'],
    customFields: [
      {
        id: 'name',
        name: 'Nombre y apellidos',
        type: 'text',
        required: true
      },
      {
        id: 'phone',
        name: 'Teléfono móvil',
        type: 'phone',
        required: true
      },
      {
        id: 'email',
        name: 'Correo electrónico',
        type: 'email',
        required: false
      },
      {
        id: 'notes',
        name: 'Comentarios adicionales',
        type: 'textarea',
        required: false
      }
    ],
    // Configuraciones avanzadas específicas para web
    enablePaymentOptions: true,
    paymentMethod: 'card',
    requireLocationSelection: true,
    singleLocation: 'Oficina Central - Calle Mayor 123, Madrid',
    availableLocations: [
      { name: 'Oficina Central', address: 'Madrid, España' },
      { name: 'Sucursal Norte', address: 'Barcelona, España' }
    ],
    // Configuraciones avanzadas de tiempo y horarios para web
    appointmentDurationMode: 'by_service_category',
    defaultAppointmentDuration: 45,
    serviceCategoryDurations: [
      {
        id: '1',
        categoryName: 'Consulta general',
        duration: 30,
        active: true
      },
      {
        id: '2',
        categoryName: 'Tratamiento especializado',
        duration: 90,
        active: true
      },
      {
        id: '3',
        categoryName: 'Primera visita',
        duration: 60,
        active: true
      }
    ],
    businessHours: {
      enabled: false,
      schedule: [
        'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
      ].map(day => ({
        day,
        startTime: '09:00',
        endTime: '18:00',
        enabled: day !== 'Sábado' && day !== 'Domingo'
      }))
    },
    outOfHoursMessage: 'Gracias por contactarnos por email. Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00.',
  });

  const [whatsappConfig, setWhatsappConfig] = useState<ChannelConfig>({
    enabled: true,
    maxAdvanceBooking: 21,
    minAdvanceBooking: 4,
    businessHoursOnly: false,
    customMessage: '¡Hola! Puedo ayudarte a reservar una cita. ¿Qué tipo de servicio necesitas?',
    confirmationTemplate: 'Perfecto! He reservado tu cita para el {date} a las {time}. Confirmación: #{booking_id}',
    maxSlotsPerDay: 8,
    allowCancellation: true,
    cancellationDeadline: 12,
    ...getBasicChannelDefaults(),
    // Configuraciones específicas para WhatsApp
    autoConfirm: false,
    reminderEnabled: true,
    reminderTiming: 2,
    reminderUnit: 'hours',
    // Configuraciones avanzadas de tiempo para WhatsApp
    appointmentDurationMode: 'by_service_category',
    defaultAppointmentDuration: 30,
    serviceCategoryDurations: [
      {
        id: '1',
        categoryName: 'Consulta rápida',
        duration: 15,
        active: true
      },
      {
        id: '2',
        categoryName: 'Consulta completa',
        duration: 45,
        active: true
      },
      {
        id: '3',
        categoryName: 'Primera cita',
        duration: 60,
        active: true
      }
    ],
    // Configuración de ubicaciones (añadido de Web)
    stepByStepFlow: true,
    requireLocationSelection: true,
    singleLocation: 'Oficina Central - Calle Mayor 123, Madrid',
    allowDocumentAttachments: true,
    availableLocations: [
      { name: 'Oficina Principal', address: 'Calle Mayor 123, Madrid' },
      { name: 'Sucursal Norte', address: 'Avenida Europa 45, Barcelona' },
      { name: 'Sucursal Sur', address: 'Calle Poeta Querol 12, Valencia' }
    ],
    // Configuración de pagos (añadido de Web)
    enablePaymentOptions: true,
    paymentMethod: 'digital_wallet',
    paymentTiming: 'advance_payment',
    depositPercentage: 30,
    // Funcionalidades avanzadas de WhatsApp activadas
    whatsappMessageAnalysis: true,
    whatsappSentimentAnalysis: true,
    whatsappTimeStatistics: true,
    whatsappAutoResponse: true,
    whatsappAIResponseLevel: 'advanced',
    whatsappResponseTemplates: [
      {
        id: '1',
        trigger: 'hola|buenos días|buenas tardes',
        response: '¡Hola! 👋 Bienvenido/a a nuestro servicio de citas. ¿En qué puedo ayudarte hoy?',
        active: true
      },
      {
        id: '2',
        trigger: 'precio|costo|tarifa',
        response: 'Te envío información sobre nuestros precios. ¿Qué servicio te interesa?',
        active: true
      },
      {
        id: '3',
        trigger: 'horario|disponibilidad',
        response: 'Nuestro horario es de lunes a viernes de 9:00 a 18:00. ¿Qué día te viene mejor?',
        active: true
      }
    ],
    whatsappBusinessHours: {
      enabled: true,
      schedule: [
        { day: 'Lunes', startTime: '09:00', endTime: '18:00', enabled: true },
        { day: 'Martes', startTime: '09:00', endTime: '18:00', enabled: true },
        { day: 'Miércoles', startTime: '09:00', endTime: '18:00', enabled: true },
        { day: 'Jueves', startTime: '09:00', endTime: '18:00', enabled: true },
        { day: 'Viernes', startTime: '09:00', endTime: '18:00', enabled: true },
        { day: 'Sábado', startTime: '10:00', endTime: '14:00', enabled: false },
        { day: 'Domingo', startTime: '10:00', endTime: '14:00', enabled: false }
      ]
    },
    whatsappOutOfHoursMessage: '🕒 Gracias por escribirnos. Actualmente estamos fuera del horario de atención. Te responderemos en cuanto regresemos. Nuestro horario es de lunes a viernes de 9:00 a 18:00.'
  });

  const [emailConfig, setEmailConfig] = useState<ChannelConfig>({
    enabled: true,
    maxAdvanceBooking: 45,
    minAdvanceBooking: 12,
    businessHoursOnly: true,
    customMessage: 'Estimado/a cliente,\n\nGracias por contactarnos. Para procesar su solicitud de cita, por favor proporcione los detalles necesarios.\n\nAtentamente,\nEquipo de Atención al Cliente',
    confirmationTemplate: 'Estimado/a cliente,\n\nConfirmamos su cita programada para el {date} a las {time}.\n\nDetalles de la cita:\n- Fecha: {date}\n- Hora: {time}\n- Servicio: {service}\n- ID de reserva: {booking_id}\n\nSi necesita realizar algún cambio, por favor contáctenos con al menos 48 horas de anticipación.\n\nAtentamente,\nEquipo de Gestión de Citas',
    maxSlotsPerDay: 15,
    allowCancellation: true,
    cancellationDeadline: 48,
    ...getBasicChannelDefaults(),
    // Configuraciones específicas para Email (adaptadas del Web y WhatsApp)
    stepByStepFlow: true,
    requireLocationSelection: false, // Más común enviar ubicación en email que seleccionar
    singleLocation: 'Oficina Central - Calle Mayor 123, Madrid (indicaciones detalladas se enviarán por email)',
    allowDocumentAttachments: true, // Email es ideal para adjuntos
    availableLocations: [
      { name: 'Oficina Principal', address: 'Calle Mayor 123, Madrid - Tel: 912-345-678' },
      { name: 'Sucursal Norte', address: 'Avenida Europa 45, Barcelona - Tel: 934-567-890' },
      { name: 'Sucursal Sur', address: 'Calle Poeta Querol 12, Valencia - Tel: 963-789-012' }
    ],
    // Configuración de pagos (adaptada para email)
    enablePaymentOptions: true,
    paymentMethod: 'bank_transfer', // Más común por email
    paymentTiming: 'advance_payment',
    depositPercentage: 50, // Mayor porcentaje por la naturaleza del email
    // Configuraciones específicas para Email
    autoConfirm: false, // Email requiere más verificación manual
    reminderEnabled: true,
    reminderTiming: 48,
    reminderUnit: 'hours',
    finalConfirmationMethod: 'email', // Valor por defecto para email
    // Gestión de tiempos de citas (adaptado)
    appointmentDurationMode: 'automatic',
    defaultAppointmentDuration: 60,
    serviceCategoryDurations: [
      {
        id: '1',
        categoryName: 'Consulta general',
        duration: 30,
        active: true
      },
      {
        id: '2',
        categoryName: 'Tratamiento especializado',
        duration: 90,
        active: true
      },
      {
        id: '3',
        categoryName: 'Primera consulta',
        duration: 60,
        active: true
      }
    ],
    // Sistema de duración automática por contenido de email
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
        keywords: 'consulta|cita|revisión|checkup|evaluación|consulta general',
        duration: 30,
        priority: 2,
        active: true,
        description: 'Consulta estándar de rutina',
        category: 'consulta'
      },
      {
        id: '3',
        name: 'Primera visita',
        keywords: 'primera vez|primera consulta|primera cita|nuevo paciente|primera visita|inicial',
        duration: 60,
        priority: 3,
        active: true,
        description: 'Primera visita o consulta inicial',
        category: 'inicial'
      },
      {
        id: '4',
        name: 'Tratamiento especializado',
        keywords: 'tratamiento|terapia|procedimiento|intervención|especializado|cirugía menor',
        duration: 90,
        priority: 4,
        active: true,
        description: 'Tratamientos especializados que requieren más tiempo',
        category: 'tratamiento'
      },
      {
        id: '5',
        name: 'Urgencia',
        keywords: 'urgente|emergencia|dolor|inmediato|cuanto antes|prioritario',
        duration: 45,
        priority: 5,
        active: true,
        description: 'Citas urgentes que requieren atención prioritaria',
        category: 'urgencia'
      }
    ] as AutomaticDurationRule[],
    enableAIAnalysis: true,
    aiAnalysisPrompt: 'Analiza el siguiente email para determinar la duración apropiada de la cita médica/profesional. Considera: el tipo de consulta mencionada, la complejidad del problema descrito, si es primera visita, si menciona tratamientos específicos, y el nivel de urgencia. Devuelve la duración en minutos (15, 30, 45, 60, 90) y un nivel de confianza del 0 al 1.',
    fallbackDuration: 60,
    confidenceThreshold: 0.6,
    // Horarios específicos para email (más flexibles)
    businessHours: {
      enabled: true,
      schedule: [
        { day: 'Lunes', startTime: '08:00', endTime: '19:00', enabled: true },
        { day: 'Martes', startTime: '08:00', endTime: '19:00', enabled: true },
        { day: 'Miércoles', startTime: '08:00', endTime: '19:00', enabled: true },
        { day: 'Jueves', startTime: '08:00', endTime: '19:00', enabled: true },
        { day: 'Viernes', startTime: '08:00', endTime: '19:00', enabled: true },
        { day: 'Sábado', startTime: '09:00', endTime: '15:00', enabled: true },
        { day: 'Domingo', startTime: '10:00', endTime: '14:00', enabled: false }
      ]
    },
    outOfHoursMessage: 'Estimado/a cliente,\n\nGracias por su email. Hemos recibido su solicitud fuera de nuestro horario de atención (Lunes a Sábado, 8:00-19:00).\n\nProcessaremos su solicitud en el próximo día hábil y le contactaremos dentro de las próximas 24 horas.\n\nPara urgencias, puede llamar al 912-345-678.\n\nAtentamente,\nEquipo de Atención al Cliente',
    // Email no necesita funcionalidades específicas de WhatsApp, pero mantiene estructura
    whatsappMessageAnalysis: false,
    whatsappSentimentAnalysis: false,
    whatsappTimeStatistics: false,
    whatsappAutoResponse: false,
    whatsappAIResponseLevel: 'basic',
    whatsappResponseTemplates: [],
    whatsappBusinessHours: { enabled: false, schedule: [] },
    whatsappOutOfHoursMessage: ''
  });

  // Configuración del canal de Llamadas (Phone)
  const [phoneConfig, setPhoneConfig] = useState<ChannelConfig>({
    enabled: true,
    maxAdvanceBooking: 14,
    minAdvanceBooking: 1,
    businessHoursOnly: true,
    customMessage: 'Gracias por llamar. Le ayudaremos a programar su cita. Por favor, proporciónenos sus datos.',
    confirmationTemplate: 'Su cita está confirmada para el {date} a las {time}. Le enviaremos un recordatorio 24 horas antes.',
    maxSlotsPerDay: 12,
    allowCancellation: true,
    cancellationDeadline: 12,
    ...getBasicChannelDefaults(),
    // Configuraciones específicas para llamadas telefónicas
    stepByStepFlow: false, // Las llamadas son más directas
    requireLocationSelection: true,
    singleLocation: 'Oficina Central - Calle Mayor 123, Madrid',
    allowDocumentAttachments: false, // No aplica para llamadas
    availableLocations: [
      { name: 'Oficina Principal', address: 'Calle Mayor 123, Madrid - Tel: 912-345-678' },
      { name: 'Sucursal Norte', address: 'Avenida Europa 45, Barcelona - Tel: 934-567-890' },
      { name: 'Sucursal Sur', address: 'Calle Poeta Querol 12, Valencia - Tel: 963-789-012' }
    ],
    // Configuración de pagos para llamadas
    enablePaymentOptions: true,
    paymentMethod: 'card', // Se puede tomar por teléfono
    paymentTiming: 'advance_payment',
    depositPercentage: 30,
    // Confirmación específica para llamadas
    autoConfirm: true, // Las llamadas pueden confirmarse inmediatamente
    reminderEnabled: true,
    reminderTiming: 24,
    reminderUnit: 'hours',
    finalConfirmationMethod: 'phone_call',
    // Gestión de tiempos para llamadas
    appointmentDurationMode: 'fixed',
    defaultAppointmentDuration: 30,
    serviceCategoryDurations: [
      {
        id: '1',
        categoryName: 'Consulta telefónica',
        duration: 15,
        active: true
      },
      {
        id: '2',
        categoryName: 'Cita presencial',
        duration: 30,
        active: true
      },
      {
        id: '3',
        categoryName: 'Consulta especializada',
        duration: 60,
        active: true
      }
    ],
    // Configuraciones específicas para llamadas
    automaticDurationRules: [
      {
        id: '1',
        name: 'Consulta rápida telefónica',
        keywords: 'pregunta rápida|consulta breve|información|dudas',
        duration: 15,
        priority: 1,
        active: true,
        description: 'Consultas telefónicas breves',
        category: 'telefonica'
      },
      {
        id: '2',
        name: 'Cita presencial estándar',
        keywords: 'cita|visita|consulta presencial|revisión',
        duration: 30,
        priority: 2,
        active: true,
        description: 'Citas presenciales estándar',
        category: 'presencial'
      },
      {
        id: '3',
        name: 'Primera consulta',
        keywords: 'primera vez|nuevo|inicial|primera cita',
        duration: 45,
        priority: 3,
        active: true,
        description: 'Primera consulta presencial',
        category: 'inicial'
      }
    ] as AutomaticDurationRule[],
    enableAIAnalysis: false, // No aplica para llamadas en tiempo real
    aiAnalysisPrompt: '',
    fallbackDuration: 30,
    confidenceThreshold: 0.7,
    // Horarios telefónicos
    businessHours: {
      enabled: true,
      schedule: [
        { day: 'Lunes', startTime: '09:00', endTime: '18:00', enabled: true },
        { day: 'Martes', startTime: '09:00', endTime: '18:00', enabled: true },
        { day: 'Miércoles', startTime: '09:00', endTime: '18:00', enabled: true },
        { day: 'Jueves', startTime: '09:00', endTime: '18:00', enabled: true },
        { day: 'Viernes', startTime: '09:00', endTime: '18:00', enabled: true },
        { day: 'Sábado', startTime: '10:00', endTime: '14:00', enabled: true },
        { day: 'Domingo', startTime: '00:00', endTime: '00:00', enabled: false }
      ]
    },
    outOfHoursMessage: 'Gracias por llamar. Nuestro horario de atención telefónica es de lunes a viernes de 9:00 a 18:00, y sábados de 10:00 a 14:00. Por favor, llame en horario de oficina o deje un mensaje.',
    // Configuraciones no aplicables para llamadas
    whatsappMessageAnalysis: false,
    whatsappSentimentAnalysis: false,
    whatsappTimeStatistics: false,
    whatsappAutoResponse: false,
    whatsappAIResponseLevel: 'basic',
    whatsappResponseTemplates: [],
    whatsappBusinessHours: { enabled: false, schedule: [] },
    whatsappOutOfHoursMessage: ''
  });

  // Tipos de servicios
  const [services] = useState<ServiceType[]>([
    {
      id: 'consultation',
      name: 'Consulta General',
      duration: 30,
      price: 50,
      description: 'Consulta general de 30 minutos',
      enabled: true,
      maxBookingsPerDay: 8,
      requiresPrePayment: false
    },
    {
      id: 'follow-up',
      name: 'Seguimiento',
      duration: 15,
      price: 25,
      description: 'Cita de seguimiento',
      enabled: true,
      maxBookingsPerDay: 12,
      requiresPrePayment: false
    },
    {
      id: 'premium',
      name: 'Consulta Premium',
      duration: 60,
      price: 100,
      description: 'Consulta extendida de 1 hora',
      enabled: true,
      maxBookingsPerDay: 4,
      requiresPrePayment: true
    }
  ]);

  const updateChannelConfig = (channel: string, key: string, value: unknown) => {
    setHasUnsavedChanges(true);
    try {
      switch (channel) {
        case 'web':
          setWebConfig(prev => ({ ...prev, [key]: value }));
          break;
        case 'whatsapp':
          setWhatsappConfig(prev => ({ ...prev, [key]: value }));
          break;
        case 'email':
          setEmailConfig(prev => ({ ...prev, [key]: value }));
          break;
        case 'phone':
          setPhoneConfig(prev => ({ ...prev, [key]: value }));
          break;
        default:
          console.warn(`Canal desconocido: ${channel}`);
      }
    } catch (error) {
      console.error(`Error actualizando configuración para ${channel}:`, error);
    }
  };

  const updateDaySchedule = (channel: string, dayIndex: number, key: string, value: unknown) => {
    setHasUnsavedChanges(true);
    try {
      switch (channel) {
        case 'web':
          setWebConfig(prev => ({
            ...prev,
            businessHours: {
              ...prev.businessHours,
              schedule: prev.businessHours.schedule.map((day, index) =>
                index === dayIndex ? { ...day, [key]: value } : day
              )
            }
          }));
          break;
        case 'whatsapp':
          setWhatsappConfig(prev => ({
            ...prev,
            businessHours: {
              ...prev.businessHours,
              schedule: prev.businessHours.schedule.map((day, index) =>
                index === dayIndex ? { ...day, [key]: value } : day
              )
            }
          }));
          break;
        case 'email':
          setEmailConfig(prev => ({
            ...prev,
            businessHours: {
              ...prev.businessHours,
              schedule: prev.businessHours.schedule.map((day, index) =>
                index === dayIndex ? { ...day, [key]: value } : day
              )
            }
          }));
          break;
        case 'phone':
          setPhoneConfig(prev => ({
            ...prev,
            businessHours: {
              ...prev.businessHours,
              schedule: prev.businessHours.schedule.map((day, index) =>
                index === dayIndex ? { ...day, [key]: value } : day
              )
            }
          }));
          break;
        default:
          console.warn(`Canal desconocido: ${channel}`);
      }
    } catch (error) {
      console.error(`Error actualizando horario para ${channel}:`, error);
    }
  };

  const updateServiceCategory = (channel: string, categoryIndex: number, key: string, value: unknown) => {
    setHasUnsavedChanges(true);
    try {
      switch (channel) {
        case 'web':
          setWebConfig(prev => ({
            ...prev,
            serviceCategoryDurations: prev.serviceCategoryDurations.map((category, index) =>
              index === categoryIndex ? { ...category, [key]: value } : category
            )
          }));
          break;
        case 'whatsapp':
          setWhatsappConfig(prev => ({
            ...prev,
            serviceCategoryDurations: prev.serviceCategoryDurations.map((category, index) =>
              index === categoryIndex ? { ...category, [key]: value } : category
            )
          }));
          break;
        case 'email':
          setEmailConfig(prev => ({
            ...prev,
            serviceCategoryDurations: prev.serviceCategoryDurations.map((category, index) =>
              index === categoryIndex ? { ...category, [key]: value } : category
            )
          }));
          break;
        case 'phone':
          setPhoneConfig(prev => ({
            ...prev,
            serviceCategoryDurations: prev.serviceCategoryDurations.map((category, index) =>
              index === categoryIndex ? { ...category, [key]: value } : category
            )
          }));
          break;
        default:
          console.warn(`Canal desconocido: ${channel}`);
      }
    } catch (error) {
      console.error(`Error actualizando categoría de servicio para ${channel}:`, error);
    }
  };

  const handleConfigChange = (channel: string) => {
    setActiveTab(channel);
  };

  // Función para validar configuración de duración automática
  const validateAutomaticDurationConfig = (config: ChannelConfig) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.appointmentDurationMode === 'automatic') {
      const activeRules = config.automaticDurationRules.filter(rule => rule.active);
      
      if (activeRules.length === 0 && !config.enableAIAnalysis) {
        warnings.push('Modo automático activado pero no hay reglas activas ni análisis de IA habilitado');
      }

      if (config.confidenceThreshold > 0.9) {
        warnings.push('Umbral de confianza muy alto puede resultar en uso frecuente de duración de respaldo');
      }

      if (config.fallbackDuration <= 0) {
        errors.push('La duración de respaldo debe ser mayor a 0');
      }

      if (config.confidenceThreshold < 0 || config.confidenceThreshold > 1) {
        errors.push('El umbral de confianza debe estar entre 0 y 1');
      }

      // Validar reglas
      activeRules.forEach((rule) => {
        if (!rule.keywords.trim()) {
          warnings.push(`Regla "${rule.name}" no tiene palabras clave definidas`);
        }

        if (rule.duration <= 0) {
          errors.push(`Regla "${rule.name}" tiene duración inválida`);
        }
      });

      // Verificar solapamiento de prioridades
      const priorities = activeRules.map(rule => rule.priority);
      const uniquePriorities = new Set(priorities);
      if (priorities.length !== uniquePriorities.size) {
        warnings.push('Algunas reglas tienen la misma prioridad, esto puede causar comportamiento impredecible');
      }
    }

    return { errors, warnings };
  };

  const saveAllSettings = () => {
    // Aquí iría la lógica para guardar en el backend
    setHasUnsavedChanges(false);
    // Mostrar notificación de éxito
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'web': return <Globe className="h-5 w-5" />;
      case 'whatsapp': return <MessageSquare className="h-5 w-5" />;
      case 'email': return <Mail className="h-5 w-5" />;
      case 'phone': return <Phone className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };





  const renderWhatsAppSettings = (config: ChannelConfig) => (
    <div className="space-y-6">
      {/* Estado del canal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <div>
                <CardTitle>WhatsApp Business</CardTitle>
                <CardDescription>
                  Configuración avanzada de reservas por WhatsApp con IA
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => updateChannelConfig('whatsapp', 'enabled', checked)}
              />
              <Badge variant={config.enabled ? "default" : "secondary"}>
                {config.enabled ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {config.enabled && (
          <CardContent className="space-y-6">
            {/* Configuración de timing */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-max-advance">Máximo días de anticipación</Label>
                <Input
                  id="whatsapp-max-advance"
                  type="number"
                  value={config.maxAdvanceBooking}
                  onChange={(e) => updateChannelConfig('whatsapp', 'maxAdvanceBooking', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-min-advance">Mínimo horas de anticipación</Label>
                <Input
                  id="whatsapp-min-advance"
                  type="number"
                  value={config.minAdvanceBooking}
                  onChange={(e) => updateChannelConfig('whatsapp', 'minAdvanceBooking', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-max-slots">Máximo citas por día</Label>
                <Input
                  id="whatsapp-max-slots"
                  type="number"
                  value={config.maxSlotsPerDay}
                  onChange={(e) => updateChannelConfig('whatsapp', 'maxSlotsPerDay', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-cancellation-deadline">Plazo cancelación (horas)</Label>
                <Input
                  id="whatsapp-cancellation-deadline"
                  type="number"
                  value={config.cancellationDeadline}
                  onChange={(e) => updateChannelConfig('whatsapp', 'cancellationDeadline', parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Configuración de permisos */}
            <div className="grid gap-4 md:grid-cols-1">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.allowCancellation}
                  onCheckedChange={(checked) => updateChannelConfig('whatsapp', 'allowCancellation', checked)}
                />
                <Label>Permitir cancelación de citas</Label>
              </div>
            </div>

            {/* Mensajes personalizados */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-custom-message">Mensaje de bienvenida</Label>
                <Textarea
                  id="whatsapp-custom-message"
                  value={config.customMessage}
                  onChange={(e) => updateChannelConfig('whatsapp', 'customMessage', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-confirmation-template">Plantilla de confirmación</Label>
                <Textarea
                  id="whatsapp-confirmation-template"
                  value={config.confirmationTemplate}
                  onChange={(e) => updateChannelConfig('whatsapp', 'confirmationTemplate', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Configuración de Ubicaciones y Pago (adaptado de Web) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Configuración Avanzada del Flujo de Reserva
                </CardTitle>
                <CardDescription>
                  Personaliza el proceso paso a paso de reserva de citas por WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configuración del flujo paso a paso */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.stepByStepFlow}
                      onCheckedChange={(checked) => updateChannelConfig('whatsapp', 'stepByStepFlow', checked)}
                    />
                    <Label>Activar flujo paso a paso guiado</Label>
                  </div>

                  {config.stepByStepFlow && (
                    <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                      {/* Configuración de pasos */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={config.requireLocationSelection}
                            onCheckedChange={(checked) => updateChannelConfig('whatsapp', 'requireLocationSelection', checked)}
                          />
                          <Label>Selección de ubicación</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={config.allowDocumentAttachments}
                            onCheckedChange={(checked) => updateChannelConfig('whatsapp', 'allowDocumentAttachments', checked)}
                          />
                          <Label>Permitir documentos adjuntos</Label>
                        </div>
                      </div>

                      {/* Configuración de ubicaciones */}
                      {config.requireLocationSelection ? (
                        <div className="space-y-3">
                          <Label>Ubicaciones disponibles</Label>
                          <div className="space-y-2">
                            {config.availableLocations.map((location, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                <Input
                                  value={location.name}
                                  onChange={(e) => {
                                    const newLocations = [...config.availableLocations];
                                    newLocations[index].name = e.target.value;
                                    updateChannelConfig('whatsapp', 'availableLocations', newLocations);
                                  }}
                                  placeholder="Nombre de la ubicación"
                                  className="flex-1"
                                />
                                <Input
                                  value={location.address}
                                  onChange={(e) => {
                                    const newLocations = [...config.availableLocations];
                                    newLocations[index].address = e.target.value;
                                    updateChannelConfig('whatsapp', 'availableLocations', newLocations);
                                  }}
                                  placeholder="Dirección"
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newLocations = config.availableLocations.filter((_, i) => i !== index);
                                    updateChannelConfig('whatsapp', 'availableLocations', newLocations);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newLocations = [...config.availableLocations, { name: '', address: '' }];
                                updateChannelConfig('whatsapp', 'availableLocations', newLocations);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Añadir Ubicación
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label htmlFor="whatsapp-single-location">Ubicación única</Label>
                          <Input
                            id="whatsapp-single-location"
                            value={config.singleLocation}
                            onChange={(e) => updateChannelConfig('whatsapp', 'singleLocation', e.target.value)}
                            placeholder="Ej: Oficina Central - Calle Mayor 123, Madrid"
                            className="w-full"
                          />
                          <p className="text-sm text-muted-foreground">
                            Especifica la dirección de tu única ubicación. Los clientes verán esta información al reservar su cita.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Configuración de pagos */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.enablePaymentOptions}
                      onCheckedChange={(checked) => updateChannelConfig('whatsapp', 'enablePaymentOptions', checked)}
                    />
                    <Label>Habilitar opciones de pago</Label>
                  </div>

                  {config.enablePaymentOptions && (
                    <div className="space-y-4 pl-6 border-l-2 border-green-200">
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp-payment-method">Método de pago único</Label>
                        <Select
                          value={config.paymentMethod}
                          onValueChange={(value) => updateChannelConfig('whatsapp', 'paymentMethod', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Efectivo</SelectItem>
                            <SelectItem value="card">Tarjeta</SelectItem>
                            <SelectItem value="bank_transfer">Transferencia bancaria</SelectItem>
                            <SelectItem value="digital_wallet">Wallet digital</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Los clientes utilizarán únicamente este método de pago
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Configuración de depósito/pago</Label>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="whatsapp-payment-timing">Momento de pago</Label>
                            <Select
                              value={config.paymentTiming}
                              onValueChange={(value) => updateChannelConfig('whatsapp', 'paymentTiming', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="advance_payment">Pago anticipado</SelectItem>
                                <SelectItem value="full_payment">Pago completo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="whatsapp-deposit-percentage">Porcentaje de pago anticipado (%)</Label>
                            <Input
                              id="whatsapp-deposit-percentage"
                              type="number"
                              min="0"
                              max="100"
                              value={config.depositPercentage}
                              onChange={(e) => updateChannelConfig('whatsapp', 'depositPercentage', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        )}
      </Card>

      {/* Funcionalidades Avanzadas de WhatsApp */}
      {config.enabled && (
        <>
          {/* Análisis y Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análisis y Estadísticas
              </CardTitle>
              <CardDescription>
                Configuración de análisis de mensajes y estadísticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.whatsappMessageAnalysis}
                    onCheckedChange={(checked) => updateChannelConfig('whatsapp', 'whatsappMessageAnalysis', checked)}
                  />
                  <div>
                    <Label>Análisis de mensajes</Label>
                    <p className="text-sm text-muted-foreground">Analiza patrones en los mensajes recibidos</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.whatsappSentimentAnalysis}
                    onCheckedChange={(checked) => updateChannelConfig('whatsapp', 'whatsappSentimentAnalysis', checked)}
                  />
                  <div>
                    <Label>Análisis de sentimientos</Label>
                    <p className="text-sm text-muted-foreground">Detecta el tono emocional de los mensajes</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.whatsappTimeStatistics}
                    onCheckedChange={(checked) => updateChannelConfig('whatsapp', 'whatsappTimeStatistics', checked)}
                  />
                  <div>
                    <Label>Estadísticas de horarios</Label>
                    <p className="text-sm text-muted-foreground">Analiza los horarios más demandados</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de IA y Respuestas Automáticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Asistente con IA
              </CardTitle>
              <CardDescription>
                Configuración de respuestas automáticas y nivel de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.whatsappAutoResponse}
                    onCheckedChange={(checked) => updateChannelConfig('whatsapp', 'whatsappAutoResponse', checked)}
                  />
                  <Label>Activar respuestas automáticas con IA</Label>
                </div>

                {config.whatsappAutoResponse && (
                  <div className="space-y-4 ml-6">
                    <div className="space-y-2">
                      <Label>Nivel de inteligencia de la IA</Label>
                      <Select
                        value={config.whatsappAIResponseLevel}
                        onValueChange={(value) => updateChannelConfig('whatsapp', 'whatsappAIResponseLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Básico - Solo respuestas predefinidas</SelectItem>
                          <SelectItem value="advanced">Avanzado - IA contextual</SelectItem>
                          <SelectItem value="expert">Experto - IA completa con aprendizaje</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plantillas de Respuesta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Plantillas de Respuesta
              </CardTitle>
              <CardDescription>
                Configuración de respuestas automáticas por palabras clave
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
              {config.whatsappResponseTemplates.map((template, index) => (
                <div key={template.id} className="p-4 border rounded-lg space-y-3 bg-gray-800 border-gray-600">
                  <div className="flex items-center justify-between">
                    <Label>Plantilla {index + 1}</Label>
                    <Switch
                      checked={template.active}
                      onCheckedChange={(checked) => {
                        const updatedTemplates = [...config.whatsappResponseTemplates];
                        updatedTemplates[index].active = checked;
                        updateChannelConfig('whatsapp', 'whatsappResponseTemplates', updatedTemplates);
                      }}
                    />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Palabras clave (separadas por |)</Label>
                      <Input
                        value={template.trigger}
                        onChange={(e) => {
                          const updatedTemplates = [...config.whatsappResponseTemplates];
                          updatedTemplates[index].trigger = e.target.value;
                          updateChannelConfig('whatsapp', 'whatsappResponseTemplates', updatedTemplates);
                        }}
                        placeholder="hola|buenos días|saludos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Respuesta automática</Label>
                      <Textarea
                        value={template.response}
                        onChange={(e) => {
                          const updatedTemplates = [...config.whatsappResponseTemplates];
                          updatedTemplates[index].response = e.target.value;
                          updateChannelConfig('whatsapp', 'whatsappResponseTemplates', updatedTemplates);
                        }}
                        rows={2}
                        placeholder="¡Hola! ¿En qué puedo ayudarte?"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={() => {
                  const newTemplate = {
                    id: Date.now().toString(),
                    trigger: '',
                    response: '',
                    active: true
                  };
                  const updatedTemplates = [...config.whatsappResponseTemplates, newTemplate];
                  updateChannelConfig('whatsapp', 'whatsappResponseTemplates', updatedTemplates);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir nueva plantilla
              </Button>
            </CardContent>
          </Card>

          {/* Horarios de Atención para Agendar Citas - Mejorado */}
          <Card className="shadow-xl border-2 border-green-100 dark:border-green-800 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Clock3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                      ⏰ Horarios de Atención WhatsApp
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Configure cuando los clientes pueden agendar citas por WhatsApp
                    </CardDescription>
                  </div>
                </div>
                <div className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">💬 WhatsApp</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Columna izquierda - Horarios para agendar citas */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.whatsappBusinessHours.enabled}
                      onCheckedChange={(checked) => {
                        const updatedHours = { ...config.whatsappBusinessHours, enabled: checked };
                        updateChannelConfig('whatsapp', 'whatsappBusinessHours', updatedHours);
                      }}
                    />
                    <Label>Activar horarios para agendar citas</Label>
                  </div>

                  {config.whatsappBusinessHours.enabled && (
                    <div className="space-y-3">
                      {config.whatsappBusinessHours.schedule.map((day, index) => (
                        <div key={day.day} className="grid grid-cols-3 gap-2 items-center">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={day.enabled}
                              onCheckedChange={(checked) => {
                                const updatedSchedule = [...config.whatsappBusinessHours.schedule];
                                updatedSchedule[index].enabled = checked;
                                const updatedHours = { ...config.whatsappBusinessHours, schedule: updatedSchedule };
                                
                              // NOTA: Esta sección está comentada temporalmente mientras se actualiza la estructura
                              // const updatedAdvancedSchedule = { ...config.advancedSchedule };
                              // const advancedDayIndex = updatedAdvancedSchedule.weeklySchedule.findIndex(d => d.day === day.day);
                              // if (advancedDayIndex !== -1) {
                              //   updatedAdvancedSchedule.weeklySchedule[advancedDayIndex].enabled = checked;
                              // }
                              
                              // Actualizar ambos
                              updateChannelConfig('whatsapp', 'whatsappBusinessHours', updatedHours);
                              // updateChannelConfig('whatsapp', 'advancedSchedule', updatedAdvancedSchedule);
                              }}
                            />
                            <Label className="text-sm">{day.day}</Label>
                          </div>
                          <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => {
                              const updatedSchedule = [...config.whatsappBusinessHours.schedule];
                              updatedSchedule[index].startTime = e.target.value;
                              const updatedHours = { ...config.whatsappBusinessHours, schedule: updatedSchedule };
                              updateChannelConfig('whatsapp', 'whatsappBusinessHours', updatedHours);
                            }}
                            disabled={!day.enabled}
                          />
                          <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => {
                              const updatedSchedule = [...config.whatsappBusinessHours.schedule];
                              updatedSchedule[index].endTime = e.target.value;
                              const updatedHours = { ...config.whatsappBusinessHours, schedule: updatedSchedule };
                              updateChannelConfig('whatsapp', 'whatsappBusinessHours', updatedHours);
                            }}
                            disabled={!day.enabled}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Columna derecha - Descansos durante la jornada */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4" />
                      <Label>Descansos durante la jornada</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-3 border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-muted-foreground">
                      Esta funcionalidad está siendo actualizada para usar el nuevo sistema de horarios simplificado.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-muted-foreground">
                    La funcionalidad de descansos avanzados será migrada al nuevo sistema de horarios simplificado.
                  </p>
                </div>
              </div>

              {config.whatsappBusinessHours.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-out-of-hours">Mensaje fuera de horario</Label>
                  <Textarea
                    id="whatsapp-out-of-hours"
                    value={config.whatsappOutOfHoursMessage}
                    onChange={(e) => updateChannelConfig('whatsapp', 'whatsappOutOfHoursMessage', e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuración de Confirmación Final y Recordatorios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Confirmación Final y Recordatorios
              </CardTitle>
              <CardDescription>
                Configuración de confirmación automática y recordatorios para WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.autoConfirm}
                      onCheckedChange={(checked) => updateChannelConfig('whatsapp', 'autoConfirm', checked)}
                    />
                    <Label>Confirmación automática</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {config.autoConfirm ? 'Las citas se confirman automáticamente' : 'Requiere confirmación manual'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Método de confirmación final</Label>
                  <Select
                    value={config.finalConfirmationMethod}
                    onValueChange={(value) => updateChannelConfig('whatsapp', 'finalConfirmationMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email automático</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="phone_call">Llamada telefónica</SelectItem>
                      <SelectItem value="multiple">Múltiples canales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.reminderEnabled}
                      onCheckedChange={(checked) => updateChannelConfig('whatsapp', 'reminderEnabled', checked)}
                    />
                    <Label>Activar recordatorios</Label>
                  </div>
                </div>

                {config.reminderEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-reminder-timing">Tiempo antes de la cita</Label>
                      <Input
                        id="whatsapp-reminder-timing"
                        type="number"
                        min="1"
                        max="72"
                        value={config.reminderTiming}
                        onChange={(e) => updateChannelConfig('whatsapp', 'reminderTiming', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-reminder-unit">Unidad de tiempo</Label>
                      <Select
                        value={config.reminderUnit}
                        onValueChange={(value) => updateChannelConfig('whatsapp', 'reminderUnit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Horas</SelectItem>
                          <SelectItem value="days">Días</SelectItem>
                          <SelectItem value="weeks">Semanas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Duración de Citas para WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Duración Inteligente de Citas
              </CardTitle>
              <CardDescription>
                Configuración automática de tiempo basada en el análisis de mensajes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Modo de duración</Label>
                  <Select
                    value={config.appointmentDurationMode}
                    onValueChange={(value) => updateChannelConfig('whatsapp', 'appointmentDurationMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Duración fija para todas las citas</SelectItem>
                      <SelectItem value="automatic">Duración automática según mensajes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp-default-duration">Duración por defecto (minutos)</Label>
                  <Input
                    id="whatsapp-default-duration"
                    type="number"
                    min="15"
                    max="300"
                    value={config.defaultAppointmentDuration}
                    onChange={(e) => updateChannelConfig('whatsapp', 'defaultAppointmentDuration', parseInt(e.target.value))}
                  />
                </div>

                {config.appointmentDurationMode === 'by_service_category' && (
                  <div className="space-y-4 border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <Label>Categorías de servicio</Label>
                    </div>
                    {config.serviceCategoryDurations.map((category, index) => (
                      <div key={category.id} className="p-4 border rounded-lg space-y-3 bg-gray-800 border-gray-600">
                        <div className="flex items-center justify-between">
                          <Label>Categoría {index + 1}</Label>
                          <Switch
                            checked={category.active}
                            onCheckedChange={(checked) => {
                              const updatedCategories = [...config.serviceCategoryDurations];
                              updatedCategories[index].active = checked;
                              updateChannelConfig('whatsapp', 'serviceCategoryDurations', updatedCategories);
                            }}
                          />
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm">Nombre de la categoría</Label>
                            <Input
                              value={category.categoryName}
                              onChange={(e) => {
                                const updatedCategories = [...config.serviceCategoryDurations];
                                updatedCategories[index].categoryName = e.target.value;
                                updateChannelConfig('whatsapp', 'serviceCategoryDurations', updatedCategories);
                              }}
                              placeholder="Ej: Consulta rápida, Consulta completa..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Duración asignada (minutos)</Label>
                            <Input
                              type="number"
                              min="15"
                              max="300"
                              value={category.duration}
                              onChange={(e) => {
                                const updatedCategories = [...config.serviceCategoryDurations];
                                updatedCategories[index].duration = parseInt(e.target.value);
                                updateChannelConfig('whatsapp', 'serviceCategoryDurations', updatedCategories);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newCategory = {
                          id: Date.now().toString(),
                          categoryName: '',
                          duration: 30,
                          active: true
                        };
                        const updatedCategories = [...config.serviceCategoryDurations, newCategory];
                        updateChannelConfig('whatsapp', 'serviceCategoryDurations', updatedCategories);
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir nueva categoría
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderEmailSettings = (config: ChannelConfig) => (
    <div className="space-y-6">
      {/* Estado del canal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle>Email Business</CardTitle>
                <CardDescription>
                  Configuración avanzada de reservas por correo electrónico
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => updateChannelConfig('email', 'enabled', checked)}
              />
              <Badge variant={config.enabled ? "default" : "secondary"}>
                {config.enabled ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {config.enabled && (
          <CardContent className="space-y-6">
            {/* Configuración de timing */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email-max-advance">Máximo días de anticipación</Label>
                <Input
                  id="email-max-advance"
                  type="number"
                  value={config.maxAdvanceBooking}
                  onChange={(e) => updateChannelConfig('email', 'maxAdvanceBooking', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-min-advance">Mínimo horas de anticipación</Label>
                <Input
                  id="email-min-advance"
                  type="number"
                  value={config.minAdvanceBooking}
                  onChange={(e) => updateChannelConfig('email', 'minAdvanceBooking', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-max-slots">Máximo citas por día</Label>
                <Input
                  id="email-max-slots"
                  type="number"
                  value={config.maxSlotsPerDay}
                  onChange={(e) => updateChannelConfig('email', 'maxSlotsPerDay', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-cancellation-deadline">Plazo cancelación (horas)</Label>
                <Input
                  id="email-cancellation-deadline"
                  type="number"
                  value={config.cancellationDeadline}
                  onChange={(e) => updateChannelConfig('email', 'cancellationDeadline', parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Configuración de permisos */}
            <div className="grid gap-4 md:grid-cols-1">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.allowCancellation}
                  onCheckedChange={(checked) => updateChannelConfig('email', 'allowCancellation', checked)}
                />
                <Label>Permitir cancelación de citas</Label>
              </div>
            </div>

            {/* Mensajes personalizados */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-custom-message">Mensaje de bienvenida automático</Label>
                <Textarea
                  id="email-custom-message"
                  value={config.customMessage}
                  onChange={(e) => updateChannelConfig('email', 'customMessage', e.target.value)}
                  rows={5}
                  placeholder="Personaliza el mensaje de respuesta automática inicial..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-confirmation-template">Plantilla de confirmación por email</Label>
                <Textarea
                  id="email-confirmation-template"
                  value={config.confirmationTemplate}
                  onChange={(e) => updateChannelConfig('email', 'confirmationTemplate', e.target.value)}
                  rows={8}
                  placeholder="Plantilla formal de confirmación para envío por email..."
                />
                <p className="text-sm text-muted-foreground">
                  Variables disponibles: {'{date}'}, {'{time}'}, {'{service}'}, {'{booking_id}'}
                </p>
              </div>
            </div>

            {/* Configuración de Ubicaciones y Adjuntos */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-orange-500" />
                  Gestión de Ubicaciones y Documentos
                </CardTitle>
                <CardDescription>
                  Configuración específica para el canal de email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configuración del flujo paso a paso */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.stepByStepFlow}
                      onCheckedChange={(checked) => updateChannelConfig('email', 'stepByStepFlow', checked)}
                    />
                    <Label>Activar proceso estructurado por email</Label>
                  </div>

                  {config.stepByStepFlow && (
                    <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                      {/* Configuración de documentos adjuntos */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.allowDocumentAttachments}
                          onCheckedChange={(checked) => updateChannelConfig('email', 'allowDocumentAttachments', checked)}
                        />
                        <Label>Permitir documentos adjuntos</Label>
                      </div>

                      {/* Configuración de ubicaciones para email */}
                      <div className="space-y-3">
                        <Label htmlFor="email-single-location">Ubicación e información de contacto</Label>
                        <Textarea
                          id="email-single-location"
                          value={config.singleLocation}
                          onChange={(e) => updateChannelConfig('email', 'singleLocation', e.target.value)}
                          placeholder="Ej: Oficina Central - Calle Mayor 123, Madrid&#10;Teléfono: 912-345-678&#10;Metro: Sol (Líneas 1, 2, 3)&#10;Parking disponible en edificio"
                          rows={4}
                          className="w-full"
                        />
                        <p className="text-sm text-muted-foreground">
                          Esta información se incluirá automáticamente en todos los emails de confirmación. Puedes incluir teléfonos, instrucciones de acceso, parking, etc.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Configuración de pagos para email */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.enablePaymentOptions}
                      onCheckedChange={(checked) => updateChannelConfig('email', 'enablePaymentOptions', checked)}
                    />
                    <Label>Incluir información de pago en emails</Label>
                  </div>

                  {config.enablePaymentOptions && (
                    <div className="space-y-4 pl-6 border-l-2 border-green-200">
                      <div className="space-y-2">
                        <Label htmlFor="email-payment-method">Método de pago preferido</Label>
                        <Select
                          value={config.paymentMethod}
                          onValueChange={(value) => updateChannelConfig('email', 'paymentMethod', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank_transfer">Transferencia bancaria</SelectItem>
                            <SelectItem value="card">Tarjeta (enlace de pago)</SelectItem>
                            <SelectItem value="cash">Efectivo (en persona)</SelectItem>
                            <SelectItem value="digital_wallet">Wallet digital</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Esta información se incluirá automáticamente en los emails de confirmación
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Configuración de depósito/pago</Label>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="email-payment-timing">Momento de pago</Label>
                            <Select
                              value={config.paymentTiming}
                              onValueChange={(value) => updateChannelConfig('email', 'paymentTiming', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="advance_payment">Pago anticipado</SelectItem>
                                <SelectItem value="full_payment">Pago completo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email-deposit-percentage">Porcentaje de pago anticipado (%)</Label>
                            <Input
                              id="email-deposit-percentage"
                              type="number"
                              min="0"
                              max="100"
                              value={config.depositPercentage}
                              onChange={(e) => updateChannelConfig('email', 'depositPercentage', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        )}
      </Card>

      {/* Configuración de Horarios de Atención para Agendar Citas (para Email) - Mejorado */}
      {config.enabled && (
        <Card className="mt-6 shadow-xl border-2 border-purple-100 dark:border-purple-800 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600"></div>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Clock3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    📧 Horarios de Procesamiento Email
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Configure cuando se procesan y responden emails automáticamente
                  </CardDescription>
                </div>
              </div>
              <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">✉️ Email IA</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Columna izquierda - Horarios para procesar emails */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.businessHours.enabled}
                    onCheckedChange={(checked) => {
                      const updatedHours = { ...config.businessHours, enabled: checked };
                      updateChannelConfig('email', 'businessHours', updatedHours);
                    }}
                  />
                  <Label>Activar horarios de procesamiento</Label>
                </div>

                {config.businessHours.enabled && (
                  <div className="space-y-3">
                    {config.businessHours.schedule.map((day, index) => (
                      <div key={day.day} className="grid grid-cols-3 gap-2 items-center">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={day.enabled}
                            onCheckedChange={(checked) => {
                              const updatedSchedule = [...config.businessHours.schedule];
                              updatedSchedule[index].enabled = checked;
                              const updatedHours = { ...config.businessHours, schedule: updatedSchedule };
                              
                              // NOTA: Sincronización con advancedSchedule temporalmente comentada
                              // const updatedAdvancedSchedule = { ...config.advancedSchedule };
                              // const advancedDayIndex = updatedAdvancedSchedule.weeklySchedule.findIndex(d => d.day === day.day);
                              // if (advancedDayIndex !== -1) {
                              //   updatedAdvancedSchedule.weeklySchedule[advancedDayIndex].enabled = checked;
                              // }
                              
                              // Actualizar horarios de negocio
                              updateChannelConfig('email', 'businessHours', updatedHours);
                              // updateChannelConfig('email', 'advancedSchedule', updatedAdvancedSchedule);
                            }}
                          />
                          <Label className="text-sm">{day.day}</Label>
                        </div>
                        <Input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => {
                            const updatedSchedule = [...config.businessHours.schedule];
                            updatedSchedule[index].startTime = e.target.value;
                            const updatedHours = { ...config.businessHours, schedule: updatedSchedule };
                            updateChannelConfig('email', 'businessHours', updatedHours);
                          }}
                          disabled={!day.enabled}
                        />
                        <Input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => {
                            const updatedSchedule = [...config.businessHours.schedule];
                            updatedSchedule[index].endTime = e.target.value;
                            const updatedHours = { ...config.businessHours, schedule: updatedSchedule };
                            updateChannelConfig('email', 'businessHours', updatedHours);
                          }}
                          disabled={!day.enabled}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* NOTA: Períodos de no procesamiento temporalmente comentados
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.advancedSchedule.enabled}
                    onCheckedChange={(checked) => {
                      const updatedSchedule = { ...config.advancedSchedule, enabled: checked };
                      updateChannelConfig('email', 'advancedSchedule', updatedSchedule);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4" />
                    <Label>Períodos de no procesamiento</Label>
                  </div>
                </div>

                {config.advancedSchedule.enabled && (
                  <div className="space-y-3 border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-muted-foreground">
                      Define períodos donde no se procesan emails de citas (descansos, reuniones, etc.)
                    </p>
                    
                    {config.advancedSchedule.weeklySchedule.map((daySchedule, dayIndex) => {
                      // Buscar el día correspondiente en businessHours para verificar si está habilitado
                      const businessDay = config.businessHours.schedule.find(d => d.day === daySchedule.day);
                      const isDayEnabled = businessDay?.enabled || false;
                      
                      return isDayEnabled && (
                        <div key={daySchedule.day} className="p-3 border rounded-lg space-y-2 bg-gray-800 border-gray-600">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">{daySchedule.day}</Label>
                            <span className="text-xs text-muted-foreground">
                              {daySchedule.breaks.length} período(s)
                            </span>
                          </div>

                          <div className="space-y-2">
                            {daySchedule.breaks.map((breakTime, breakIndex) => (
                              <div key={breakTime.id} className="grid grid-cols-4 gap-1 items-center">
                                <Input
                                  placeholder="Descripción"
                                  value={breakTime.name}
                                  className="text-xs"
                                  onChange={(e) => {
                                    const updatedWeeklySchedule = [...config.advancedSchedule.weeklySchedule];
                                    updatedWeeklySchedule[dayIndex].breaks[breakIndex].name = e.target.value;
                                    const updatedSchedule = { ...config.advancedSchedule, weeklySchedule: updatedWeeklySchedule };
                                    updateChannelConfig('email', 'advancedSchedule', updatedSchedule);
                                  }}
                                />
                                <Input
                                  type="time"
                                  value={breakTime.startTime}
                                  className="text-xs"
                                  onChange={(e) => {
                                    const updatedWeeklySchedule = [...config.advancedSchedule.weeklySchedule];
                                    updatedWeeklySchedule[dayIndex].breaks[breakIndex].startTime = e.target.value;
                                    const updatedSchedule = { ...config.advancedSchedule, weeklySchedule: updatedWeeklySchedule };
                                    updateChannelConfig('email', 'advancedSchedule', updatedSchedule);
                                  }}
                                />
                                <Input
                                  type="time"
                                  value={breakTime.endTime}
                                  className="text-xs"
                                  onChange={(e) => {
                                    const updatedWeeklySchedule = [...config.advancedSchedule.weeklySchedule];
                                    updatedWeeklySchedule[dayIndex].breaks[breakIndex].endTime = e.target.value;
                                    const updatedSchedule = { ...config.advancedSchedule, weeklySchedule: updatedWeeklySchedule };
                                    updateChannelConfig('email', 'advancedSchedule', updatedSchedule);
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    const updatedWeeklySchedule = [...config.advancedSchedule.weeklySchedule];
                                    updatedWeeklySchedule[dayIndex].breaks = updatedWeeklySchedule[dayIndex].breaks.filter((_, i) => i !== breakIndex);
                                    const updatedSchedule = { ...config.advancedSchedule, weeklySchedule: updatedWeeklySchedule };
                                    updateChannelConfig('email', 'advancedSchedule', updatedSchedule);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedWeeklySchedule = [...config.advancedSchedule.weeklySchedule];
                                const newBreak = {
                                  id: Date.now().toString(),
                                  name: 'Reunión',
                                  startTime: '12:00',
                                  endTime: '13:00'
                                };
                                updatedWeeklySchedule[dayIndex].breaks.push(newBreak);
                                const updatedSchedule = { ...config.advancedSchedule, weeklySchedule: updatedWeeklySchedule };
                                updateChannelConfig('email', 'advancedSchedule', updatedSchedule);
                              }}
                              className="w-full h-6 text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Añadir período
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              */}
            </div>

            {config.businessHours.enabled && (
              <div className="space-y-2">
                <Label htmlFor="email-out-of-hours">Respuesta automática fuera de horario</Label>
                <Textarea
                  id="email-out-of-hours"
                  value={config.outOfHoursMessage}
                  onChange={(e) => updateChannelConfig('email', 'outOfHoursMessage', e.target.value)}
                  rows={6}
                  placeholder="Mensaje automático que se enviará cuando recibas emails fuera del horario de procesamiento..."
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configuración de Confirmación Final y Recordatorios */}
      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Confirmación y Recordatorios por Email
            </CardTitle>
            <CardDescription>
              Configuración específica para confirmaciones y recordatorios por correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.autoConfirm}
                    onCheckedChange={(checked) => updateChannelConfig('email', 'autoConfirm', checked)}
                  />
                  <Label>Confirmación automática</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {config.autoConfirm ? 'Las citas se confirman automáticamente por email' : 'Requiere confirmación manual del equipo'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Método de confirmación final</Label>
                <Select
                  value={config.finalConfirmationMethod}
                  onValueChange={(value) => updateChannelConfig('email', 'finalConfirmationMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email automático</SelectItem>
                    <SelectItem value="phone_call">Llamada telefónica</SelectItem>
                    <SelectItem value="sms">SMS adicional</SelectItem>
                    <SelectItem value="multiple">Múltiples canales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Configuración de recordatorios */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.reminderEnabled}
                  onCheckedChange={(checked) => updateChannelConfig('email', 'reminderEnabled', checked)}
                />
                <Label>Enviar recordatorios por email</Label>
              </div>

              {config.reminderEnabled && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email-reminder-timing">Tiempo antes de la cita</Label>
                    <Input
                      id="email-reminder-timing"
                      type="number"
                      value={config.reminderTiming}
                      onChange={(e) => updateChannelConfig('email', 'reminderTiming', parseInt(e.target.value))}
                      placeholder="48"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-reminder-unit">Unidad de tiempo</Label>
                    <Select
                      value={config.reminderUnit}
                      onValueChange={(value) => updateChannelConfig('email', 'reminderUnit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">Horas</SelectItem>
                        <SelectItem value="days">Días</SelectItem>
                        <SelectItem value="weeks">Semanas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuración de Duración de Citas específica para Email */}
      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Duración Automática por Contenido del Email
            </CardTitle>
            <CardDescription>
              El sistema analizará el contenido del email para determinar la duración apropiada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Modo de duración</Label>
                <Select
                  value={config.appointmentDurationMode}
                  onValueChange={(value) => updateChannelConfig('email', 'appointmentDurationMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Duración fija</SelectItem>
                    <SelectItem value="by_service_category">Por categoría de servicio</SelectItem>
                    <SelectItem value="automatic">Duración automática por contenido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.appointmentDurationMode === 'fixed' && (
                <div className="space-y-2">
                  <Label htmlFor="email-default-duration">Duración por defecto (minutos)</Label>
                  <Input
                    id="email-default-duration"
                    type="number"
                    value={config.defaultAppointmentDuration}
                    onChange={(e) => updateChannelConfig('email', 'defaultAppointmentDuration', parseInt(e.target.value))}
                  />
                </div>
              )}

              {config.appointmentDurationMode === 'automatic' && (
                <div className="space-y-6">
                  {/* Validación de configuración */}
                  {(() => {
                    const validation = validateAutomaticDurationConfig(config);
                    const hasIssues = validation.errors.length > 0 || validation.warnings.length > 0;
                    
                    if (!hasIssues) return null;
                    
                    return (
                      <div className="space-y-3">
                        {validation.errors.length > 0 && (
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-start gap-3">
                              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                  Errores de configuración
                                </p>
                                <ul className="text-sm text-red-700 dark:text-red-300 mt-1 list-disc list-inside">
                                  {validation.errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {validation.warnings.length > 0 && (
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                  Advertencias de configuración
                                </p>
                                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 list-disc list-inside">
                                  {validation.warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Sistema de Análisis Inteligente Activado
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          La IA analizará el contenido de cada email para determinar automáticamente la duración más apropiada para la cita.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Configuración de IA */}
                  <Card className="border border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        Configuración de IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.enableAIAnalysis}
                          onCheckedChange={(checked) => updateChannelConfig('email', 'enableAIAnalysis', checked)}
                        />
                        <Label>Activar análisis inteligente con IA</Label>
                      </div>

                      {config.enableAIAnalysis && (
                        <div className="space-y-4 pl-6 border-l-2 border-blue-200 dark:border-blue-800">
                          <div className="space-y-2">
                            <Label htmlFor="ai-analysis-prompt">Prompt para la IA</Label>
                            <Textarea
                              id="ai-analysis-prompt"
                              value={config.aiAnalysisPrompt}
                              onChange={(e) => updateChannelConfig('email', 'aiAnalysisPrompt', e.target.value)}
                              rows={3}
                              placeholder="Instrucciones para la IA sobre cómo analizar los emails..."
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="confidence-threshold">Umbral de confianza</Label>
                              <Input
                                id="confidence-threshold"
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={config.confidenceThreshold}
                                onChange={(e) => updateChannelConfig('email', 'confidenceThreshold', parseFloat(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Nivel mínimo de confianza para aplicar la duración sugerida (0-1)
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="fallback-duration">Duración de respaldo (min)</Label>
                              <Input
                                id="fallback-duration"
                                type="number"
                                value={config.fallbackDuration}
                                onChange={(e) => updateChannelConfig('email', 'fallbackDuration', parseInt(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Duración usada cuando la IA no puede determinar una con suficiente confianza
                              </p>
                            </div>
                          </div>

                          {/* Configuración de Feedback de IA */}
                          <div className="space-y-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={config.aiFeedbackConfig.enableFeedback}
                                  onCheckedChange={(checked) => 
                                    updateChannelConfig('email', 'aiFeedbackConfig', {
                                      ...config.aiFeedbackConfig,
                                      enableFeedback: checked
                                    })
                                  }
                                />
                                <Label>Activar sistema de feedback inteligente</Label>
                              </div>
                            </div>

                            {config.aiFeedbackConfig.enableFeedback && (
                              <div className="space-y-4 pl-6">
                                <InfoCard
                                  id="feedback-how-it-works"
                                  title="¿Cómo funciona el feedback?"
                                  description="El sistema aprende de tus correcciones para mejorar futuras predicciones. Puedes calificar cada análisis y la IA ajustará sus algoritmos automáticamente."
                                  type="feature"
                                  onDismiss={dismissCard}
                                />

                                <div className="space-y-2">
                                  <Label htmlFor="feedback-prompt">Prompt para feedback</Label>
                                  <Textarea
                                    id="feedback-prompt"
                                    value={config.aiFeedbackConfig.feedbackPrompt}
                                    onChange={(e) => 
                                      updateChannelConfig('email', 'aiFeedbackConfig', {
                                        ...config.aiFeedbackConfig,
                                        feedbackPrompt: e.target.value
                                      })
                                    }
                                    rows={2}
                                    placeholder="Instrucciones para generar feedback sobre el análisis..."
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Categorías de feedback</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {config.aiFeedbackConfig.feedbackCategories.map((category, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {category}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={config.aiFeedbackConfig.autoLearnFromFeedback}
                                    onCheckedChange={(checked) => 
                                      updateChannelConfig('email', 'aiFeedbackConfig', {
                                        ...config.aiFeedbackConfig,
                                        autoLearnFromFeedback: checked
                                      })
                                    }
                                  />
                                  <Label>Aprendizaje automático desde feedback</Label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Reglas de duración automática */}
                  <Card className="border border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Reglas de Duración por Palabras Clave
                      </CardTitle>
                      <CardDescription>
                        Define reglas basadas en palabras clave para clasificar automáticamente la duración de las citas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {config.automaticDurationRules
                          .sort((a, b) => a.priority - b.priority)
                          .map((rule, index) => (
                          <div key={rule.id} className="p-4 border rounded-lg space-y-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-xs">
                                  Prioridad {rule.priority}
                                </Badge>
                                <Label className="font-medium">{rule.name}</Label>
                                <Switch
                                  checked={rule.active}
                                  onCheckedChange={(checked) => {
                                    const updatedRules = [...config.automaticDurationRules];
                                    updatedRules[index] = { ...rule, active: checked };
                                    updateChannelConfig('email', 'automaticDurationRules', updatedRules);
                                  }}
                                />
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedRules = config.automaticDurationRules.filter((_, i) => i !== index);
                                  updateChannelConfig('email', 'automaticDurationRules', updatedRules);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label className="text-sm">Nombre de la regla</Label>
                                <Input
                                  value={rule.name}
                                  onChange={(e) => {
                                    const updatedRules = [...config.automaticDurationRules];
                                    updatedRules[index] = { ...rule, name: e.target.value };
                                    updateChannelConfig('email', 'automaticDurationRules', updatedRules);
                                  }}
                                  placeholder="Ej: Consulta rápida"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm">Duración (minutos)</Label>
                                <Input
                                  type="number"
                                  value={rule.duration}
                                  onChange={(e) => {
                                    const updatedRules = [...config.automaticDurationRules];
                                    updatedRules[index] = { ...rule, duration: parseInt(e.target.value) };
                                    updateChannelConfig('email', 'automaticDurationRules', updatedRules);
                                  }}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm">Prioridad</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={rule.priority}
                                  onChange={(e) => {
                                    const updatedRules = [...config.automaticDurationRules];
                                    updatedRules[index] = { ...rule, priority: parseInt(e.target.value) };
                                    updateChannelConfig('email', 'automaticDurationRules', updatedRules);
                                  }}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Palabras clave (separadas por |)</Label>
                              <Input
                                value={rule.keywords}
                                onChange={(e) => {
                                  const updatedRules = [...config.automaticDurationRules];
                                  updatedRules[index] = { ...rule, keywords: e.target.value };
                                  updateChannelConfig('email', 'automaticDurationRules', updatedRules);
                                }}
                                placeholder="consulta|revisión|checkup"
                              />
                            </div>

                            {rule.description && (
                              <div className="space-y-2">
                                <Label className="text-sm">Descripción</Label>
                                <Textarea
                                  value={rule.description}
                                  onChange={(e) => {
                                    const updatedRules = [...config.automaticDurationRules];
                                    updatedRules[index] = { ...rule, description: e.target.value };
                                    updateChannelConfig('email', 'automaticDurationRules', updatedRules);
                                  }}
                                  rows={2}
                                  placeholder="Descripción de cuándo se aplica esta regla..."
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newRule: AutomaticDurationRule = {
                              id: Date.now().toString(),
                              name: 'Nueva regla',
                              keywords: '',
                              duration: 60,
                              priority: config.automaticDurationRules.length + 1,
                              active: true,
                              description: '',
                              category: 'general'
                            };
                            const updatedRules = [...config.automaticDurationRules, newRule];
                            updateChannelConfig('email', 'automaticDurationRules', updatedRules);
                          }}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir Nueva Regla
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vista previa del funcionamiento */}
                  <Card className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-green-900 dark:text-green-100">
                        <BarChart3 className="h-4 w-4" />
                        Cómo Funciona el Sistema
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-green-800 dark:text-green-200">
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Cuando llega un email, el sistema analiza el asunto y contenido</li>
                        <li>Busca coincidencias con las palabras clave de las reglas activas</li>
                        <li>Si hay múltiples coincidencias, aplica la regla con mayor prioridad</li>
                        <li>Si está activada la IA, también analiza el contexto general</li>
                        <li>Si la confianza es alta, usa la duración sugerida; si no, usa la de respaldo</li>
                      </ol>
                    </CardContent>
                  </Card>

                  {/* Componente de prueba */}
                  <EmailDurationTest
                    rules={config.automaticDurationRules.filter(rule => rule.active)}
                    customPrompt={config.aiAnalysisPrompt}
                    confidenceThreshold={config.confidenceThreshold}
                    fallbackDuration={config.fallbackDuration}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPhoneSettings = (config: ChannelConfig) => (
    <div className="space-y-6">
      {/* Estado del canal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle>Llamadas Telefónicas</CardTitle>
                <CardDescription>
                  Configuración para reservas por teléfono
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => updateChannelConfig('phone', 'enabled', checked)}
              />
              <Badge variant={config.enabled ? "default" : "secondary"}>
                {config.enabled ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {config.enabled && (
          <CardContent className="space-y-6">
            {/* Configuración de timing */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone-max-advance">Máximo días de anticipación</Label>
                <Input
                  id="phone-max-advance"
                  type="number"
                  value={config.maxAdvanceBooking}
                  onChange={(e) => updateChannelConfig('phone', 'maxAdvanceBooking', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-min-advance">Mínimo horas de anticipación</Label>
                <Input
                  id="phone-min-advance"
                  type="number"
                  value={config.minAdvanceBooking}
                  onChange={(e) => updateChannelConfig('phone', 'minAdvanceBooking', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-max-slots">Máximo citas por día</Label>
                <Input
                  id="phone-max-slots"
                  type="number"
                  value={config.maxSlotsPerDay}
                  onChange={(e) => updateChannelConfig('phone', 'maxSlotsPerDay', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-cancellation-deadline">Plazo cancelación (horas)</Label>
                <Input
                  id="phone-cancellation-deadline"
                  type="number"
                  value={config.cancellationDeadline}
                  onChange={(e) => updateChannelConfig('phone', 'cancellationDeadline', parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Configuración de permisos */}
            <div className="grid gap-4 md:grid-cols-1">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.allowCancellation}
                  onCheckedChange={(checked) => updateChannelConfig('phone', 'allowCancellation', checked)}
                />
                <Label>Permitir cancelación de citas</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.autoConfirm}
                  onCheckedChange={(checked) => updateChannelConfig('phone', 'autoConfirm', checked)}
                />
                <Label>Confirmación automática (durante la llamada)</Label>
              </div>
            </div>

            {/* Mensajes personalizados */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone-custom-message">Script de bienvenida telefónica</Label>
                <Textarea
                  id="phone-custom-message"
                  value={config.customMessage}
                  onChange={(e) => updateChannelConfig('phone', 'customMessage', e.target.value)}
                  rows={3}
                  placeholder="Script para el saludo inicial en llamadas..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-confirmation-template">Plantilla de confirmación verbal</Label>
                <Textarea
                  id="phone-confirmation-template"
                  value={config.confirmationTemplate}
                  onChange={(e) => updateChannelConfig('phone', 'confirmationTemplate', e.target.value)}
                  rows={4}
                  placeholder="Script para confirmar la cita durante la llamada..."
                />
                <p className="text-sm text-muted-foreground">
                  Variables disponibles: {'{date}'}, {'{time}'}, {'{service}'}, {'{booking_id}'}
                </p>
              </div>
            </div>

            {/* Configuración de Horarios Telefónicos - Mejorado */}
            <Card className="mt-6 shadow-xl border-2 border-orange-100 dark:border-orange-800 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500"></div>
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                      <Clock3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-700 to-red-700 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                        📞 Horarios de Atención Telefónica
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        Configure la disponibilidad para recibir y gestionar llamadas
                      </CardDescription>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">📞 Llamadas</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.businessHoursOnly}
                    onCheckedChange={(checked) => updateChannelConfig('phone', 'businessHoursOnly', checked)}
                  />
                  <Label>Solo en horario de oficina</Label>
                </div>

                {config.businessHoursOnly && config.businessHours && (
                  <div className="space-y-3">
                    <Label>Horarios de atención telefónica</Label>
                    {config.businessHours.schedule.map((day, index) => (
                      <div key={day.day} className="flex items-center gap-4">
                        <div className="w-20 text-sm">{day.day}</div>
                        <Switch
                          checked={day.enabled}
                          onCheckedChange={(checked) => updateDaySchedule('phone', index, 'enabled', checked)}
                        />
                        {day.enabled && (
                          <>
                            <Input
                              type="time"
                              value={day.startTime}
                              onChange={(e) => updateDaySchedule('phone', index, 'startTime', e.target.value)}
                              className="w-32"
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input
                              type="time"
                              value={day.endTime}
                              onChange={(e) => updateDaySchedule('phone', index, 'endTime', e.target.value)}
                              className="w-32"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone-out-of-hours">Mensaje fuera de horario</Label>
                  <Textarea
                    id="phone-out-of-hours"
                    value={config.outOfHoursMessage}
                    onChange={(e) => updateChannelConfig('phone', 'outOfHoursMessage', e.target.value)}
                    rows={3}
                    placeholder="Mensaje para el contestador automático..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Recordatorios */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-purple-500" />
                  Recordatorios y Confirmaciones
                </CardTitle>
                <CardDescription>
                  Sistema de recordatorios para citas telefónicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.reminderEnabled}
                    onCheckedChange={(checked) => updateChannelConfig('phone', 'reminderEnabled', checked)}
                  />
                  <Label>Activar recordatorios</Label>
                </div>

                {config.reminderEnabled && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone-reminder-timing">Tiempo antes de la cita</Label>
                      <Input
                        id="phone-reminder-timing"
                        type="number"
                        value={config.reminderTiming}
                        onChange={(e) => updateChannelConfig('phone', 'reminderTiming', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone-reminder-unit">Unidad de tiempo</Label>
                      <Select
                        value={config.reminderUnit}
                        onValueChange={(value) => updateChannelConfig('phone', 'reminderUnit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Horas</SelectItem>
                          <SelectItem value="days">Días</SelectItem>
                          <SelectItem value="weeks">Semanas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone-confirmation-method">Método de confirmación final</Label>
                  <Select
                    value={config.finalConfirmationMethod}
                    onValueChange={(value) => updateChannelConfig('phone', 'finalConfirmationMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone_call">Llamada telefónica</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="multiple">Múltiples canales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Duración de Citas */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-orange-500" />
                  Duración de Citas Telefónicas
                </CardTitle>
                <CardDescription>
                  Gestión de tiempos para citas programadas por teléfono
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-duration-mode">Modo de duración</Label>
                  <Select
                    value={config.appointmentDurationMode}
                    onValueChange={(value) => updateChannelConfig('phone', 'appointmentDurationMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Duración fija</SelectItem>
                      <SelectItem value="by_service_category">Por categoría de servicio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-default-duration">Duración por defecto (minutos)</Label>
                  <Input
                    id="phone-default-duration"
                    type="number"
                    value={config.defaultAppointmentDuration}
                    onChange={(e) => updateChannelConfig('phone', 'defaultAppointmentDuration', parseInt(e.target.value))}
                  />
                </div>

                {config.appointmentDurationMode === 'by_service_category' && (
                  <div className="space-y-4">
                    <Label>Duraciones por categoría</Label>
                    {config.serviceCategoryDurations.map((category, index) => (
                      <div key={category.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Switch
                          checked={category.active}
                          onCheckedChange={(checked) => updateServiceCategory('phone', index, 'active', checked)}
                        />
                        <div className="flex-1">
                          <Input
                            value={category.categoryName}
                            onChange={(e) => updateServiceCategory('phone', index, 'categoryName', e.target.value)}
                            placeholder="Nombre de la categoría"
                          />
                        </div>
                        <div className="w-32">
                          <Input
                            type="number"
                            value={category.duration}
                            onChange={(e) => updateServiceCategory('phone', index, 'duration', parseInt(e.target.value))}
                            placeholder="Minutos"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        )}
      </Card>
    </div>
  );

  const renderChannelSettings = (channel: string, config: ChannelConfig) => (
    <div className="space-y-6">
      {/* Estado del canal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getChannelIcon(channel)}
              <div>
                <CardTitle className="capitalize">{channel === 'web' ? 'Web' : channel === 'whatsapp' ? 'WhatsApp' : channel}</CardTitle>
                <CardDescription>
                  Configuración de reservas por {channel === 'web' ? 'página web' : channel === 'whatsapp' ? 'WhatsApp' : channel}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={config.enabled ? "default" : "secondary"}>
                {config.enabled ? 'Activo' : 'Inactivo'}
              </Badge>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => updateChannelConfig(channel, 'enabled', checked)}
              />
            </div>
          </div>
        </CardHeader>

        {config.enabled && (
          <CardContent className="space-y-6">
            {/* Configuración de timing */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${channel}-max-advance`}>Máximo días de anticipación</Label>
                <Input
                  id={`${channel}-max-advance`}
                  type="number"
                  value={config.maxAdvanceBooking}
                  onChange={(e) => updateChannelConfig(channel, 'maxAdvanceBooking', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${channel}-min-advance`}>Mínimo horas de anticipación</Label>
                <Input
                  id={`${channel}-min-advance`}
                  type="number"
                  value={config.minAdvanceBooking}
                  onChange={(e) => updateChannelConfig(channel, 'minAdvanceBooking', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${channel}-max-slots`}>Máximo citas por día</Label>
                <Input
                  id={`${channel}-max-slots`}
                  type="number"
                  value={config.maxSlotsPerDay}
                  onChange={(e) => updateChannelConfig(channel, 'maxSlotsPerDay', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${channel}-cancellation`}>Plazo de cancelación (horas)</Label>
                <Input
                  id={`${channel}-cancellation`}
                  type="number"
                  value={config.cancellationDeadline}
                  onChange={(e) => updateChannelConfig(channel, 'cancellationDeadline', parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Configuración de permisos */}
            <div className="grid gap-4 md:grid-cols-1">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.allowCancellation}
                  onCheckedChange={(checked) => updateChannelConfig(channel, 'allowCancellation', checked)}
                />
                <Label>Permitir cancelación de citas</Label>
              </div>
            </div>

            {/* Mensajes personalizados */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${channel}-custom-message`}>Mensaje de bienvenida</Label>
                <Textarea
                  id={`${channel}-custom-message`}
                  value={config.customMessage}
                  onChange={(e) => updateChannelConfig(channel, 'customMessage', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${channel}-confirmation-template`}>Plantilla de confirmación</Label>
                <Textarea
                  id={`${channel}-confirmation-template`}
                  value={config.confirmationTemplate}
                  onChange={(e) => updateChannelConfig(channel, 'confirmationTemplate', e.target.value)}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Variables disponibles: {'{date}'}, {'{time}'}, {'{service}'}, {'{booking_id}'}
                </p>
              </div>
            </div>

            {/* Configuración Avanzada de Flujo de Reserva */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Configuración Avanzada del Flujo de Reserva
                </CardTitle>
                <CardDescription>
                  Personaliza el proceso paso a paso de reserva de citas inspirado en sistemas profesionales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configuración del flujo paso a paso */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.stepByStepFlow}
                      onCheckedChange={(checked) => updateChannelConfig(channel, 'stepByStepFlow', checked)}
                    />
                    <Label>Activar flujo paso a paso guiado</Label>
                  </div>

                  {config.stepByStepFlow && (
                    <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                      {/* Configuración de pasos */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={config.requireLocationSelection}
                            onCheckedChange={(checked) => updateChannelConfig(channel, 'requireLocationSelection', checked)}
                          />
                          <Label>Selección de ubicación</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={config.allowDocumentAttachments}
                            onCheckedChange={(checked) => updateChannelConfig(channel, 'allowDocumentAttachments', checked)}
                          />
                          <Label>Permitir documentos adjuntos</Label>
                        </div>
                      </div>

                      {/* Configuración de ubicaciones */}
                      {config.requireLocationSelection ? (
                        <div className="space-y-3">
                          <Label>Ubicaciones disponibles</Label>
                          <div className="space-y-2">
                            {config.availableLocations.map((location, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                <Input
                                  value={location.name}
                                  onChange={(e) => {
                                    const newLocations = [...config.availableLocations];
                                    newLocations[index].name = e.target.value;
                                    updateChannelConfig(channel, 'availableLocations', newLocations);
                                  }}
                                  placeholder="Nombre de la ubicación"
                                  className="flex-1"
                                />
                                <Input
                                  value={location.address}
                                  onChange={(e) => {
                                    const newLocations = [...config.availableLocations];
                                    newLocations[index].address = e.target.value;
                                    updateChannelConfig(channel, 'availableLocations', newLocations);
                                  }}
                                  placeholder="Dirección"
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newLocations = config.availableLocations.filter((_, i) => i !== index);
                                    updateChannelConfig(channel, 'availableLocations', newLocations);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newLocations = [...config.availableLocations, { name: '', address: '' }];
                                updateChannelConfig(channel, 'availableLocations', newLocations);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Añadir Ubicación
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label htmlFor={`${channel}-single-location`}>Ubicación única</Label>
                          <Input
                            id={`${channel}-single-location`}
                            value={config.singleLocation}
                            onChange={(e) => updateChannelConfig(channel, 'singleLocation', e.target.value)}
                            placeholder="Ej: Oficina Central - Calle Mayor 123, Madrid"
                            className="w-full"
                          />
                          <p className="text-sm text-muted-foreground">
                            Especifica la dirección de tu única ubicación. Los clientes verán esta información al reservar su cita.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Configuración de pagos */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.enablePaymentOptions}
                      onCheckedChange={(checked) => updateChannelConfig(channel, 'enablePaymentOptions', checked)}
                    />
                    <Label>Habilitar opciones de pago</Label>
                  </div>

                  {config.enablePaymentOptions && (
                    <div className="space-y-4 pl-6 border-l-2 border-green-200">
                      <div className="space-y-2">
                        <Label htmlFor={`${channel}-payment-method`}>Método de pago único</Label>
                        <Select
                          value={config.paymentMethod}
                          onValueChange={(value) => updateChannelConfig(channel, 'paymentMethod', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Efectivo</SelectItem>
                            <SelectItem value="card">Tarjeta</SelectItem>
                            <SelectItem value="bank_transfer">Transferencia bancaria</SelectItem>
                            <SelectItem value="digital_wallet">Wallet digital</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Los clientes utilizarán únicamente este método de pago
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Configuración de depósito/pago</Label>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`${channel}-payment-timing`}>Momento de pago</Label>
                            <Select
                              value={config.paymentTiming}
                              onValueChange={(value) => updateChannelConfig(channel, 'paymentTiming', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="advance_payment">Pago anticipado</SelectItem>
                                <SelectItem value="full_payment">Pago completo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`${channel}-deposit-percentage`}>Porcentaje de pago anticipado (%)</Label>
                            <Input
                              id={`${channel}-deposit-percentage`}
                              type="number"
                              min="0"
                              max="100"
                              value={config.depositPercentage}
                              onChange={(e) => updateChannelConfig(channel, 'depositPercentage', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Confirmación Final y Recordatorios */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Confirmación Final y Recordatorios
                </CardTitle>
                <CardDescription>
                  Configura cómo se confirman las citas y se envían los recordatorios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configuración de confirmación automática */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.autoConfirm}
                      onCheckedChange={(checked) => updateChannelConfig(channel, 'autoConfirm', checked)}
                    />
                    <Label>Confirmación automática</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {config.autoConfirm ? 'Las citas se confirman automáticamente' : 'Requiere confirmación manual'}
                  </p>
                </div>

                {/* Configuración del método de confirmación */}
                <div className="space-y-2">
                  <Label>Método de confirmación final</Label>
                  <Select
                    value={config.finalConfirmationMethod}
                    onValueChange={(value) => updateChannelConfig(channel, 'finalConfirmationMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email automático</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="phone_call">Llamada telefónica</SelectItem>
                      <SelectItem value="multiple">Múltiples canales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Configuración de recordatorios */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.reminderEnabled}
                      onCheckedChange={(checked) => updateChannelConfig(channel, 'reminderEnabled', checked)}
                    />
                    <Label>Enviar recordatorios</Label>
                  </div>

                  {config.reminderEnabled && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`${channel}-reminder-timing`}>Tiempo antes de la cita</Label>
                        <Input
                          id={`${channel}-reminder-timing`}
                          type="number"
                          value={config.reminderTiming}
                          onChange={(e) => updateChannelConfig(channel, 'reminderTiming', parseInt(e.target.value))}
                          placeholder="24"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${channel}-reminder-unit`}>Unidad de tiempo</Label>
                        <Select
                          value={config.reminderUnit}
                          onValueChange={(value) => updateChannelConfig(channel, 'reminderUnit', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hours">Horas</SelectItem>
                            <SelectItem value="days">Días</SelectItem>
                            <SelectItem value="weeks">Semanas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Duración de Citas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Duración de Citas
                </CardTitle>
                <CardDescription>
                  Configuración de tiempo por categoría de servicio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Modo de duración</Label>
                    <Select
                      value={config.appointmentDurationMode}
                      onValueChange={(value) => updateChannelConfig(channel, 'appointmentDurationMode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Duración fija para todas las citas</SelectItem>
                        <SelectItem value="by_service_category">Duración por categoría de servicio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${channel}-default-duration`}>Duración por defecto (minutos)</Label>
                    <Input
                      id={`${channel}-default-duration`}
                      type="number"
                      min="15"
                      max="300"
                      value={config.defaultAppointmentDuration}
                      onChange={(e) => updateChannelConfig(channel, 'defaultAppointmentDuration', parseInt(e.target.value))}
                    />
                  </div>

                  {config.appointmentDurationMode === 'by_service_category' && (
                    <div className="space-y-4 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                      <Label>Configuración por categorías de servicio</Label>
                      <p className="text-sm text-muted-foreground">
                        Define la duración específica para cada tipo de servicio que ofreces
                      </p>
                      {config.serviceCategoryDurations.map((category, index) => (
                        <div key={category.id} className="p-4 border rounded-lg space-y-3 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <Label>Categoría {index + 1}</Label>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={category.active}
                                onCheckedChange={(checked) => {
                                  const updatedCategories = [...config.serviceCategoryDurations];
                                  updatedCategories[index].active = checked;
                                  updateChannelConfig(channel, 'serviceCategoryDurations', updatedCategories);
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedCategories = config.serviceCategoryDurations.filter((_, i) => i !== index);
                                  updateChannelConfig(channel, 'serviceCategoryDurations', updatedCategories);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-sm">Nombre de la categoría</Label>
                              <Input
                                value={category.categoryName}
                                onChange={(e) => {
                                  const updatedCategories = [...config.serviceCategoryDurations];
                                  updatedCategories[index].categoryName = e.target.value;
                                  updateChannelConfig(channel, 'serviceCategoryDurations', updatedCategories);
                                }}
                                placeholder="Ej: Corte de cabello, Lavado, Tinte..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">Duración (minutos)</Label>
                              <Input
                                type="number"
                                min="15"
                                max="300"
                                value={category.duration}
                                onChange={(e) => {
                                  const updatedCategories = [...config.serviceCategoryDurations];
                                  updatedCategories[index].duration = parseInt(e.target.value);
                                  updateChannelConfig(channel, 'serviceCategoryDurations', updatedCategories);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newCategory = {
                            id: Date.now().toString(),
                            categoryName: '',
                            duration: 60,
                            active: true
                          };
                          const updatedCategories = [...config.serviceCategoryDurations, newCategory];
                          updateChannelConfig(channel, 'serviceCategoryDurations', updatedCategories);
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir nueva categoría
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Horarios Simplificados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5" />
                  Horarios de Atención
                </CardTitle>
                <CardDescription>
                  Define los horarios durante los cuales se pueden agendar citas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.businessHours.enabled}
                    onCheckedChange={(checked) => {
                      const updatedHours = { ...config.businessHours, enabled: checked };
                      updateChannelConfig(channel, 'businessHours', updatedHours);
                    }}
                  />
                  <Label>Activar horarios de atención</Label>
                </div>

                {config.businessHours.enabled && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Los clientes solo podrán agendar citas durante estos horarios
                    </p>
                    {config.businessHours.schedule.map((day, index) => (
                      <div key={day.day} className="grid grid-cols-3 gap-2 items-center">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={day.enabled}
                            onCheckedChange={(checked) => {
                              const updatedSchedule = [...config.businessHours.schedule];
                              updatedSchedule[index].enabled = checked;
                              const updatedHours = { ...config.businessHours, schedule: updatedSchedule };
                              updateChannelConfig(channel, 'businessHours', updatedHours);
                            }}
                          />
                          <Label className="text-sm">{day.day}</Label>
                        </div>
                        <Input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => {
                            const updatedSchedule = [...config.businessHours.schedule];
                            updatedSchedule[index].startTime = e.target.value;
                            const updatedHours = { ...config.businessHours, schedule: updatedSchedule };
                            updateChannelConfig(channel, 'businessHours', updatedHours);
                          }}
                          disabled={!day.enabled}
                        />
                        <Input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => {
                            const updatedSchedule = [...config.businessHours.schedule];
                            updatedSchedule[index].endTime = e.target.value;
                            const updatedHours = { ...config.businessHours, schedule: updatedSchedule };
                            updateChannelConfig(channel, 'businessHours', updatedHours);
                          }}
                          disabled={!day.enabled}
                        />
                      </div>
                    ))}

                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor={`${channel}-out-of-hours-message`}>Mensaje fuera de horario</Label>
                      <Textarea
                        id={`${channel}-out-of-hours-message`}
                        value={config.outOfHoursMessage}
                        onChange={(e) => updateChannelConfig(channel, 'outOfHoursMessage', e.target.value)}
                        rows={2}
                        placeholder="Mensaje que verán los clientes cuando intenten agendar fuera del horario"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        )}
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Principal Mini */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 shadow-lg">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
              <Clock3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                🚀 Gestión de Citas
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <Badge className="bg-amber-500 text-white border-0 shadow-lg hover:bg-amber-600 transition-all animate-pulse">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Pendientes
              </Badge>
            )}
            <Button 
              onClick={saveAllSettings} 
              disabled={!hasUnsavedChanges}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-emerald-400 shadow-xl hover:shadow-2xl transition-all duration-300 px-6 py-2.5 font-bold text-sm hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="h-5 w-5 mr-2" />
              💾 Guardar Cambios
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjetas informativas */}
      <div className="space-y-3">
        <InfoCard
          id="welcome-info"
          title="¡Bienvenido al sistema de gestión de citas!"
          description="Aquí puedes configurar todos los canales de comunicación para automatizar tus reservas de citas. Cada canal tiene opciones específicas adaptadas a su funcionamiento."
          type="success"
          onDismiss={dismissCard}
        />

        <InfoCard
          id="ai-system-active"
          title="Sistema de análisis inteligente activado"
          description="La IA analizará automáticamente el contenido de los emails para determinar la duración más apropiada de cada cita, mejorando la precisión de tus horarios."
          type="ai"
          onDismiss={dismissCard}
        />

        <InfoCard
          id="how-system-works"
          title="¿Cómo funciona el sistema?"
          description="El sistema combina reglas personalizadas con análisis de IA. Primero aplica tus reglas específicas, luego la IA analiza el contexto para refinar la duración final."
          type="info"
          onDismiss={dismissCard}
        />

        <InfoCard
          id="feedback-system"
          title="Sistema de feedback inteligente"
          description="La IA ahora puede recibir y aprender de feedback sobre sus análisis, mejorando continuamente la precisión de las predicciones de duración."
          type="feature"
          onDismiss={dismissCard}
        />

        <InfoCard
          id="optimization-tip"
          title="💡 Consejo de optimización"
          description="Para mejores resultados, crea reglas específicas para los tipos de cita más comunes. La IA se encargará de los casos especiales y complejos."
          type="tip"
          onDismiss={dismissCard}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-1 rounded-xl shadow-lg border-2 border-blue-100 dark:border-blue-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold rounded-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-900">
            📊 Resumen
          </TabsTrigger>
          <TabsTrigger value="web" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white font-semibold rounded-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-900">
            🌐 Web
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white font-semibold rounded-lg transition-all duration-300 hover:bg-green-100 dark:hover:bg-green-900">
            💬 WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-semibold rounded-lg transition-all duration-300 hover:bg-purple-100 dark:hover:bg-purple-900">
            📧 Email
          </TabsTrigger>
          <TabsTrigger value="phone" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-semibold rounded-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900">
            📞 Llamadas
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-semibold rounded-lg transition-all duration-300 hover:bg-indigo-100 dark:hover:bg-indigo-900">
            📈 Estadísticas
          </TabsTrigger>
        </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <EnhancedOverview
              webConfig={webConfig}
              whatsappConfig={whatsappConfig}
              emailConfig={emailConfig}
              phoneConfig={phoneConfig}
              services={services}
              onConfigChange={handleConfigChange}
            />
        </TabsContent>

          <TabsContent value="web" className="space-y-6">
            <div className="space-y-6">
              {renderChannelSettings('web', webConfig)}
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <div className="space-y-6">
              {renderWhatsAppSettings(whatsappConfig)}
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <div className="space-y-6">
              {renderEmailSettings(emailConfig)}
            </div>
          </TabsContent>

          <TabsContent value="phone" className="space-y-6">
            <div className="space-y-6">
              {renderPhoneSettings(phoneConfig)}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <EnhancedStats 
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
            
            {/* Panel de métricas en tiempo real */}
            <RealtimeStatsPanel />
            
            {/* Mantener las estadísticas del sistema de duración automática */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estadísticas del Sistema de Duración Automática
                </CardTitle>
                <CardDescription>
                  Análisis de rendimiento y métricas del sistema de duración automática por contenido de email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AutomaticDurationStats config={emailConfig} />
              </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}
