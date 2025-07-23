
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, DollarSign, Users, CalendarClock } from "lucide-react";

interface SubscriptionPlan {
  name: string;
  pricePerMonth: number;
  userLimit: number | 'Custom';
  features: string[];
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

// Mock Data
const currentPlan: SubscriptionPlan = {
  name: 'Medium Team Plan',
  pricePerMonth: 99,
  userLimit: 10,
  features: [
    'Up to 10 Users',
    'Shared Inbox & Collaboration',
    'Team & Role Management',
    'Advanced AI (Call Analysis, etc)',
    'AI Activity Logs',
    'Priority Support'
  ],
};

const availablePlans: SubscriptionPlan[] = [
   { name: 'Individual', pricePerMonth: 19, userLimit: 1, features: ['1 User', 'Email & WhatsApp Inbox', 'Calendar Management', 'Personal Task Management', 'Contact Management', 'Basic AI Features'] },
];

const mockInvoices: Invoice[] = [
  { id: 'INV-2024-003', date: '2024-07-01', amount: 99, status: 'Paid' },
  { id: 'INV-2024-002', date: '2024-06-01', amount: 99, status: 'Paid' },
  { id: 'INV-2024-001', date: '2024-05-01', amount: 99, status: 'Paid' },
];

export default function BillingPage() {

  // TODO: Integrate with Firebase/Stripe for actual billing data.

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription, payment methods, and view invoices.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center"><DollarSign className="mr-2 h-6 w-6 text-primary" />Current Subscription</CardTitle>
            <Button variant="outline">Change Plan</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
              <p className="text-xl font-semibold text-primary">{currentPlan.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Price</p>
              <p className="text-xl font-semibold">€{currentPlan.pricePerMonth}/month</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Users</p>
              <p className="text-xl font-semibold flex items-center"><Users className="h-5 w-5 mr-1.5 text-muted-foreground"/>Up to {currentPlan.userLimit} users</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Plan Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {currentPlan.features.map(feature => <li key={feature}>{feature}</li>)}
            </ul>
          </div>
          <div className="pt-4 border-t">
             <p className="text-sm text-muted-foreground flex items-center"><CalendarClock className="h-4 w-4 mr-1.5"/>Next billing date: August 1, 2024</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
           <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" />Payment Method</CardTitle>
            <Button variant="outline">Update Payment</Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Visa **** **** **** 1234 <span className="text-sm">(Expires 12/2025)</span></p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Invoice History</CardTitle>
          <CardDescription>Download your past invoices for record keeping.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                    <TableCell>€{invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={invoice.status === 'Paid' ? 'default' : invoice.status === 'Pending' ? 'outline' : 'destructive'}
                        className={`${invoice.status === 'Paid' && 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'}`}
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No invoices found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
