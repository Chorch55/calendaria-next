
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, Search, PlusCircle, Edit, Trash2, Star, Save, Building, User, ChevronsUpDown, Link as LinkIcon, Unlink } from 'lucide-react';
import { toast } from "sonner"
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  companyId?: string; // Links to a Company
  company?: string; // Denormalized name for easy display
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

const emptyContactFormState: Partial<Contact> = { name: '', email: '', phone: '', source: 'Manual', companyId: undefined, company: undefined, isFavorite: false };
const emptyCompanyFormState: Partial<Company> = { name: '', email: '', phone: '' };

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

    const [contactForm, setContactForm] = useState<Partial<Contact>>(emptyContactFormState);
    const [companyForm, setCompanyForm] = useState<Partial<Company>>(emptyCompanyFormState);

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
        setContactForm({ ...contact });
        setIsContactDialogOpen(true);
    };
    
    const handleOpenAddCompanyDialog = () => {
        setEditingCompany(null);
        setCompanyForm(emptyCompanyFormState);
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

    // --- Form Input Handlers ---
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

    // --- Save Handlers ---
    const handleSaveContact = () => {
        if (!contactForm.name?.trim() || !contactForm.email?.trim()) {
            toast.error("Error", {
                description: "Contact name and email are required."
            });
            return;
        }

        if (editingContact) { // Editing existing contact
            setContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...contactForm } as Contact : c));
            toast.success("Contact Updated", {
                description: `${contactForm.name}'s details saved.`
            });
        } else { // Creating new contact
            const newContact: Contact = {
                id: `c${Date.now()}`,
                ...emptyContactFormState,
                ...contactForm,
                avatarUrl: 'https://placehold.co/100x100.png',
                lastContacted: 'Just now'
            } as Contact;
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
            // Also update denormalized name on contacts
            setContacts(prev => prev.map(contact => contact.companyId === editingCompany.id ? {...contact, company: companyForm.name} : contact));
            toast.success("Company Updated", {
                description: `${companyForm.name}'s details saved.`
            });
        } else {
            const newCompany: Company = {
                id: `comp${Date.now()}`,
                ...emptyCompanyFormState,
                ...companyForm,
                avatarUrl: 'https://placehold.co/100x100.png',
            } as Company;
            setCompanies(prev => [newCompany, ...prev]);
            toast.success("Company Created", {
                description: `${newCompany.name} has been added.`
            });
        }
        setIsCompanyDialogOpen(false);
    };

    // --- Delete Handlers ---
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contacts & Companies</h1>
                    <p className="text-muted-foreground mt-1">
                        Your central directory of professional contacts and associated companies.
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                            <PlusCircle className="mr-2 h-5 w-5" /> Add New
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleOpenAddContactDialog()}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Add New Contact</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={handleOpenAddCompanyDialog}>
                            <Building className="mr-2 h-4 w-4" />
                            <span>Add New Company</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder={`Search ${activeTab}...`}
                            className="pl-10 w-full" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                        <TabsTrigger value="contacts"><User className="mr-2 h-4 w-4"/>Contacts</TabsTrigger>
                        <TabsTrigger value="companies"><Building className="mr-2 h-4 w-4"/>Companies</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="contacts">
                    <Card className="shadow-lg">
                         <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>All Contacts ({filteredContacts.length})</CardTitle>
                                <div className="flex items-center p-1 space-x-1 bg-muted rounded-md">
                                    <Button variant={filter === 'all' ? 'secondary' : 'ghost'} onClick={() => setFilter('all')} className="rounded-sm px-3 h-8">All</Button>
                                    <Button variant={filter === 'favorites' ? 'secondary' : 'ghost'} onClick={() => setFilter('favorites')} className="rounded-sm px-3 h-8">
                                        <Star className="h-4 w-4 mr-2" /> Favorites
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredContacts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredContacts.map(contact => (
                                        <Card key={contact.id} className="flex flex-col hover:shadow-xl transition-shadow">
                                            <CardHeader className="flex flex-row items-start gap-4">
                                                <Avatar className="h-12 w-12 border">
                                                    <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint="person avatar" />
                                                    <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                                                    {contact.company && <Button variant="link" className="p-0 h-auto font-normal text-primary" onClick={() => handleOpenCompanyDetailDialog(companies.find(c => c.id === contact.companyId) as Company)}>{contact.company}</Button>}
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleToggleFavorite(contact.id)}>
                                                    <Star className={cn("h-5 w-5 transition-colors", contact.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground hover:text-yellow-300")} />
                                                </Button>
                                            </CardHeader>
                                            <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /><span className="truncate">{contact.email}</span></div>
                                                <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /><span>{contact.phone}</span></div>
                                            </CardContent>
                                            <CardFooter className="border-t pt-4 flex justify-between items-center">
                                                <Badge variant={contact.source === 'Call' ? 'default' : contact.source === 'Email' ? 'secondary' : 'outline'} className="capitalize">From {contact.source}</Badge>
                                                <div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditContactDialog(contact)}><Edit className="h-4 w-4" /></Button>
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                          <AlertDialogHeader><AlertDialogTitle>Delete {contact.name}?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteContact(contact.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                      </AlertDialog>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            ) : ( <div className="text-center py-12 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-2" /><p>No contacts found.</p></div> )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="companies">
                    <Card className="shadow-lg">
                        <CardHeader><CardTitle>All Companies ({filteredCompanies.length})</CardTitle></CardHeader>
                        <CardContent>
                            {filteredCompanies.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredCompanies.map(company => (
                                        <Card key={company.id} className="flex flex-col hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleOpenCompanyDetailDialog(company)}>
                                            <CardHeader className="flex-row items-center gap-4">
                                                <Avatar className="h-12 w-12 border">
                                                    <AvatarImage src={company.avatarUrl} alt={company.name} data-ai-hint="company logo" />
                                                    <AvatarFallback><Building/></AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg">{company.name}</CardTitle>
                                                    <CardDescription>{contacts.filter(c => c.companyId === company.id).length} Contacts</CardDescription>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
                                                {company.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /><span className="truncate">{company.email}</span></div>}
                                                {company.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /><span>{company.phone}</span></div>}
                                            </CardContent>
                                            <CardFooter className="border-t pt-4 flex justify-end">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleOpenEditCompanyDialog(company); }}><Edit className="h-4 w-4" /></Button>
                                                <AlertDialog onOpenChange={(open) => !open && e.stopPropagation()}>
                                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Delete {company.name}?</AlertDialogTitle><AlertDialogDescription>This will delete the company and unlink all associated contacts. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCompany(company.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                             ) : ( <div className="text-center py-12 text-muted-foreground"><Building className="h-12 w-12 mx-auto mb-2" /><p>No companies found.</p></div> )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit/Create Contact Dialog */}
            <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</DialogTitle><DialogDescription>Fill in the contact's details below.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" name="name" value={contactForm.name || ''} onChange={handleContactFormChange} /></div>
                        <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" value={contactForm.email || ''} onChange={handleContactFormChange} /></div>
                        <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={contactForm.phone || ''} onChange={handleContactFormChange} /></div>
                        <div className="space-y-1.5"><Label htmlFor="companyId">Company</Label>
                           <Select value={contactForm.companyId} onValueChange={handleContactCompanyChange}>
                               <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="no-company">No Company</SelectItem>
                                   {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                           </Select>
                        </div>
                    </div>
                    <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit" onClick={handleSaveContact} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="mr-2 h-4 w-4" /> Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit/Create Company Dialog */}
            <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>{editingCompany ? "Edit Company" : "Add New Company"}</DialogTitle><DialogDescription>Fill in the company's details below.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-1.5"><Label htmlFor="company-name">Company Name</Label><Input id="company-name" name="name" value={companyForm.name || ''} onChange={handleCompanyFormChange} /></div>
                        <div className="space-y-1.5"><Label htmlFor="company-email">Company Email</Label><Input id="company-email" name="email" value={companyForm.email || ''} onChange={handleCompanyFormChange} /></div>
                        <div className="space-y-1.5"><Label htmlFor="company-phone">Company Phone</Label><Input id="company-phone" name="phone" value={companyForm.phone || ''} onChange={handleCompanyFormChange} /></div>
                    </div>
                    <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit" onClick={handleSaveCompany} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="mr-2 h-4 w-4" /> Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Company Detail View Dialog */}
            {viewingCompany && (
                 <Dialog open={isCompanyDetailOpen} onOpenChange={setIsCompanyDetailOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <div className="flex items-center gap-4">
                               <Avatar className="h-16 w-16 border">
                                    <AvatarImage src={viewingCompany.avatarUrl} alt={viewingCompany.name} data-ai-hint="company logo" />
                                    <AvatarFallback><Building/></AvatarFallback>
                                </Avatar>
                                <div>
                                    <DialogTitle className="text-2xl">{viewingCompany.name}</DialogTitle>
                                    <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                      {viewingCompany.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /><a href={`mailto:${viewingCompany.email}`} className="truncate hover:underline">{viewingCompany.email}</a></div>}
                                      {viewingCompany.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /><span>{viewingCompany.phone}</span></div>}
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">Contacts ({contactsForViewingCompany.length})</h4>
                                <Button size="sm" variant="outline" onClick={() => handleOpenAddContactDialog(viewingCompany.id)}><PlusCircle className="h-4 w-4 mr-2"/>Add Contact</Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                {contactsForViewingCompany.length > 0 ? (
                                    contactsForViewingCompany.map(contact => (
                                        <div key={contact.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8"><AvatarImage src={contact.avatarUrl} alt={contact.name} /><AvatarFallback>{contact.name.slice(0,1)}</AvatarFallback></Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{contact.name}</p>
                                                    <p className="text-xs text-muted-foreground">{contact.email}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditContactDialog(contact)}><Edit className="h-3.5 w-3.5"/></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setContacts(prev => prev.map(c => c.id === contact.id ? {...c, companyId: undefined, company: undefined} : c))}><Unlink className="h-3.5 w-3.5 text-destructive"/></Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No contacts linked to this company yet.</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter><DialogClose asChild><Button type="button">Close</Button></DialogClose></DialogFooter>
                    </DialogContent>
                 </Dialog>
            )}

        </div>
    );
}

    

    