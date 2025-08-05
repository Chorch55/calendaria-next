# Funcionalidades del Proyecto

Esta aplicación, denominada **CalendarIA**, combina comunicación, calendario y herramientas de gestión con apoyo de IA.

## Tecnologías utilizadas

- **Frontend:** Next.js + Tailwind CSS + shadcn/ui
- **Autenticación:** NextAuth.js (JWT, Credentials Provider)
- **Base de datos:** PostgreSQL + Prisma ORM
- **Automatización:** N8N vía webhooks/API
- **Pagos:** Stripe Checkout
- **Hosting:** Frontend en Vercel y backend/bd en PostgreSQL
- **Seguridad:** NextAuth.js, HTTPS, JWT, roles y variables protegidas

## Principales funcionalidades

### Bandeja de entrada unificada

El código de `Inbox` define la estructura de cada mensaje con metadatos de interacción de IA:
```ts
  type: 'whatsapp';
  account: string; // WhatsApp number
}

type MessageChannelDetails = MessageChannelDetailsEmail | MessageChannelDetailsWhatsApp;

interface Message {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  timestamp: string;
  avatar: string;
  read: boolean;
  aiInteraction?: 'ai-responded' | 'needs-attention' | 'summarized' | 'none';
  conversationLog: ConversationMessage[];
  channelDetails: MessageChannelDetails;
```
Estos mensajes se muestran y filtran por servicio y por tipo de interacción con la IA.

### Gestión de eventos

La sección de eventos consulta e inserta registros en Supabase:
```ts
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true })

      if (error) {
        console.error('Error cargando eventos:', error.message)
      } else {
        setEvents(data ?? [])
      }
```

### Registro de llamadas

Cada llamada tiene resumen, sentimiento y enlace a la grabación:
```ts
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Phone Call Logs</h1>
        <p className="text-muted-foreground mt-1">
          Review AI-analyzed summaries and recordings of your inbound calls.
        </p>
      </div>

      {mockCallLogs.length > 0 ? (
        <div className="space-y-4">
          {mockCallLogs.map((log) => (
            <Card key={log.id} className="shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center text-xl">
                            <User className="mr-2 h-5 w-5 text-primary" /> {log.callerName}
                            {log.appointmentScheduled && (
                                <Badge variant="secondary" className="ml-2 font-normal">
                                    {appSettings.phoneCallAppointmentLabel}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="flex items-center text-sm mt-1">
                            <Phone className="mr-2 h-4 w-4" /> {log.callerNumber}
                             <span className="mx-2">|</span>
                            <Clock className="mr-2 h-4 w-4" /> {log.timestamp}
                        </CardDescription>
                    </div>
                     <Badge
                        className={cn(
                            "capitalize whitespace-nowrap",
                            {
                                'bg-green-500 text-white border-transparent hover:bg-green-600': log.sentiment === 'Positive',
                                'bg-white text-black border border-gray-300': log.sentiment === 'Neutral',
                                'bg-red-500 text-white border-transparent hover:bg-red-600': log.sentiment === 'Negative',
                            }
                        )}
                    >
                        {log.sentiment}
```

### Contactos y empresas

El panel de contactos permite buscar, filtrar y editar tanto contactos como empresas:
```ts
    const filteredContacts = useMemo(() => {
        return contacts
            .filter(contact => filter === 'favorites' ? contact.isFavorite : true)
            .filter(contact => {
                if (!searchTerm.trim()) return true;
                const lowerSearch = searchTerm.toLowerCase();
                return (
                    contact.name.toLowerCase().includes(lowerSearch) ||
                    contact.email.toLowerCase().includes(lowerSearch) ||
                    contact.phone.includes(searchTerm) ||
                    (contact.company && contact.company.toLowerCase().includes(lowerSearch))
                );
            });
    }, [contacts, filter, searchTerm]);

    const filteredCompanies = useMemo(() => {
        return companies.filter(company => {
            if (!searchTerm.trim()) return true;
            const lowerSearch = searchTerm.toLowerCase();
            return (
                company.name.toLowerCase().includes(lowerSearch) ||
                (company.email && company.email.toLowerCase().includes(lowerSearch)) ||
                (company.phone && company.phone.includes(searchTerm))
            );
        });
    }, [companies, searchTerm]);
    
    const contactsForViewingCompany = useMemo(() => {
        if (!viewingCompany) return [];
        return contacts.filter(c => c.companyId === viewingCompany.id);
    }, [contacts, viewingCompany]);

    // --- Dialog Open/Close Handlers ---
    const handleOpenAddContactDialog = (companyId?: string) => {
        setEditingContact(null);
        const company = companies.find(c => c.id === companyId);
        setContactForm({ ...emptyContactFormState, companyId, company: company?.name });
        setIsContactDialogOpen(true);
    };

    const handleOpenEditContactDialog = (contact: Contact) => {
        setEditingContact(contact);
```

### Gestión de tareas (Kanban)

Existe un tablero de tareas con formularios de creación y edición:
```ts
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
            <CardDescription>Organize, assign, and track your team's work using a Kanban-style board.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => alert("Filters functionality will be added later.")}>
                <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleOpenCreateTaskDialog}>
```

### Control horario y ausencias

Se registran las horas trabajadas y se gestionan solicitudes de vacaciones:
```ts
  const [activeTab, setActiveTab] = useState("time-log");

  // State for Time Logging
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialEntries);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple' | 'range'>('single');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [range, setRange] = useState<DateRange | undefined>();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editForm, setEditForm] = useState({ taskDescription: '', startTime: '', endTime: '' });

  // State for Leave Requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [newRequestForm, setNewRequestForm] = useState(emptyRequestForm);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isClockedIn && startTime) {
      timer = setInterval(() => {
        setSessionSeconds(differenceInSeconds(new Date(), startTime));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isClockedIn, startTime]);

  const handleClockIn = () => {
    if (!currentTask.trim()) {
      toast({
        title: "Task Required",
        description: "Please enter a description for the task you are starting.",
        variant: "destructive",
      });
      return;
    }
    setIsClockedIn(true);
    setStartTime(new Date());
    setSessionSeconds(0);
    toast({ title: "Clocked In", description: `Started tracking time for: ${currentTask}` });
  };

  const handleClockOut = () => {
    if (!startTime) return;

    const endTime = new Date();
    const durationInSeconds = differenceInSeconds(endTime, startTime);

    const newEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      taskDescription: currentTask,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationInSeconds,
    };

    setTimeEntries(prev => [newEntry, ...prev]);
    setIsClockedIn(false);
    setCurrentTask('');
    setStartTime(null);
    setSessionSeconds(0);
```

### Asistente conversacional

La página del asistente usa el flujo `askAssistant` para responder en un chat:
```ts
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await askAssistant({ query: input });
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling assistant flow:", error);
      show(
        <>
          <strong>{t('assistant_error_toast_title')}</strong>
          <div>{t('assistant_error_toast_description')}</div>
        </>
      );
       const errorMessage: Message = { role: 'assistant', content: t('assistant_error_message') };
       setMessages(prev => [...prev, errorMessage]);
```

### Personalización y conexiones

El contexto de ajustes controla las conexiones y la visibilidad del menú:
```ts

const defaultTopNavOrder: (string | CustomNavGroup)[] = [
  'inbox', 'calendar', 'phone-calls', 'notifications', 'contacts', 'tasks', 'chat', 'time-tracking',
  {
    id: 'human-resources',
    type: 'group',
    name: 'Human Resources',
    icon: 'Briefcase',
    children: ['leave', 'payroll'],
  },
];
const defaultBottomNavOrder: (string | CustomNavGroup)[] = [
  {
    id: 'management',
    type: 'group',
    name: 'Management',
    icon: 'Settings2',
    children: ['team_management', 'role_management', 'services', 'online-booking'],
  },
  'ai_logs', 'settings', 'suggestions', 'assistant'
];

const defaultAppSettings: AppSettings = {
  phoneCallAppointmentLabel: 'Appointment',
  topNavOrder: defaultTopNavOrder,
  bottomNavOrder: defaultBottomNavOrder,
  sidebarVisibility: NAV_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: true }), {}),
  showNotificationBadge: true,
  fontSize: 105,
  language: 'en',
};

const defaultConnections: ConnectionsState = {
  gmail: { connected: true, account: 'default_user@gmail.com' },
  outlook: { connected: false, account: null },
  whatsapp: { connected: false, account: null, active: false },
  phone: { connected: false, account: null },
```

### Flujos de IA con Genkit

El flujo `assistantFlow` describe las habilidades del asistente y procesa la consulta del usuario:
```ts

const prompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: {schema: AssistantInputSchema},
  output: {schema: AssistantOutputSchema},
  prompt: `You are a friendly and expert AI assistant for an application called "CalendarIA".
Your goal is to help users understand and use the application effectively.

CalendarIA is an AI-powered calendar and unified communications platform. Its key features include:
- Unified Inbox: Manages emails (Gmail, Outlook) and WhatsApp messages in one place.
- Calendar Integration: Syncs appointments, which can be created automatically from messages.
- Task Management: A Kanban-style board to organize and track team tasks.
- Phone Call Logs: AI-analyzed summaries and recordings of inbound calls.
- AI-Powered Assistance: Features like automated responses, message summarization, and appointment suggestions.
- Settings: Allows users to connect accounts, customize the UI (theme, font size, sidebar order), and manage notifications.
- Team & Role Management: Admins can invite users and define permissions.

When a user asks a question, provide a clear, concise, and helpful response. Be polite and encouraging.
If a user asks about a function you don't have, explain that you're an assistant for the CalendarIA app and can only answer questions about its features.
```

Todas estas funcionalidades se integran con la autenticación de Supabase para mantener la seguridad de los datos.
