
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Changed from 'next/navigation'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building, User, Briefcase, Users, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';

const professionalProfiles = [
  { value: 'consultant', label: 'Consultant (Financial, Business, IT)' },
  { value: 'legal_services', label: 'Legal Services / Law Firm' },
  { value: 'medical_practice', label: 'Medical Practice (Clinic, Dentist, etc.)' },
  { value: 'real_estate_agency', label: 'Real Estate Agency' },
  { value: 'sales_marketing_team', label: 'Sales & Marketing Team' },
  { value: 'creative_professional', label: 'Creative Professional / Agency' },
  { value: 'local_service_provider', label: 'Local Service Provider (Salon, Contractor, etc.)' },
  { value: 'other', label: 'Other' },
];

const subscriptionPlans = [
  { id: 'user', name: 'Individual (€19/mo)', description: 'Perfect for solo professionals.', disabled: false },
  { id: 'medium_team', name: 'Medium Team (€99/mo)', description: 'Great for growing teams.', disabled: false },
  { id: 'big_team', name: 'Big Team (€299/mo)', description: 'For established businesses.', disabled: true },
];

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [yourName, setYourName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileType, setProfileType] = useState('');
  const [otherProfile, setOtherProfile] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('user');
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual signup logic with Firebase
    console.log({ companyName, yourName, email, password, profileType, otherProfile, selectedPlan });
    toast({
      title: "Account Creation Initiated",
      description: "Redirecting to dashboard...",
    });
    // Simulate successful signup and redirect
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <Building className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold">Create Your CalendarIA Account</CardTitle>
          <CardDescription>Join thousands of professionals streamlining their communications.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center"><Briefcase className="w-4 h-4 mr-2 text-muted-foreground" />Company Name</Label>
                <Input id="companyName" placeholder="Your Company LLC" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yourName" className="flex items-center"><User className="w-4 h-4 mr-2 text-muted-foreground" />Your Name</Label>
                <Input id="yourName" placeholder="John Doe" value={yourName} onChange={(e) => setYourName(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileType" className="flex items-center"><Target className="w-4 h-4 mr-2 text-muted-foreground" />Professional Profile</Label>
              <Select onValueChange={setProfileType} value={profileType}>
                <SelectTrigger id="profileType">
                  <SelectValue placeholder="Select your profile" />
                </SelectTrigger>
                <SelectContent>
                  {professionalProfiles.map(profile => (
                    <SelectItem key={profile.value} value={profile.value}>
                      {profile.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {profileType === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="otherProfile">Please specify</Label>
                <Input
                  id="otherProfile"
                  placeholder="e.g., Architect, Designer, etc."
                  value={otherProfile}
                  onChange={(e) => setOtherProfile(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-3">
              <Label className="flex items-center"><Users className="w-4 h-4 mr-2 text-muted-foreground" />Subscription Plan</Label>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscriptionPlans.map((plan) => (
                  <Label
                    key={plan.id}
                    htmlFor={plan.id}
                    className={cn(
                      "relative flex flex-col items-start space-y-1 rounded-md border-2 border-muted bg-popover p-4 transition-colors",
                      !plan.disabled && "hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer",
                      plan.disabled && "grayscale cursor-not-allowed opacity-60"
                    )}
                  >
                    
                    <div className="flex items-center w-full justify-between">
                      <span className="font-semibold">{plan.name}</span>
                       <RadioGroupItem value={plan.id} id={plan.id} className="shrink-0" disabled={plan.disabled}/>
                    </div>
                    <span className="text-sm text-muted-foreground">{plan.description}</span>
                    {plan.id === 'big_team' && <Badge variant="outline" className="mt-2">Coming Soon</Badge>}
                  </Label>
                ))}
              </RadioGroup>
               
            </div>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3">
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
