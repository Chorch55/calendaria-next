'use client'

import { useInvitations } from '@/hooks/use-subscription'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Mail, UserPlus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface InviteFormData {
  email: string
  role: string
  department?: string
  jobTitle?: string
}

export default function InvitationsPage() {
  const { 
    invitations, 
    sendInvitationAsync, 
    revokeInvitation, 
    isLoading,
    isSeandingInvitation,
  isRevoking,
  resendInvitation,
  isResending
  } = useInvitations()
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  
  const { register, handleSubmit, reset, watch, setValue } = useForm<InviteFormData>({
    defaultValues: {
      role: 'EMPLOYEE'
    }
  })

  const onSubmitInvite = async (data: InviteFormData) => {
    try {
      await sendInvitationAsync({
        email: data.email,
        role: data.role,
        department: data.department,
        jobTitle: data.jobTitle,
      })
      setShowInviteDialog(false)
      reset()
    } catch (error) {
      console.error('Error sending invitation:', error)
    }
  }

  const handleRevoke = async (invitationId: string) => {
    if (confirm('¿Estás seguro de que quieres revocar esta invitación?')) {
      try {
        revokeInvitation(invitationId)
      } catch (error) {
        console.error('Error revoking invitation:', error)
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'DECLINED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'EXPIRED':
        return <AlertCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'DECLINED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Do not block the entire page – render progressively

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invitaciones</h1>
          <p className="text-gray-600">Gestiona las invitaciones a tu equipo</p>
        </div>
        
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invitar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Envía una invitación para que un nuevo usuario se una a tu empresa
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmitInvite)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  {...register('email', { required: true })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Rol</label>
                <Select 
                  value={watch('role')} 
                  onValueChange={(value) => setValue('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Departamento (Opcional)</label>
                <Input
                  placeholder="Ej: Ventas, IT, Marketing"
                  {...register('department')}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Puesto (Opcional)</label>
                <Input
                  placeholder="Ej: Desarrollador, Gerente de Ventas"
                  {...register('jobTitle')}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSeandingInvitation}>
                  {isSeandingInvitation ? 'Enviando...' : 'Enviar Invitación'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-bold text-xl">{invitations?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="font-bold text-xl">
                  {invitations?.filter(inv => inv.status === 'PENDING').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Aceptadas</p>
                <p className="font-bold text-xl">
                  {invitations?.filter(inv => inv.status === 'ACCEPTED').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-500">Rechazadas</p>
                <p className="font-bold text-xl">
                  {invitations?.filter(inv => inv.status === 'DECLINED').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Invitaciones</CardTitle>
          <CardDescription>
            Todas las invitaciones enviadas a usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!invitations ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : !invitations || invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay invitaciones enviadas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enviado</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">
                      {invitation.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {invitation.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{invitation.department || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invitation.status)}
                        <Badge className={getStatusColor(invitation.status)}>
                          {invitation.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(invitation.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      {invitation.expires_at 
                        ? new Date(invitation.expires_at).toLocaleDateString('es-ES')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {invitation.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevoke(invitation.id)}
                          >
                            Revocar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resendInvitation(invitation.id)}
                            disabled={isResending}
                          >
                            Reenviar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
