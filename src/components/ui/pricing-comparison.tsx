"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { Card } from './card';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface Feature {
  name: string;
  individual: string | boolean;
  professional: string | boolean;
  enterprise: string | boolean;
  isAddOn?: boolean;
}

type PlanKey = 'BASIC' | 'PREMIUM' | 'ENTERPRISE'

interface ConfigResponse {
  planLimits: Record<PlanKey, {
    max_users: number;
    max_api_calls: number;
    included_languages?: string[];
    included_reminders?: number;
  }>;
  addonDisplay?: Record<string, { unit: string; monthlyByPlan?: Record<PlanKey, string>; monthly?: string }>;
}

export function PricingComparison() {
  const { t } = useTranslation();

  const [hoveredCol, setHoveredCol] = useState<"individual" | "professional" | "enterprise" | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  } as const;

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  } as const;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/config/plans');
        if (!res.ok) throw new Error('Failed to load plans config');
        const json: ConfigResponse = await res.json();
        if (mounted) setConfig(json);
      } catch (e) {
        // fail closed with no config; we will render fallback
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  const d = (config?.addonDisplay) || {};

  const features: Feature[] = (() => {
    // Base rows always present
    const baseRows: Feature[] = [
      { name: t('plan_compare_booking_calendar'), individual: true, professional: true, enterprise: true },
      { name: t('plan_compare_email_bot'), individual: true, professional: true, enterprise: true },
      { name: t('plan_compare_whatsapp_bot'), individual: true, professional: true, enterprise: true },
      { name: t('plan_compare_unified_inbox'), individual: true, professional: true, enterprise: true },
      { name: t('home_plan_feature_contact_management'), individual: true, professional: true, enterprise: true },
    ];

    // If config missing, render a minimal fallback
    if (!config) {
      return baseRows;
    }

    const fmt = (n: number) => (n === -1 ? '∞' : String(n));

    const limitsRows: Feature[] = [
      {
        name: t('plan_compare_users_label'),
        individual: fmt(config.planLimits.BASIC.max_users),
        professional: fmt(config.planLimits.PREMIUM.max_users),
        enterprise: fmt(config.planLimits.ENTERPRISE.max_users),
      },
      {
        name: (t('plan_compare_api_calls' as any) || 'Cupo de automatizaciones (API)'),
        individual: fmt(config.planLimits.BASIC.max_api_calls),
        professional: fmt(config.planLimits.PREMIUM.max_api_calls),
        enterprise: fmt(config.planLimits.ENTERPRISE.max_api_calls),
      },
      {
        name: (t('plan_compare_languages_included' as any) || 'Idiomas incluidos'),
        individual: (config.planLimits.BASIC.included_languages || ['ES']).join(', '),
        professional: (config.planLimits.PREMIUM.included_languages || ['ES', 'EN']).join(', '),
        enterprise: (config.planLimits.ENTERPRISE.included_languages || ['ES', 'EN', 'FR', 'DE', 'PT', 'IT', 'AR']).join(', '),
      },
      {
        name: (t('plan_compare_reminders_included' as any) || 'Recordatorios incluidos'),
        individual: String(config.planLimits.BASIC.included_reminders ?? ''),
        professional: String(config.planLimits.PREMIUM.included_reminders ?? ''),
        enterprise: String(config.planLimits.ENTERPRISE.included_reminders ?? ''),
      },
    ];

    // Add-ons: show prices directly (no extra '+ price' footnote)
    const addonRows: Feature[] = [
      {
        name: (t('plan_compare_add_users_label') || 'Usuarios extra') + ' (pack 5)',
        individual: d.EXTRA_USERS ? `${d.EXTRA_USERS.monthlyByPlan?.BASIC || d.EXTRA_USERS.monthly || ''}/${d.EXTRA_USERS.unit}`.replace(/^\//, '') : '-',
        professional: d.EXTRA_USERS ? `${d.EXTRA_USERS.monthlyByPlan?.PREMIUM || d.EXTRA_USERS.monthly || ''}/${d.EXTRA_USERS.unit}`.replace(/^\//, '') : '-',
        enterprise: d.EXTRA_USERS ? `${d.EXTRA_USERS.monthlyByPlan?.ENTERPRISE || d.EXTRA_USERS.monthly || ''}/${d.EXTRA_USERS.unit}`.replace(/^\//, '') : '-',
        isAddOn: true,
      },
      {
        name: (t('plan_compare_add_storage_label' as any) || 'Almacenamiento extra'),
        individual: d.EXTRA_STORAGE ? `${d.EXTRA_STORAGE.monthlyByPlan?.BASIC || d.EXTRA_STORAGE.monthly || ''}/${d.EXTRA_STORAGE.unit}`.replace(/^\//, '') : '-',
        professional: d.EXTRA_STORAGE ? `${d.EXTRA_STORAGE.monthlyByPlan?.PREMIUM || d.EXTRA_STORAGE.monthly || ''}/${d.EXTRA_STORAGE.unit}`.replace(/^\//, '') : '-',
        enterprise: d.EXTRA_STORAGE ? `${d.EXTRA_STORAGE.monthlyByPlan?.ENTERPRISE || d.EXTRA_STORAGE.monthly || ''}/${d.EXTRA_STORAGE.unit}`.replace(/^\//, '') : '-',
        isAddOn: true,
      },
      {
        name: (t('plan_compare_add_api_calls_label' as any) || 'Cupo extra de automatizaciones (API)'),
        individual: d.API_CALLS ? `${d.API_CALLS.monthlyByPlan?.BASIC || d.API_CALLS.monthly || ''}/${d.API_CALLS.unit}`.replace(/^\//, '') : '-',
        professional: d.API_CALLS ? `${d.API_CALLS.monthlyByPlan?.PREMIUM || d.API_CALLS.monthly || ''}/${d.API_CALLS.unit}`.replace(/^\//, '') : '-',
        enterprise: d.API_CALLS ? `${d.API_CALLS.monthlyByPlan?.ENTERPRISE || d.API_CALLS.monthly || ''}/${d.API_CALLS.unit}`.replace(/^\//, '') : '-',
        isAddOn: true,
      },
      {
        name: (t('plan_compare_custom_branding' as any) || 'Custom branding'),
        individual: d.CUSTOM_BRANDING ? `${d.CUSTOM_BRANDING.monthlyByPlan?.BASIC || d.CUSTOM_BRANDING.monthly || ''}`.replace(/^\//, '') : '-',
        professional: t('plan_compare_included' as any) || 'Incluido',
        enterprise: t('plan_compare_included' as any) || 'Incluido',
        isAddOn: true,
      },
    ];

    const curatedRows: Feature[] = [
      { name: t('plan_compare_call_bot'), individual: false, professional: true, enterprise: true },
      { name: t('plan_compare_call_transfer'), individual: false, professional: true, enterprise: true },
      { name: t('plan_compare_call_recording'), individual: false, professional: false, enterprise: true },
      { name: t('plan_compare_custom_embed_chat'), individual: false, professional: false, enterprise: true },
      { name: t('plan_compare_staff_mgmt'), individual: false, professional: false, enterprise: true },
      { name: t('plan_compare_task_mgmt_team'), individual: false, professional: false, enterprise: true },
      { name: t('plan_compare_advanced_call_analytics'), individual: false, professional: false, enterprise: true },
    ];

    return [
      ...baseRows,
      ...limitsRows,
      ...addonRows,
      ...curatedRows,
      { name: t('plan_compare_support'), individual: t('plan_compare_support_mail'), professional: t('plan_compare_support_whatsapp_mail'), enterprise: t('plan_compare_support_phone_whatsapp_mail') },
    ];
  })();

  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <Card className="border border-t-0 rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 text-sm text-muted-foreground">Cargando planes…</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Card className="border border-t-0 rounded-xl shadow-sm overflow-hidden">
        <motion.div
          className="min-w-[860px]"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Plans Header */}
          <motion.div variants={rowVariants} className="grid grid-cols-4 bg-primary text-primary-foreground p-4 rounded-t-xl">
            <div></div>
            <div className="font-bold text-center text-lg">{t('home_plan_individual_name')}</div>
            <div className="font-bold text-center text-lg flex items-center justify-center gap-2">
              <span>{t('home_plan_professional_name')}</span>
              <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-primary-foreground/20 text-primary-foreground/90 border border-primary-foreground/30">
                {t('home_plan_most_popular')}
              </span>
            </div>
            <div className="font-bold text-center text-lg">{t('home_plan_enterprise_name')}</div>
          </motion.div>
          {/* Pricing Row */}
          <motion.div variants={rowVariants} className="grid grid-cols-4 bg-muted/50 p-5 border-b">
            <div className="font-semibold text-sm">{t('plan_compare_features_label')}</div>
            <div className="font-semibold text-sm text-center">{t('plan_compare_price_individual')}</div>
            <div className="font-semibold text-sm text-center">{t('plan_compare_price_professional')}</div>
            <div className="font-semibold text-sm text-center">{t('plan_compare_price_enterprise')}</div>
          </motion.div>

          {/* Features */}
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={rowVariants}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
              className={cn(
                "group grid grid-cols-4 py-4 px-5 border-b transition-colors",
                index % 2 === 0 ? "bg-muted/20" : "bg-card",
                hoveredRow === index ? "bg-primary/5" : ""
              )}
            >
              <div className="flex flex-col justify-center">
                {feature.name.includes("(") ? (
                  <>
                    <span className="font-medium">{feature.name.split("(")[0].trim()}</span>
                    <span className="text-sm text-muted-foreground">({feature.name.split("(")[1]}</span>
                  </>
                ) : (
                  <span className="font-medium">{feature.name}</span>
                )}
                {feature.isAddOn && (
                  <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-xs font-medium">
                    {t('plan_compare_addon_badge')}
                  </span>
                )}
              </div>

              {["individual", "professional", "enterprise"].map((plan) => (
                <motion.div
                  key={plan}
                  onMouseEnter={() => setHoveredCol(plan as typeof hoveredCol)}
                  onMouseLeave={() => setHoveredCol(null)}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.3 }}
                  className={cn(
                    "flex flex-col items-center justify-center text-center px-2 py-1 rounded-md transition-all",
                    plan === "professional" ? "bg-primary/5 ring-1 ring-primary/20" : "",
                    hoveredCol === plan ? "bg-primary/10 ring-2 ring-primary/40 shadow-sm" : ""
                  )}
                >
                  {(() => {
                    const value = feature[plan as keyof Feature];
                    if (typeof value === "boolean") {
                      return value ? (
                        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.18 }}>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </motion.div>
                      ) : (
                        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.18 }}>
                          <X className="h-5 w-5 text-red-500" />
                        </motion.div>
                      );
                    }
                    return (
                      <div className="flex flex-col gap-0.5">
                        {String(value).split('\n').map((line, i) => (
                          <span key={i} className={i === 1 ? "text-sm text-muted-foreground" : ""}>
                            {line}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </motion.div>
              ))}
            </motion.div>
          ))}
        </motion.div>
      </Card>
    </div>
  );
}
