const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Crear empresa de prueba
  const company = await prisma.company.upsert({
    where: { email: 'demo@basiccompany.com' },
    update: {},
    create: {
      name: 'Basic Company',
      email: 'demo@basiccompany.com',
      phone: '+34 123 456 789',
      website: 'https://basiccompany.com',
      subscription_plan: 'premium',
      subscription_status: 'active',
    }
  })

  // Crear usuarios de prueba
  const users = [
    {
      name: 'Super Admin',
      email: 'superadmin@basiccompany.com',
      password: 'demo123',
      role: 'super_admin'
    },
    {
      name: 'Admin User',
      email: 'admin@basiccompany.com', 
      password: 'demo123',
      role: 'admin'
    },
    {
      name: 'Regular User',
      email: 'user@basiccompany.com',
      password: 'demo123',
      role: 'user'
    }
  ]

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        password_hash: hashedPassword,
        role: userData.role,
        company_id: company.id,
        is_active: true
      }
    })
  }

  console.log('✅ Datos de prueba creados exitosamente!')
  console.log('👤 Usuarios disponibles:')
  users.forEach(user => {
    console.log(`   - ${user.email} (${user.role}) - password: ${user.password}`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
