/*
  Warnings:

  - You are about to drop the column `subscription_plan` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_status` on the `companies` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[slug]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[domain]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subdomain]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verification_token]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subscriptionId]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."SubscriptionPlan" AS ENUM ('BASIC', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'UNPAID', 'PAUSED');

-- CreateEnum
CREATE TYPE "public"."BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "public"."AddonType" AS ENUM ('EXTRA_USERS', 'EXTRA_STORAGE', 'API_CALLS', 'INTEGRATIONS', 'CUSTOM_BRANDING');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'USER');

-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "public"."UsageResource" AS ENUM ('USER_COUNT', 'STORAGE', 'API_CALLS', 'BOOKINGS', 'SERVICES', 'INTEGRATIONS');

-- AlterTable
ALTER TABLE "public"."companies" DROP COLUMN "subscription_plan",
DROP COLUMN "subscription_status",
ADD COLUMN     "address" JSONB,
ADD COLUMN     "branding" JSONB,
ADD COLUMN     "current_storage" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "current_users" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "monthly_api_calls" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "subdomain" TEXT,
ADD COLUMN     "subscriptionId" TEXT,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC',
ADD COLUMN     "verification_token" TEXT;

-- Update existing companies with generated slugs
UPDATE "public"."companies" SET "slug" = LOWER(REPLACE("name", ' ', '-')) || '-' || SUBSTRING("id", 1, 8) WHERE "slug" IS NULL;

-- Now make slug required
ALTER TABLE "public"."companies" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable (Users with data preservation)
ALTER TABLE "public"."users" ADD COLUMN     "department" TEXT,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "job_title" TEXT,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "last_seen_at" TIMESTAMP(3),
ADD COLUMN     "login_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "permissions" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "preferences" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role_new" "public"."UserRole";

-- Update existing roles to new enum values
UPDATE "public"."users" SET "role_new" = 
  CASE 
    WHEN "role" = 'super_admin' THEN 'SUPER_ADMIN'::"public"."UserRole"
    WHEN "role" = 'admin' THEN 'ADMIN'::"public"."UserRole"
    WHEN "role" = 'manager' THEN 'MANAGER'::"public"."UserRole"
    WHEN "role" = 'employee' THEN 'EMPLOYEE'::"public"."UserRole"
    ELSE 'USER'::"public"."UserRole"
  END;

-- Drop old role column and rename new one
ALTER TABLE "public"."users" DROP COLUMN "role";
ALTER TABLE "public"."users" RENAME COLUMN "role_new" TO "role";
ALTER TABLE "public"."users" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'USER'::"public"."UserRole";

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "stripe_product_id" TEXT,
    "plan" "public"."SubscriptionPlan" NOT NULL DEFAULT 'BASIC',
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "billing_cycle" "public"."BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "unit_amount" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "max_users" INTEGER NOT NULL DEFAULT 1,
    "max_storage" BIGINT NOT NULL DEFAULT 1073741824,
    "max_api_calls" INTEGER NOT NULL DEFAULT 1000,
    "max_projects" INTEGER,
    "max_integrations" INTEGER,
    "features" JSONB NOT NULL DEFAULT '{}',
    "trial_start" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "canceled_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "last_usage_reset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_addons" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "addon_type" "public"."AddonType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit_amount" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "stripe_price_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "stripe_invoice_id" TEXT,
    "invoice_number" TEXT NOT NULL,
    "amount_due" INTEGER NOT NULL,
    "amount_paid" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "invoice_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "line_items" JSONB NOT NULL,
    "billing_details" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invitations" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "department" TEXT,
    "job_title" TEXT,
    "token" TEXT NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invited_by" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usage_logs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "resource" "public"."UsageResource" NOT NULL,
    "amount" INTEGER NOT NULL,
    "metadata" JSONB,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" TEXT NOT NULL,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resource_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_keys" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "scopes" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "last_used" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook_endpoints" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" JSONB NOT NULL DEFAULT '[]',
    "secret" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "last_success" TIMESTAMP(3),
    "last_failure" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook_deliveries" (
    "id" TEXT NOT NULL,
    "endpoint_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "response_status" INTEGER,
    "response_body" TEXT,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3),

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_companyId_key" ON "public"."subscriptions"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_customer_id_key" ON "public"."subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "public"."subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripe_invoice_id_key" ON "public"."invoices"("stripe_invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "public"."invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "public"."invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_company_id_email_key" ON "public"."invitations"("company_id", "email");

-- CreateIndex
CREATE INDEX "usage_logs_company_id_date_idx" ON "public"."usage_logs"("company_id", "date");

-- CreateIndex
CREATE INDEX "usage_logs_company_id_period_idx" ON "public"."usage_logs"("company_id", "period");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "public"."activity_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_action_created_at_idx" ON "public"."activity_logs"("action", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "public"."api_keys"("key_hash");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "public"."companies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "companies_domain_key" ON "public"."companies"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "companies_subdomain_key" ON "public"."companies"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "companies_verification_token_key" ON "public"."companies"("verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "companies_subscriptionId_key" ON "public"."companies"("subscriptionId");

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_addons" ADD CONSTRAINT "subscription_addons_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usage_logs" ADD CONSTRAINT "usage_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_keys" ADD CONSTRAINT "api_keys_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "public"."webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
