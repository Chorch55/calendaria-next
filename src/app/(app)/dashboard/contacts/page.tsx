"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Users,
  Mail,
  Phone,
  Search,
  PlusCircle,
  Edit,
  Edit3,
  Save,
  Trash2,
  Star,
  Building,
  User,
  Unlink
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  source: 'Email' | 'Call' | 'Manual';
  companyId?: string;
  company?: string;
  lastContacted: string;
  isFavorite?: boolean;
}

const initialCompaniesData: Company[] = [
  { id: 'comp1', name: 'Innovate LLC', email: 'contact@innovatellc.com', phone: '+1-800-555-0199', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'comp2', name: 'Magicorp', email: 'info@magicorp.net', phone: '+1-888-555-0121', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'comp3', name: 'Wonderland Inc.', email: 'hello@wonderland.com', avatarUrl: 'https://placehold.co/100x100.png' },
];

const initialContactsData: Contact[] = [
  { id: 'c1', name: 'John Smith', email: 'john.smith@example.com', phone: '+1-202-555-0182', avatarUrl: 'https://placehold.co/100x100.png', source: 'Call', companyId: 'comp1', company: 'Innovate LLC', lastContacted: '2 days ago', isFavorite: true },
  { id: 'c2', name: 'Alice Wonderland', email: 'alice.w@gmail.com', phone: '+1-415-555-0132', avatarUrl: 'https://placehold.co/100x100.png', source: 'Email', companyId: 'comp3', company: 'Wonderland Inc.', lastContacted: '1 day ago', isFavorite: false },
  { id: 'c3', name: 'Jane Doe', email: 'jane.d@outlook.com', phone: '+1-310-555-0145', avatarUrl: 'https://placehold.co/100x100.png', source: 'Call', lastContacted: '5 hours ago', isFavorite: true },
  { id: 'c4', name: 'David Copperfield', email: 'david.c@magic.net', phone: '+1-234-567-890', avatarUrl: 'https://placehold.co/100x100.png', source: 'Manual', companyId: 'comp2', company: 'Magicorp', lastContacted: '1 week ago', isFavorite: false },
  { id: 'c5', name: 'Bob The Builder', email: 'bob.builder@outlook.com', phone: '+1-987-654-3210', avatarUrl: 'https://placehold.co/100x100.png', source: 'Email', companyId: 'comp1', company: 'Innovate LLC', lastContacted: '3 days ago', isFavorite: false },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(initialContactsData);
  const [companies, setCompanies] = useState<Company[]>(initialCompaniesData);
  
  const [activeTab, setActiveTab] = useState<'contacts' | 'companies'>('contacts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [isCompanyDetailOpen, setIsCompanyDetailOpen] = useState(false);
  
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

  const [contactForm, setContactForm] = useState<Partial<Contact>>({ name: '', email: '', phone: '', source: 'Manual', isFavorite: false });
  const [companyForm, setCompanyForm] = useState<Partial<Company>>({ name: '', email: '', phone: '' });

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

  const handleOpenAddContactDialog = (companyId?: string) => {
    setEditingContact(null);
    const company = companies.find(c => c.id === companyId);
    setContactForm({ name: '', email: '', phone: '', source: 'Manual', companyId, company: company?.name, isFavorite: false });
    setIsContactDialogOpen(true);
  };

  const handleOpenEditContactDialog = (contact: Contact) => {
    setEditingContact(contact);
    setContactForm({ ...contact });
    setIsContactDialogOpen(true);
  };
  
  const handleOpenAddCompanyDialog = () => {
    setEditingCompany(null);
    setCompanyForm({ name: '', email: '', phone: '' });
    setIsCompanyDialogOpen(true);
  };
  
  const handleOpenEditCompanyDialog = (company: Company) => {
    setEditingCompany(company);
    setCompanyForm({ ...company });
    setIsCompanyDialogOpen(true);
  };

  const handleOpenCompanyDetailDialog = (company: Company) => {
    setViewingCompany(company);
    setIsCompanyDetailOpen(true);
  };

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCompanyFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    setContactForm(prev => ({...prev, companyId, company: company?.name}));
  };

  const handleSaveContact = () => {
    if (!contactForm.name?.trim() || !contactForm.email?.trim()) {
      toast.error("Error", {
        description: "Contact name and email are required."
      });
      return;
    }

    if (editingContact) {
      setContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...contactForm } as Contact : c));
      toast.success("Contact Updated", {
        description: `${contactForm.name}'s details saved.`
      });
    } else {
      const newContact: Contact = {
        id: `c${Date.now()}`,
        name: contactForm.name || '',
        email: contactForm.email || '',
        phone: contactForm.phone || '',
        source: contactForm.source || 'Manual',
        avatarUrl: 'https://placehold.co/100x100.png',
        lastContacted: 'Just now',
        companyId: contactForm.companyId,
        company: contactForm.company,
        isFavorite: contactForm.isFavorite || false
      };
      setContacts(prev => [newContact, ...prev]);
      toast.success("Contact Created", {
        description: `${newContact.name} has been added.`
      });
    }
    setIsContactDialogOpen(false);
  };

  const handleSaveCompany = () => {
    if (!companyForm.name?.trim()) {
      toast.error("Error", {
        description: "Company name is required."
      });
      return;
    }
    if (editingCompany) {
      setCompanies(prev => prev.map(c => c.id === editingCompany.id ? { ...c, ...companyForm } as Company : c));
      setContacts(prev => prev.map(contact => contact.companyId === editingCompany.id ? {...contact, company: companyForm.name} : contact));
      toast.success("Company Updated", {
        description: `${companyForm.name}'s details saved.`
      });
    } else {
      const newCompany: Company = {
        id: `comp${Date.now()}`,
        name: companyForm.name || '',
        email: companyForm.email,
        phone: companyForm.phone,
        avatarUrl: 'https://placehold.co/100x100.png',
      };
      setCompanies(prev => [newCompany, ...prev]);
      toast.success("Company Created", {
        description: `${newCompany.name} has been added.`
      });
    }
    setIsCompanyDialogOpen(false);
  };

  const handleDeleteContact = (contactId: string) => {
    const contactName = contacts.find(c => c.id === contactId)?.name;
    setContacts(prev => prev.filter(c => c.id !== contactId));
    toast.success("Contact Deleted", {
      description: `Contact "${contactName}" has been removed.`
    });
  };
  
  const handleDeleteCompany = (companyId: string) => {
    const companyName = companies.find(c => c.id === companyId)?.name;
    setCompanies(prev => prev.filter(c => c.id !== companyId));
    setContacts(prev => prev.map(contact => contact.companyId === companyId ? {...contact, companyId: undefined, company: undefined} : contact));
    toast.success("Company Deleted", {
      description: `Company "${companyName}" has been removed.`
    });
  };

  const handleToggleFavorite = (id: string) => {
    setContacts(prev => prev.map(contact => contact.id === id ? { ...contact, isFavorite: !contact.isFavorite } : contact));
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight whitespace-nowrap">Contactos & Empresas</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Tu directorio central de contactos profesionales y empresas asociadas.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Agregar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleOpenAddContactDialog()}>
              <User className="mr-2 h-4 w-4" />
              <span>Nuevo Contacto</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleOpenAddCompanyDialog}>
              <Building className="mr-2 h-4 w-4" />
              <span>Nueva Empresa</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'contacts' | 'companies')} className="w-full">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder={`Buscar ${activeTab === 'contacts' ? 'contactos' : 'empresas'}...`}
              className="pl-10 w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <TabsList className="grid grid-cols-2 w-full sm:w-auto">
            <TabsTrigger value="contacts"><User className="mr-2 h-4 w-4"/>Contactos</TabsTrigger>
            <TabsTrigger value="companies"><Building className="mr-2 h-4 w-4"/>Empresas</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="contacts">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(value: 'all' | 'favorites') => setFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los contactos</SelectItem>
                  <SelectItem value="favorites">Solo favoritos</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="ml-auto">
                {filteredContacts.length} contacto{filteredContacts.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.map(contact => (
                <Card key={contact.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                          <AvatarFallback>{contact.name.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{contact.name}</h4>
                            {contact.isFavorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                          <p className="text-xs text-muted-foreground">{contact.phone}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleOpenEditContactDialog(contact)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleToggleFavorite(contact.id)}>
                            <Star className="mr-2 h-4 w-4" />
                            <span>{contact.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDeleteContact(contact.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {contact.source}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{contact.lastContacted}</span>
                      </div>
                      {contact.company && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{contact.company}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredContacts.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron contactos</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer contacto'}
                  </p>
                  <Button onClick={() => handleOpenAddContactDialog()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Contacto
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="companies">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompanies.map(company => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={company.avatarUrl} alt={company.name} />
                          <AvatarFallback>{company.name.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm">{company.name}</h4>
                          {company.email && <p className="text-xs text-muted-foreground">{company.email}</p>}
                          {company.phone && <p className="text-xs text-muted-foreground">{company.phone}</p>}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleOpenEditCompanyDialog(company)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleOpenCompanyDetailDialog(company)}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Ver Contactos</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDeleteCompany(company.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {contacts.filter(c => c.companyId === company.id).length} contacto{contacts.filter(c => c.companyId === company.id).length !== 1 ? 's' : ''}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenAddContactDialog(company.id)}
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        Contacto
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCompanies.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron empresas</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primera empresa'}
                  </p>
                  <Button onClick={handleOpenAddCompanyDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Empresa
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo para agregar/editar contacto */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}</DialogTitle>
            <DialogDescription>
              {editingContact ? 'Modifica la información del contacto.' : 'Agrega un nuevo contacto a tu directorio.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Nombre *</Label>
              <Input
                id="contact-name"
                name="name"
                placeholder="Nombre completo"
                value={contactForm.name || ''}
                onChange={handleContactFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email *</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                placeholder="email@ejemplo.com"
                value={contactForm.email || ''}
                onChange={handleContactFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Teléfono</Label>
              <Input
                id="contact-phone"
                name="phone"
                placeholder="+1-234-567-8900"
                value={contactForm.phone || ''}
                onChange={handleContactFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-source">Origen</Label>
              <Select value={contactForm.source} onValueChange={(value: 'Email' | 'Call' | 'Manual') => setContactForm(prev => ({...prev, source: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Call">Llamada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-company">Empresa</Label>
              <Select value={contactForm.companyId || ''} onValueChange={handleContactCompanyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin empresa</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="contact-favorite"
                checked={contactForm.isFavorite || false}
                onCheckedChange={(checked) => setContactForm(prev => ({...prev, isFavorite: checked}))}
              />
              <Label htmlFor="contact-favorite">Marcar como favorito</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveContact}>
              <Save className="mr-2 h-4 w-4" />
              {editingContact ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para agregar/editar empresa */}
      <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}</DialogTitle>
            <DialogDescription>
              {editingCompany ? 'Modifica la información de la empresa.' : 'Agrega una nueva empresa a tu directorio.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nombre *</Label>
              <Input
                id="company-name"
                name="name"
                placeholder="Nombre de la empresa"
                value={companyForm.name || ''}
                onChange={handleCompanyFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                name="email"
                type="email"
                placeholder="contacto@empresa.com"
                value={companyForm.email || ''}
                onChange={handleCompanyFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Teléfono</Label>
              <Input
                id="company-phone"
                name="phone"
                placeholder="+1-234-567-8900"
                value={companyForm.phone || ''}
                onChange={handleCompanyFormChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCompany}>
              <Save className="mr-2 h-4 w-4" />
              {editingCompany ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver detalles de empresa */}
      <Dialog open={isCompanyDetailOpen} onOpenChange={setIsCompanyDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {viewingCompany?.name}
            </DialogTitle>
            <DialogDescription>
              Información detallada y contactos asociados
            </DialogDescription>
          </DialogHeader>
          {viewingCompany && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{viewingCompany.email || 'Sin email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{viewingCompany.phone || 'Sin teléfono'}</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Contactos ({contactsForViewingCompany.length})</h4>
                  <Button size="sm" variant="outline" onClick={() => handleOpenAddContactDialog(viewingCompany.id)}>
                    <PlusCircle className="h-4 w-4 mr-2"/>
                    Agregar Contacto
                  </Button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {contactsForViewingCompany.length > 0 ? (
                    contactsForViewingCompany.map(contact => (
                      <div key={contact.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                            <AvatarFallback>{contact.name.slice(0,1)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.email}</p>
                          </div>
                        </div>
                        <div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditContactDialog(contact)}>
                            <Edit className="h-3.5 w-3.5"/>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => setContacts(prev => prev.map(c => c.id === contact.id ? {...c, companyId: undefined, company: undefined} : c))}
                          >
                            <Unlink className="h-3.5 w-3.5 text-destructive"/>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay contactos vinculados a esta empresa.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
