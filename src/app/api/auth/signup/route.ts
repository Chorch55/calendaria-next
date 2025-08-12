import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyName,
      companyEmail,
      companyPhone,
      companyWebsite,
  subscriptionPlan,
    selectedAddons,
      fullName,
      userEmail,
      password
    } = body

    // Validaciones básicas
    if (!companyName || !companyEmail || !fullName || !userEmail || !password) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar que no existe una empresa con el mismo email
    const existingCompany = await prisma.company.findUnique({
      where: { email: companyEmail }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Ya existe una empresa con este email' },
        { status: 400 }
      )
    }

    // Verificar que no existe un usuario con el mismo email
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generar slug básico a partir del nombre de la empresa
    const baseSlug = String(companyName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^[-]+|[-]+$/g, '')

  // Crear empresa y usuario en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la empresa
  const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
          phone: companyPhone,
          website: companyWebsite,
          slug: baseSlug,
      // Nota: la suscripción se crea posteriormente mediante /api/subscription
      // Puedes almacenar metadatos iniciales en settings si lo necesitas
  settings: {
    initialPlan: subscriptionPlan || 'premium',
    selectedAddons: selectedAddons || null,
      } as any,
        }
      })

      // Crear el usuario super admin
      const user = await tx.user.create({
        data: {
          email: userEmail,
          name: fullName,
          password_hash: hashedPassword,
      // Ajuste al enum UserRole de Prisma
      role: 'SUPER_ADMIN' as any,
          company_id: company.id,
        }
      })

      return { company, user }
    })

    return NextResponse.json({
      success: true,
      message: 'Cuenta creada exitosamente',
      companyId: result.company.id,
      userId: result.user.id
    })

  } catch (error) {
    console.error('Error en signup:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
