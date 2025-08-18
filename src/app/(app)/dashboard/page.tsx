
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, CalendarCheck2, AlertTriangle, Lightbulb } from "lucide-react";
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function DashboardPage() {
  const stats = [
    { title: "New Emails", value: "12", icon: <Mail className="h-6 w-6 text-primary" />, color: "text-blue-500", href: "/dashboard/inbox" },
    { title: "WhatsApp Messages", value: "8", icon: <MessageSquare className="h-6 w-6 text-primary" />, color: "text-green-500", href: "/dashboard/inbox?tab=whatsapp" },
    { title: "Upcoming Appointments", value: "3", icon: <CalendarCheck2 className="h-6 w-6 text-primary" />, color: "text-purple-500", href: "/dashboard/calendar" },
    { title: "Needs Attention", value: "2", icon: <Lightbulb className="h-6 w-6 text-destructive" />, color: "text-red-500", href: "/dashboard/inbox?filter=needs-attention" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to</h1>
        <Logo />
        <span className="text-3xl font-bold tracking-tight">!</span>
      </div>
      <p className="text-muted-foreground">Here's a quick overview of your communication activity.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
            <Card className="shadow-lg hover:shadow-xl transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">AI activity feed and recent messages will be shown here.</p>
            {/* Placeholder for activity feed */}
            <ul className="mt-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="flex items-center p-3 bg-muted/50 rounded-md">
                  <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span className="text-sm">AI summarized email from "Client X" - <span className="text-primary font-medium">View</span></span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Shortcuts to common tasks.</p>
            {/* Placeholder for quick actions */}
             <div className="mt-4 space-y-2">
                <button className="w-full text-left p-3 hover:bg-muted/50 rounded-md transition-colors">Compose New Email</button>
                <button className="w-full text-left p-3 hover:bg-muted/50 rounded-md transition-colors">Schedule New Appointment</button>
                <button className="w-full text-left p-3 hover:bg-muted/50 rounded-md transition-colors">View AI Settings</button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
