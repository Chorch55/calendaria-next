
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UsageOverview } from "@/components/dashboard/usage-overview";
import { BusinessMetrics } from "@/components/dashboard/business-metrics";
import { BusinessActivityFeed } from "@/components/dashboard/business-activity-feed";
import { QuickActionsPanel } from "@/components/dashboard/quick-actions-panel";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { 
  PlusCircle,
  Star,
  TrendingUp
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header con bienvenida personalizada y estado del sistema */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good morning, Elena!</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            All systems operational
          </Badge>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Métricas principales del negocio */}
      <BusinessMetrics />

      {/* Layout principal en grid mejorado */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Columna izquierda: Actividad y acciones (3/4) */}
        <div className="lg:col-span-3 space-y-6">
          <BusinessActivityFeed />
          <QuickActionsPanel />
          
          {/* Panel de reviews movido aquí para llenar espacio */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5" />
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">&quot;Excellent service, very professional&quot;</p>
                    <p className="text-xs text-muted-foreground mt-1">- Ana L.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">&quot;Quick response and great results&quot;</p>
                    <p className="text-xs text-muted-foreground mt-1">- Carlos M.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm font-medium">Average: 4.8/5</span>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Panel lateral compacto (1/4) */}
        <div className="lg:col-span-1 space-y-6">
          <UsageOverview />
          <TodaySchedule />
          <FinancialOverview />
          
          {/* Panel de objetivos mensuales */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Monthly Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>Revenue Target</span>
                  <span className="text-green-600">€3,247 / €5,000</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">€1,753 remaining</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>New Clients</span>
                  <span className="text-blue-600">8 / 12</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: '67%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">4 clients remaining</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>Billable Hours</span>
                  <span className="text-purple-600">156 / 200</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: '78%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">44 hours remaining</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
