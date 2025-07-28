"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from "sonner"
import { UserCircle, Mail, Phone, Camera, Save, ShieldCheck } from 'lucide-react';

// Mock user data
const initialUserProfile = {
  name: 'Elena Rodriguez',
  email: 'elena.rodriguez@example.com',
  phone: '+1 555-0101',
  jobTitle: 'Lead Consultant',
  avatarUrl: 'https://placehold.co/150x150.png', // Larger avatar for profile
  initials: 'ER',
};

export default function UserProfilePage() {
  const [profile, setProfile] = useState(initialUserProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // TODO: Implement actual profile update logic
    console.log('Saving profile:', profile);
    toast.success("Profile Updated", {
      description: "Your profile details have been successfully updated."
    });
    setIsEditing(false);
  };

  // TODO: Handle avatar upload
  const handleAvatarChange = () => {
    toast.info("Feature Coming Soon", {
      description: "Avatar upload functionality will be available in a future update."
    });
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">View and update your personal information.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-md">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="person portrait" />
              <AvatarFallback className="text-4xl">{profile.initials}</AvatarFallback>
            </Avatar>
            <Button 
              size="icon" 
              variant="outline" 
              className="absolute bottom-1 right-1 rounded-full h-10 w-10 bg-background hover:bg-muted"
              onClick={handleAvatarChange}
            >
              <Camera className="h-5 w-5" />
              <span className="sr-only">Change avatar</span>
            </Button>
          </div>
          <CardTitle className="text-2xl mt-4">{profile.name}</CardTitle>
          <CardDescription>{profile.jobTitle || 'Your Role'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center"><UserCircle className="w-4 h-4 mr-2 text-muted-foreground"/>Full Name</Label>
            <Input id="name" name="name" value={profile.name} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center"><Mail className="w-4 h-4 mr-2 text-muted-foreground"/>Email Address</Label>
            <Input id="email" name="email" type="email" value={profile.email} disabled />
            <p className="text-xs text-muted-foreground mt-1">Email address is managed by your organization admin.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center"><Phone className="w-4 h-4 mr-2 text-muted-foreground"/>Phone Number</Label>
            <Input id="phone" name="phone" type="tel" value={profile.phone} onChange={handleChange} disabled={!isEditing} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="jobTitle" className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-muted-foreground"/>Job Title / Role</Label>
            <Input id="jobTitle" name="jobTitle" value={profile.jobTitle} onChange={handleChange} disabled={!isEditing} />
          </div>
          {/* Add more fields like department, timezone, etc. if needed */}
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end">
          {isEditing ? (
            <div className="space-x-2">
              <Button variant="ghost" onClick={() => { setProfile(initialUserProfile); setIsEditing(false); }}>Cancel</Button>
              <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline">Edit Profile</Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Security Settings (e.g., Change Password, 2FA) could be another card */}
      {/* <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline">Enable Two-Factor Authentication</Button>
        </CardContent>
      </Card> */}
    </div>
  );
}
