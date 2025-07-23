"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual contact form submission logic
    console.log({ name, email, company, message });
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you shortly.",
    });
    setName('');
    setEmail('');
    setCompany('');
    setMessage('');
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions about custom plans, enterprise solutions, or anything else? We&apos;re here to help.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Send us a message</CardTitle>
            <CardDescription>Fill out the form and our team will be in touch.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company Name (Optional)</Label>
                <Input id="company" placeholder="Your Company LLC" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="How can we help you?" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3">
                <Send className="mr-2 h-5 w-5" /> Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Our Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-3 mt-1 text-primary shrink-0" />
                <div>
                  <strong>Email:</strong><br />
                  <a href="mailto:support@calendaria.app" className="hover:text-primary">support@calendaria.app</a>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-3 mt-1 text-primary shrink-0" />
                <div>
                  <strong>Phone:</strong><br />
                  <a href="tel:+15551234567" className="hover:text-primary">+1 (555) 123-4567</a> (Mon-Fri, 9am-5pm EST)
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-1 text-primary shrink-0" />
                <div>
                  <strong>Address:</strong><br />
                  <a href="https://www.google.com/maps/search/?api=1&query=123%20Innovation%20Drive%2C%20Tech%20City%2C%20CA%2094000%2C%20USA" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    123 Innovation Drive, Tech City, CA 94000, USA
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* You can add a map component here if desired */}
        </div>
      </div>
    </div>
  );
}
