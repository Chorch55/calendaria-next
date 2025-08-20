"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  FileText, 
  Download, 
  Filter,
  Calendar,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function BalanceAccountsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Simulación de datos de balance
  const summary = {
    totalIncome: 15750,
    totalExpenses: 8340,
    netBalance: 7410,
    pendingInvoices: 2300,
    overduePayments: 450
  };

  const accounts = [
    {
      id: '1',
      name: 'Cuenta Principal - BBVA',
      type: 'business',
      balance: 12500,
      currency: '€',
      lastUpdated: '2024-08-20',
      status: 'active'
    },
    {
      id: '2', 
      name: 'Cuenta de Ahorros - Santander',
      type: 'savings',
      balance: 8950,
      currency: '€',
      lastUpdated: '2024-08-20',
      status: 'active'
    },
    {
      id: '3',
      name: 'Cuenta PayPal Business',
      type: 'digital',
      balance: 1230,
      currency: '€',
      lastUpdated: '2024-08-19',
      status: 'active'
    }
  ];

  const recentTransactions = [
    {
      id: '1',
      description: 'Consultoría - Cliente María García',
      amount: 150,
      type: 'income',
      date: '2024-08-20',
      account: 'BBVA',
      category: 'Services'
    },
    {
      id: '2',
      description: 'Oficina - Alquiler mensual',
      amount: -800,
      type: 'expense',
      date: '2024-08-19',
      account: 'BBVA',
      category: 'Office'
    },
    {
      id: '3',
      description: 'Software - Licencia CalendarIA',
      amount: -99,
      type: 'expense',
      date: '2024-08-18',
      account: 'BBVA',
      category: 'Software'
    },
    {
      id: '4',
      description: 'Consultoría - Cliente Roberto Martinez',
      amount: 200,
      type: 'income',
      date: '2024-08-18',
      account: 'BBVA',
      category: 'Services'
    },
    {
      id: '5',
      description: 'Marketing - Google Ads',
      amount: -120,
      type: 'expense',
      date: '2024-08-17',
      account: 'PayPal',
      category: 'Marketing'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getBalanceColor = (balance: number) => {
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Balance de Cuentas</h1>
          <p className="text-muted-foreground">
            Gestiona y monitorea el estado financiero de tu negocio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Resumen financiero */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBalanceColor(summary.netBalance)}`}>
              {formatCurrency(summary.netBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Ingresos - Gastos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.pendingInvoices)}
            </div>
            <p className="text-xs text-muted-foreground">Por cobrar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Vencidos</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.overduePayments)}
            </div>
            <p className="text-xs text-muted-foreground">Vencidos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Cuentas</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="reports">Informes</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Lista de cuentas */}
          <Card>
            <CardHeader>
              <CardTitle>Cuentas Bancarias</CardTitle>
              <CardDescription>
                Gestiona todas tus cuentas bancarias y digitales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {account.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Actualizado: {account.lastUpdated}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getBalanceColor(account.balance)}`}>
                          {formatCurrency(account.balance)}
                        </p>
                        <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                          {account.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filtros de transacciones */}
          <Card>
            <CardHeader>
              <CardTitle>Transacciones Recientes</CardTitle>
              <CardDescription>
                Historial detallado de ingresos y gastos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar transacciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Período
                </Button>
              </div>

              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{transaction.date}</span>
                          <span>•</span>
                          <span>{transaction.account}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getBalanceColor(transaction.amount)}`}>
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informes Financieros</CardTitle>
              <CardDescription>
                Genera informes detallados de tu actividad financiera
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-2">Informe Mensual</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Resumen completo de ingresos y gastos del mes actual
                  </p>
                  <Button size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generar PDF
                  </Button>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-2">Flujo de Caja</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Análisis del flujo de efectivo por período
                  </p>
                  <Button size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generar Excel
                  </Button>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-2">Balance General</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Estado financiero completo de tu negocio
                  </p>
                  <Button size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generar PDF
                  </Button>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-2">Análisis de Categorías</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Desglose de gastos por categorías
                  </p>
                  <Button size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generar PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
