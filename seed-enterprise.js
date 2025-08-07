const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedEnterpriseData() {
  try {
    console.log('🌱 Seeding enterprise data...')

    // Find or create Basic Company subscription  
    let basicCompany = await prisma.company.findFirst({
      where: { 
        OR: [
          { email: 'basic@basiccompany.com' },
          { name: 'Basic Company' }
        ]
      }
    })

    if (!basicCompany) {
      console.log('🏢 Creating Basic Company...')
      basicCompany = await prisma.company.create({
        data: {
          name: 'Basic Company',
          slug: 'basic-company',
          email: 'basic@basiccompany.com',
          phone: '+1234567890',
          website: 'https://basic.example.com',
          timezone: 'UTC',
          is_active: true,
          is_verified: true,
        }
      })
    }

    if (basicCompany) {
      console.log('📦 Creating BASIC subscription...')
      
      // Create subscription for Basic Company
      const basicSubscription = await prisma.subscription.upsert({
        where: { companyId: basicCompany.id },
        update: {},
        create: {
          companyId: basicCompany.id,
          plan: 'BASIC',
          status: 'ACTIVE',
          billing_cycle: 'MONTHLY',
          unit_amount: 1900, // $19.00
          currency: 'USD',
          max_users: 5,
          max_storage: 5368709120, // 5GB
          max_api_calls: 5000,
          max_projects: 10,
          max_integrations: 2,
          features: ['basic_support', 'email_notifications'],
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }
      })

      // Update company
      await prisma.company.update({
        where: { id: basicCompany.id },
        data: {
          subscriptionId: basicSubscription.id,
          current_users: 3, // 3 users currently
          current_storage: 1073741824, // 1GB used
          monthly_api_calls: 1200, // 1200 API calls this month
        }
      })

      console.log('✅ BASIC subscription created')
    }

    // Create Premium test company
    console.log('🏢 Creating Premium test company...')
    
    const premiumCompany = await prisma.company.upsert({
      where: { email: 'premium@testcompany.com' },
      update: {},
      create: {
        name: 'Premium Test Company',
        slug: 'premium-test-company',
        email: 'premium@testcompany.com',
        phone: '+1234567891',
        website: 'https://premium.example.com',
        timezone: 'America/New_York',
        is_active: true,
        is_verified: true,
      }
    })

    // Create Premium subscription
    const premiumSubscription = await prisma.subscription.upsert({
      where: { companyId: premiumCompany.id },
      update: {},
      create: {
        companyId: premiumCompany.id,
        plan: 'PREMIUM',
        status: 'ACTIVE',
        billing_cycle: 'YEARLY',
        unit_amount: 49900, // $499.00/year
        currency: 'USD',
        max_users: 25,
        max_storage: 53687091200, // 50GB
        max_api_calls: 25000,
        max_projects: 100,
        max_integrations: 10,
        features: ['priority_support', 'email_notifications', 'sms_notifications', 'custom_branding'],
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days
      }
    })

    await prisma.company.update({
      where: { id: premiumCompany.id },
      data: {
        subscriptionId: premiumSubscription.id,
        current_users: 12,
        current_storage: 21474836480, // 20GB used
        monthly_api_calls: 8500,
      }
    })

    // Create Enterprise test company
    console.log('🏭 Creating Enterprise test company...')
    
    const enterpriseCompany = await prisma.company.upsert({
      where: { email: 'enterprise@megacorp.com' },
      update: {},
      create: {
        name: 'MegaCorp Enterprise',
        slug: 'megacorp-enterprise',
        email: 'enterprise@megacorp.com',
        phone: '+1234567892',
        website: 'https://megacorp.example.com',
        timezone: 'UTC',
        is_active: true,
        is_verified: true,
      }
    })

    const enterpriseSubscription = await prisma.subscription.upsert({
      where: { companyId: enterpriseCompany.id },
      update: {},
      create: {
        companyId: enterpriseCompany.id,
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        billing_cycle: 'YEARLY',
        unit_amount: 149900, // $1499.00/year
        currency: 'USD',
        max_users: 999999, // Unlimited
        max_storage: BigInt('999999999999999'), // Unlimited
        max_api_calls: 999999, // Unlimited
        max_projects: 999999,
        max_integrations: 999999,
        features: ['dedicated_support', 'all_notifications', 'custom_branding', 'sso', 'api_access'],
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }
    })

    await prisma.company.update({
      where: { id: enterpriseCompany.id },
      data: {
        subscriptionId: enterpriseSubscription.id,
        current_users: 150,
        current_storage: BigInt('536870912000'), // 500GB used
        monthly_api_calls: 45000,
      }
    })

    // Create test users for each company
    console.log('👥 Creating test users...')

    const companies = [
      { company: basicCompany, prefix: 'basic' },
      { company: premiumCompany, prefix: 'premium' },
      { company: enterpriseCompany, prefix: 'enterprise' },
    ]

    for (const { company, prefix } of companies) {
      // Admin user
      await prisma.user.upsert({
        where: { email: `admin@${prefix}.com` },
        update: {},
        create: {
          email: `admin@${prefix}.com`,
          name: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Admin`,
          password_hash: await bcrypt.hash('demo123', 12),
          company_id: company.id,
          role: 'ADMIN',
          department: 'IT',
          job_title: 'System Administrator',
          is_active: true,
          is_verified: true,
        }
      })

      // Manager user
      await prisma.user.upsert({
        where: { email: `manager@${prefix}.com` },
        update: {},
        create: {
          email: `manager@${prefix}.com`,
          name: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Manager`,
          password_hash: await bcrypt.hash('demo123', 12),
          company_id: company.id,
          role: 'MANAGER',
          department: 'Operations',
          job_title: 'Operations Manager',
          is_active: true,
          is_verified: true,
        }
      })

      // Employee user
      await prisma.user.upsert({
        where: { email: `employee@${prefix}.com` },
        update: {},
        create: {
          email: `employee@${prefix}.com`,
          name: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Employee`,
          password_hash: await bcrypt.hash('demo123', 12),
          company_id: company.id,
          role: 'EMPLOYEE',
          department: 'Sales',
          job_title: 'Sales Representative',
          is_active: true,
          is_verified: true,
        }
      })
    }

    // Create some test invitations
    console.log('📬 Creating test invitations...')
    
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@basic.com' }
    })

    if (adminUser) {
      await prisma.invitation.upsert({
        where: {
          company_id_email: {
            company_id: basicCompany.id,
            email: 'newuser@basiccompany.com'
          }
        },
        update: {},
        create: {
          company_id: basicCompany.id,
          email: 'newuser@basiccompany.com',
          role: 'USER',
          department: 'Marketing',
          job_title: 'Marketing Specialist',
          invited_by: adminUser.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          status: 'PENDING',
        }
      })
    }

    // Create usage logs for this month
    console.log('📊 Creating usage logs...')
    
    const currentMonth = new Date().toISOString().substring(0, 7)
    
    for (const { company } of companies) {
      // API calls usage over the month
      for (let i = 0; i < 10; i++) {
        await prisma.usageLog.create({
          data: {
            company_id: company.id,
            resource: 'API_CALLS',
            amount: Math.floor(Math.random() * 500) + 100,
            period: currentMonth,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          }
        })
      }

      // Storage usage
      await prisma.usageLog.create({
        data: {
          company_id: company.id,
          resource: 'STORAGE',
          amount: Math.floor(Math.random() * 1073741824), // Up to 1GB
          period: currentMonth,
        }
      })
    }

    // Create some API keys for testing
    console.log('🔑 Creating API keys...')
    
    for (const { company, prefix } of companies) {
      await prisma.apiKey.create({
        data: {
          company_id: company.id,
          name: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} API Key`,
          key_hash: '$2a$12$' + 'sample_hashed_api_key_' + prefix,
          key_prefix: 'pk_' + prefix.substring(0, 4),
          scopes: ['read:bookings', 'write:bookings', 'read:users'],
          is_active: true,
        }
      })
    }

    console.log('✅ Enterprise data seeding completed!')
    console.log('\n🎯 Test Accounts Created:')
    console.log('Basic Company:')
    console.log('  - admin@basic.com / demo123')
    console.log('  - manager@basic.com / demo123')
    console.log('  - employee@basic.com / demo123')
    console.log('\nPremium Company:')
    console.log('  - admin@premium.com / demo123')
    console.log('  - manager@premium.com / demo123')
    console.log('  - employee@premium.com / demo123')
    console.log('\nEnterprise Company:')
    console.log('  - admin@enterprise.com / demo123')
    console.log('  - manager@enterprise.com / demo123')
    console.log('  - employee@enterprise.com / demo123')

  } catch (error) {
    console.error('❌ Error seeding enterprise data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedEnterpriseData()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
