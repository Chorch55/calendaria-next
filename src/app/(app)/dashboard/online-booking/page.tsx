
// src/app/(app)/dashboard/online-booking/page.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Palette, Save, ExternalLink, Timer, Clock12, Edit, Trash2, PlusCircle, WifiOff, CheckCircle, AlertTriangle, XCircle, Settings, FileText, CalendarCheck2, History, Coffee, ArrowLeft } from "lucide-react";
import { ChromePicker, ColorResult } from 'react-color';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";
import { format, parse, isWithinInterval, startOfDay, setHours, setMinutes, parseISO } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DateRange } from "react-day-picker";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getMockServices, getMockTeamMembers, MockService, MockTeam, MockUser, getMockCategories, getMockAssignments, getMockAvailability } from '../services/page';
import type { MockServiceCategory } from '../services/page';


type TimeFormat = '12h' | '24h';
type PreviewStep = 'category' | 'service' | 'date' | 'time' | 'confirmation';


// Mock time slots generation based on service duration and availability
const generateTimeSlots = (
  service: MockService, 
  day: Date, 
  availability: ReturnType<typeof getMockAvailability>
) => {
    if (!service || !day) return [];
    
    const { duration } = service;

    let openingHour = availability.openingHour;
    let closingHour = availability.closingHour;

    // NOTE: In a real app, this logic would be much more complex.
    // It would fetch assigned users/teams for the service, check each one's
    // individual calendar, approved leave, and personal working hours.
    // For this mock, we just use the general company hours and breaks.
    
    // Check for general schedule overrides first
    const applicableOverride = availability.availabilityOverrides.find(o => o.dateRange.from && isWithinInterval(startOfDay(day), { start: startOfDay(o.dateRange.from), end: startOfDay(o.dateRange.to || o.dateRange.from) }));
    
    if (applicableOverride) {
        openingHour = applicableOverride.openingHour;
        closingHour = applicableOverride.closingHour;
    }
    
    const slots = [];
    
    const loopStart = new Date(day);
    loopStart.setHours(openingHour, 0, 0, 0);
    
    const loopEnd = new Date(day);
    loopEnd.setHours(closingHour, 0, 0, 0);

    let current = new Date(loopStart.getTime());
    while (new Date(current.getTime() + duration * 60000) <= loopEnd) {
        slots.push(new Date(current));
        current.setMinutes(current.getMinutes() + duration);
    }
    
    // Filter out slots that fall within a break
    const filteredSlots = slots.filter(slot => {
        const slotEnd = new Date(slot.getTime() + duration * 60000);
        return !availability.breaks.some(breakItem => {
            const breakStart = setMinutes(setHours(new Date(day), parseInt(breakItem.startTime.split(':')[0])), parseInt(breakItem.startTime.split(':')[1]));
            const breakEnd = setMinutes(setHours(new Date(day), parseInt(breakItem.endTime.split(':')[0])), parseInt(breakItem.endTime.split(':')[1]));
            
            return (slot >= breakStart && slot < breakEnd) || (slotEnd > breakStart && slotEnd <= breakEnd) || (slot < breakStart && slotEnd > breakEnd);
        });
    });

    // Simulate some slots being booked
    return filteredSlots.filter((_, i) => i % 4 !== 1 && i % 5 !== 2);
};



export default function OnlineBookingPage() {
  const { toast } = useToast();
  const { t } = useTranslation();

  // Settings state, now simpler, focused on appearance
  const [pageSettings, setPageSettings] = useState({
    isBookingPageEnabled: true,
    disabledMessage: "Online booking is temporarily disabled. Please contact us directly for an appointment.",
    pageTitle: "Book an Appointment with Innovatech",
    welcomeMessage: "Welcome! Please select a service and a time slot that works for you. We look forward to seeing you.",
    bookingButtonText: "Request Appointment",
    primaryColor: '#6D28D9',
    backgroundColor: '#F3F4F6',
    cardColor: '#FFFFFF',
    textColor: '#111827',
    welcomeMessageColor: '#6B7280',
    timeFormat: '12h' as TimeFormat, // Keep time format here as it's a display preference
  });
  
  const availabilitySettings = getMockAvailability();

  // State for the preview pane
  const [previewStep, setPreviewStep] = useState<PreviewStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<MockServiceCategory | undefined>(undefined);
  const [selectedService, setSelectedService] = useState<MockService | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);


  const availableCategories = getMockCategories();
  const availableServices = getMockServices(); 

  const handleSettingsChange = useCallback(<K extends keyof typeof pageSettings>(key: K, value: (typeof pageSettings)[K]) => {
    setPageSettings(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(availableCategories.find(c => c.id === categoryId));
    setSelectedService(undefined);
    setSelectedTime(null);
    setPreviewStep('service');
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(availableServices.find(s => s.id === serviceId));
    setPreviewStep('date');
  };


  const handleDateChange = (date: Date | undefined) => {
    if (date) {
        setSelectedDate(date);
        setSelectedTime(null);
        setPreviewStep('time');
    }
  };

  const resetPreview = () => {
    setPreviewStep('category');
    setSelectedCategory(undefined);
    setSelectedService(undefined);
    setSelectedTime(null);
  };

  const handleSaveSettings = () => {
    console.log("Saving settings:", pageSettings);
    toast({
      title: "Settings Saved",
      description: "Your online booking page has been updated.",
    });
  };

  const timeSlots = useMemo(() => {
    if (!selectedDate || !selectedService) return [];
    return generateTimeSlots(selectedService, selectedDate, availabilitySettings);
  }, [selectedService, selectedDate, availabilitySettings]);
  
  const ColorPickerInput = ({ label, color, onChange }: { label: string, color: string, onChange: (color: string) => void }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <div className="w-5 h-5 rounded-md border mr-2" style={{ backgroundColor: color }} />
            {color}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 border-0 w-auto">
          <ChromePicker
            color={color}
            onChange={(colorResult: ColorResult) => onChange(colorResult.hex)}
            disableAlpha={true}
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Online Booking Page</h1>
        <p className="text-muted-foreground mt-1">
          Customize and manage your public page for clients to book appointments.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
        <CardContent>
            <div className="border rounded-lg overflow-hidden">
                <div className="p-4 sm:p-8 transition-colors duration-300" style={{ backgroundColor: pageSettings.backgroundColor }}>
                <div className="rounded-lg shadow-2xl p-4 sm:p-8" style={{ backgroundColor: pageSettings.cardColor }}>
                    {pageSettings.isBookingPageEnabled ? (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: pageSettings.textColor }}>{pageSettings.pageTitle}</h1>
                            <p className="mt-2 text-sm sm:text-base" style={{ color: pageSettings.welcomeMessageColor }}>{pageSettings.welcomeMessage}</p>
                        </div>

                        <div className="relative overflow-hidden min-h-[450px]">
                            <AnimatePresence mode="wait">
                                {previewStep === 'category' && (
                                    <motion.div
                                        key="category-step"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, position: 'absolute' }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full space-y-4"
                                    >
                                        <h2 className="text-lg font-semibold text-center" style={{ color: pageSettings.textColor }}>
                                        1. Select a Category
                                        </h2>
                                        <div className="space-y-2">
                                        {availableCategories.map(category => (
                                            <button
                                            key={category.id}
                                            onClick={() => handleCategoryChange(category.id)}
                                            className="w-full text-left p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                            <p className="font-semibold" style={{ color: pageSettings.textColor }}>{category.name}</p>
                                            </button>
                                        ))}
                                        </div>
                                    </motion.div>
                                )}

                                {previewStep === 'service' && (
                                    <motion.div
                                        key="service-step"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50, position: 'absolute' }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="w-full space-y-4"
                                    >
                                        <Button variant="link" onClick={() => setPreviewStep('category')} className="self-start p-0 h-auto mb-2 text-sm" style={{color: pageSettings.primaryColor}}><ArrowLeft className="h-4 w-4 mr-1"/>Back to categories</Button>
                                        <h2 className="text-lg font-semibold text-center" style={{ color: pageSettings.textColor }}>
                                            2. Select a Service in <span className="font-bold" style={{color: pageSettings.primaryColor}}>{selectedCategory?.name}</span>
                                        </h2>
                                        <div className="space-y-2">
                                            {availableServices.filter(s => s.categoryId === selectedCategory?.id).map(service => (
                                            <button
                                                key={service.id}
                                                onClick={() => handleServiceChange(service.id)}
                                                className="w-full text-left p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <p className="font-semibold" style={{ color: pageSettings.textColor }}>{service.name}</p>
                                                <p className="text-sm" style={{ color: pageSettings.welcomeMessageColor }}>{service.duration} minutes</p>
                                            </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {previewStep === 'date' && (
                                  <motion.div
                                    key="date-step"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50, position: 'absolute' }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="w-full space-y-4"
                                  >
                                    <Button
                                        variant="link"
                                        onClick={() => setPreviewStep('service')}
                                        className="p-0 h-auto text-sm"
                                        style={{ color: pageSettings.primaryColor }}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1" />
                                        Back to Services
                                    </Button>
                                    <h2 className="text-lg font-semibold text-center" style={{ color: pageSettings.textColor }}>
                                        3. Select a Date for <span className="font-bold" style={{color: pageSettings.primaryColor}}>{selectedService?.name}</span>
                                    </h2>
                                    <div className="w-full">
                                      <Calendar
                                          mode="single"
                                          selected={selectedDate}
                                          onSelect={handleDateChange}
                                          className="p-0 rounded-md border w-full"
                                      />
                                    </div>
                                  </motion.div>
                                )}
                                
                                {previewStep === 'time' && (
                                  <motion.div
                                    key="time-step"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50, position: 'absolute' }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="w-full space-y-4"
                                  >
                                     <Button
                                        variant="link"
                                        onClick={() => setPreviewStep('date')}
                                        className="p-0 h-auto text-sm"
                                        style={{ color: pageSettings.primaryColor }}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1" />
                                        Back to Date Selection
                                    </Button>
                                    <div className="w-full text-center p-3 rounded-md" style={{backgroundColor: pageSettings.primaryColor, color: pageSettings.cardColor}}>
                                        <h2 className="font-semibold text-lg">{selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : 'Select a date'}</h2>
                                    </div>
                                     <h3 className="text-lg font-semibold text-center" style={{ color: pageSettings.textColor }}>4. Select a Time</h3>
                                    {selectedService && selectedDate ? (
                                        <ScrollArea className="h-64 w-full">
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pr-4">
                                                {timeSlots.map((slot, index) => (
                                                    <Button
                                                        key={index}
                                                        variant={selectedTime?.getTime() === slot.getTime() ? 'default' : 'outline'}
                                                        className="font-semibold"
                                                        style={{
                                                            '--primary-color': pageSettings.primaryColor,
                                                            color: selectedTime?.getTime() === slot.getTime() ? pageSettings.cardColor : pageSettings.textColor,
                                                            borderColor: pageSettings.primaryColor,
                                                            backgroundColor: selectedTime?.getTime() === slot.getTime() ? pageSettings.primaryColor : 'transparent',
                                                        }}
                                                        onClick={() => setSelectedTime(slot)}
                                                    >
                                                        {format(slot, pageSettings.timeFormat === '12h' ? 'h:mm a' : 'HH:mm')}
                                                    </Button>
                                                ))}
                                                {timeSlots.length === 0 && (<p className="text-sm col-span-full text-center py-8" style={{color: pageSettings.welcomeMessageColor}}>No available slots for this day.</p>)}
                                            </div>
                                        </ScrollArea>
                                    ) : ( <p className="text-sm mt-4 text-center" style={{color: pageSettings.welcomeMessageColor}}>Please select a date to see available times.</p>)}
                                     <div className="pt-4 border-t w-full flex gap-4" style={{borderColor: pageSettings.primaryColor + '30'}}>
                                        <Button
                                            onClick={() => setPreviewStep('confirmation')}
                                            disabled={!selectedDate || !selectedService || !selectedTime}
                                            className="w-full"
                                            style={{ backgroundColor: pageSettings.primaryColor, color: pageSettings.cardColor }}
                                        >
                                            <CheckCircle className="mr-2 h-5 w-5" />
                                            {pageSettings.bookingButtonText}
                                        </Button>
                                    </div>
                                  </motion.div>
                                )}

                                {previewStep === 'confirmation' && selectedService && selectedTime && selectedDate && (
                                        <motion.div
                                        key="confirmation"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, position: 'absolute' }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full"
                                    >
                                        <h2 className="text-xl font-semibold mb-4 text-center" style={{ color: pageSettings.textColor }}>Confirm Your Appointment</h2>
                                        <div className="p-4 border rounded-lg space-y-2 bg-muted/30" style={{borderColor: pageSettings.primaryColor}}>
                                            <p style={{color: pageSettings.textColor}}><strong>Service:</strong> {selectedService.name}</p>
                                            <p style={{color: pageSettings.textColor}}><strong>Date:</strong> {format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                                            <p style={{color: pageSettings.textColor}}><strong>Time:</strong> {format(selectedTime, pageSettings.timeFormat === '12h' ? 'h:mm a' : 'HH:mm')}</p>
                                        </div>
                                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                            <Button variant="outline" onClick={() => setPreviewStep('time')} className="w-full">Back to selection</Button>
                                            <Button className="w-full" style={{backgroundColor: pageSettings.primaryColor, color: pageSettings.cardColor}} onClick={() => { alert("This is a preview. Booking confirmed!"); resetPreview(); }}>Confirm Booking</Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                    ) : (
                    <div className="text-center py-16">
                        <WifiOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-bold" style={{ color: pageSettings.textColor }}>Booking Unavailable</h2>
                        <p className="text-base" style={{ color: pageSettings.welcomeMessageColor }}>{pageSettings.disabledMessage}</p>
                    </div>
                    )}
                </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center"><Settings className="h-5 w-5 mr-2 text-primary"/> Settings</CardTitle>
                <CardDescription>Control the appearance and content of your public booking page.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="outline" onClick={() => alert("This would open the public page in a new tab.")}>
                    <ExternalLink className="h-4 w-4 mr-2" /> View Page
                </Button>
                <Button onClick={handleSaveSettings}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
              </div>
          </CardHeader>
          <CardContent>
             <ScrollArea className="max-h-[80vh]">
              <div className="space-y-8 p-1">
              {/* Master Switch Section */}
              <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg flex items-center mb-2"><FileText className="h-5 w-5 mr-2 text-primary"/>Page Activation</h3>
                  <p className="text-sm text-muted-foreground -mt-2">Enable or disable your entire booking page.</p>
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                      <Label htmlFor="enable-booking" className="font-semibold">Enable Online Booking Page</Label>
                      <Switch
                          id="enable-booking"
                          checked={pageSettings.isBookingPageEnabled}
                          onCheckedChange={(checked) => handleSettingsChange('isBookingPageEnabled', checked)}
                      />
                  </div>
                  <AnimatePresence>
                      {!pageSettings.isBookingPageEnabled && (
                      <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                      >
                          <div className="space-y-2 pt-2">
                              <Label htmlFor="disabledMessage">Disabled Page Message</Label>
                              <Textarea 
                                  id="disabledMessage" 
                                  value={pageSettings.disabledMessage} 
                                  onChange={(e) => handleSettingsChange('disabledMessage', e.target.value)}
                                  rows={4}
                              />
                          </div>
                      </motion.div>
                      )}
                  </AnimatePresence>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg flex items-center mb-2"><Palette className="h-5 w-5 mr-2 text-primary"/>Content & Appearance</h3>
                <p className="text-sm text-muted-foreground mb-4">Customize the texts and colors of your booking page.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="pageTitle">Page Title</Label>
                            <Input id="pageTitle" value={pageSettings.pageTitle} onChange={(e) => handleSettingsChange('pageTitle', e.target.value)}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="welcomeMessage">Welcome Message</Label>
                            <Textarea id="welcomeMessage" value={pageSettings.welcomeMessage} onChange={(e) => handleSettingsChange('welcomeMessage', e.target.value)} rows={3}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bookingButtonText">Booking Button Text</Label>
                            <Input id="bookingButtonText" value={pageSettings.bookingButtonText} onChange={(e) => handleSettingsChange('bookingButtonText', e.target.value)}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timeFormat" className="flex items-center"><Clock12 className="h-4 w-4 mr-2" />Time Format</Label>
                            <Select value={pageSettings.timeFormat} onValueChange={(val: TimeFormat) => handleSettingsChange('timeFormat', val)}>
                            <SelectTrigger id="timeFormat"><SelectValue placeholder="Select time format" /></SelectTrigger>
                            <SelectContent><SelectItem value="12h">12-Hour (e.g., 2:00 PM)</SelectItem><SelectItem value="24h">24-Hour (e.g., 14:00)</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <ColorPickerInput label="Page Background Color" color={pageSettings.backgroundColor} onChange={(color) => handleSettingsChange('backgroundColor', color)} />
                        <ColorPickerInput label="Card Color" color={pageSettings.cardColor} onChange={(color) => handleSettingsChange('cardColor', color)} />
                        <ColorPickerInput label="Primary Text Color" color={pageSettings.textColor} onChange={(color) => handleSettingsChange('textColor', color)} />
                        <ColorPickerInput label="Welcome Message Color" color={pageSettings.welcomeMessageColor} onChange={(color) => handleSettingsChange('welcomeMessageColor', color)} />
                        <ColorPickerInput label="Accent Color" color={pageSettings.primaryColor} onChange={(color) => handleSettingsChange('primaryColor', color)} />
                    </div>
                </div>
              </div>
              </div>
            </ScrollArea>
          </CardContent>
      </Card>
    </div>
  );
}
