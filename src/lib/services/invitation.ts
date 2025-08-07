import { prisma } from '@/lib/prisma'
import type { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export class InvitationService {

  // Send invitation email
  static async sendInvitation(data: {
    companyId: string
    email: string
    role: UserRole
    invitedBy: string
    department?: string
    jobTitle?: string
  }) {
    const { companyId, email, role, invitedBy, department, jobTitle } = data

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Check if invitation already exists
      const existingInvitation = await prisma.invitation.findUnique({
        where: { 
          company_id_email: {
            company_id: companyId,
            email
          }
        }
      })

      if (existingInvitation && existingInvitation.status === 'PENDING') {
        throw new Error('Invitation already sent to this email')
      }

      // Check usage limits
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: { subscription: true }
      })

      if (!company) {
        throw new Error('Company not found')
      }

      // Check if company can add more users
      if (company.subscription) {
        const currentUsers = await prisma.user.count({
          where: { company_id: companyId, is_active: true }
        })

        if (currentUsers >= company.subscription.max_users) {
          throw new Error('User limit reached for your current plan')
        }
      }

      // Generate invitation token
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      // Create invitation
      const invitation = await prisma.invitation.create({
        data: {
          company_id: companyId,
          email,
          role,
          department,
          job_title: jobTitle,
          invited_by: invitedBy,
          token,
          expires_at: expiresAt,
        },
        include: {
          company: true,
          inviter: true,
        }
      })

      // Send email (you'll need to configure nodemailer or use your preferred email service)
      await this.sendInvitationEmail({
        to: email,
        companyName: invitation.company.name,
        inviterName: invitation.inviter.name || invitation.inviter.email,
        role,
        token,
      })

      return invitation

    } catch (error) {
      console.error('Error sending invitation:', error)
      throw error
    }
  }

  // Accept invitation
  static async acceptInvitation(data: {
    token: string
    userData: {
      name: string
      password: string
    }
  }) {
    const { token, userData } = data

    try {
      // Find invitation
      const invitation = await prisma.invitation.findUnique({
        where: { token },
        include: { company: true }
      })

      if (!invitation) {
        throw new Error('Invalid invitation token')
      }

      if (invitation.status !== 'PENDING') {
        throw new Error('Invitation has already been processed')
      }

      if (invitation.expires_at < new Date()) {
        throw new Error('Invitation has expired')
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: invitation.email }
      })

      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Hash password
      const password_hash = await bcrypt.hash(userData.password, 12)

      // Create user and update invitation in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: invitation.email,
            name: userData.name,
            password_hash,
            company_id: invitation.company_id,
            role: invitation.role,
            department: invitation.department,
            job_title: invitation.job_title,
            is_active: true,
            is_verified: true, // Auto-verify invited users
          }
        })

        // Update invitation status
        await tx.invitation.update({
          where: { id: invitation.id },
          data: {
            status: 'ACCEPTED',
            accepted_at: new Date(),
          }
        })

        // Update company user count
        await tx.company.update({
          where: { id: invitation.company_id },
          data: {
            current_users: { increment: 1 }
          }
        })

        return user
      })

      return result

    } catch (error) {
      console.error('Error accepting invitation:', error)
      throw error
    }
  }

  // Resend invitation
  static async resendInvitation(invitationId: string) {
    try {
      const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
        include: {
          company: true,
          inviter: true,
        }
      })

      if (!invitation) {
        throw new Error('Invitation not found')
      }

      if (invitation.status !== 'PENDING') {
        throw new Error('Can only resend pending invitations')
      }

      // Generate new token and extend expiry
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      // Update invitation
      const updatedInvitation = await prisma.invitation.update({
        where: { id: invitationId },
        data: {
          token,
          expires_at: expiresAt,
        },
        include: {
          company: true,
          inviter: true,
        }
      })

      // Send email
      await this.sendInvitationEmail({
        to: updatedInvitation.email,
        companyName: updatedInvitation.company.name,
        inviterName: updatedInvitation.inviter.name || updatedInvitation.inviter.email,
        role: updatedInvitation.role,
        token,
      })

      return updatedInvitation

    } catch (error) {
      console.error('Error resending invitation:', error)
      throw error
    }
  }

  // Revoke invitation
  static async revokeInvitation(invitationId: string) {
    return await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: 'REVOKED',
      }
    })
  }

  // Get company invitations
  static async getCompanyInvitations(companyId: string) {
    return await prisma.invitation.findMany({
      where: { company_id: companyId },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })
  }

  // Send invitation email (configure based on your email service)
  private static async sendInvitationEmail(data: {
    to: string
    companyName: string
    inviterName: string
    role: UserRole
    token: string
  }) {
    // This is a basic example - replace with your email service configuration
    const { to, companyName, inviterName, role, token } = data
    
    const inviteUrl = `${process.env.NEXTAUTH_URL}/auth/accept-invitation?token=${token}`
    
    const subject = `You've been invited to join ${companyName}`
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Welcome to ${companyName}!</h2>
        <p>Hi there,</p>
        <p>You've been invited by <strong>${inviterName}</strong> to join <strong>${companyName}</strong> as a <strong>${role.toLowerCase().replace('_', ' ')}</strong>.</p>
        <p>To accept this invitation and create your account, click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${inviteUrl}</p>
        <p><strong>Important:</strong> This invitation will expire in 7 days.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `

    // TODO: Implement actual email sending
    // Example with nodemailer:
    // const transporter = nodemailer.createTransporter({ ... })
    // await transporter.sendMail({ to, subject, html })
    
    console.log('Invitation email would be sent to:', to)
    console.log('Invite URL:', inviteUrl)
  }
}
