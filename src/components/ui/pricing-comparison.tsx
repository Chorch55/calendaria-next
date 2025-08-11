"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { Card } from './card';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface Feature {
  name: string;
  individual: string | boolean | number;
  professional: string | boolean | number;
  enterprise: string | boolean | number;
  isAddOn?: boolean;
  addOnPrice?: {
    individual?: string;
    professional?: string;
    enterprise?: string;
  };
}

export function PricingComparison() {
  const { t } = useTranslation();

  const [hoveredCol, setHoveredCol] = useState<"individual" | "professional" | "enterprise" | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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

  const features: Feature[] = [
    // Base features
    { name: t('plan_compare_booking_calendar'), individual: true, professional: true, enterprise: true },
    { name: t('plan_compare_email_bot'), individual: true, professional: true, enterprise: true },
    { name: t('plan_compare_whatsapp_bot'), individual: true, professional: true, enterprise: true },
    { name: t('home_plan_feature_contact_management'), individual: true, professional: true, enterprise: true },
    { name: t('plan_compare_unified_inbox'), individual: true, professional: true, enterprise: true },
    // Capacity & scalability
    { name: t('plan_compare_users_label'), individual: '1', professional: '20', enterprise: '50' },
    {
      name: t('plan_compare_add_users_label'),
      individual: t('plan_compare_add_users_individual'),
      professional: t('plan_compare_add_users_professional'),
      enterprise: t('plan_compare_add_users_enterprise'),
      isAddOn: true,
    },
    // Differentiators
    { name: t('plan_compare_call_bot'), individual: false, professional: true, enterprise: true, isAddOn: true, addOnPrice: { individual: '10€' } },
    { name: t('plan_compare_call_transfer'), individual: false, professional: true, enterprise: true },
    // Value add
    { name: t('plan_compare_reminders'), individual: t('plan_compare_messages_50'), professional: t('plan_compare_messages_200'), enterprise: t('plan_compare_messages_1000'), addOnPrice: { individual: '0.05€/U', professional: '0.03€/U', enterprise: '0.015€/U' } },
    { name: t('plan_compare_multilanguage'), individual: t('plan_compare_multilang_individual'), professional: t('plan_compare_multilang_professional'), enterprise: t('plan_compare_multilang_enterprise'), isAddOn: true },
    // Enterprise premium
    { name: t('plan_compare_call_recording'), individual: false, professional: false, enterprise: true, isAddOn: true, addOnPrice: { individual: '15€', professional: '10€' } },
    { name: t('plan_compare_custom_embed_chat'), individual: false, professional: false, enterprise: true, isAddOn: true, addOnPrice: { individual: '10€', professional: '5€' } },
    { name: t('plan_compare_staff_mgmt'), individual: false, professional: false, enterprise: true, isAddOn: true, addOnPrice: { individual: '20€', professional: '20€' } },
    { name: t('plan_compare_task_mgmt_team'), individual: false, professional: false, enterprise: true, isAddOn: true, addOnPrice: { individual: '', professional: '20€' } },
    { name: t('plan_compare_staff_stats_realtime'), individual: false, professional: false, enterprise: true, isAddOn: true, addOnPrice: { individual: '', professional: '25€' } },
    { name: t('plan_compare_advanced_call_analytics'), individual: false, professional: false, enterprise: true, isAddOn: true, addOnPrice: { individual: '', professional: '25€' } },
    // Support
    { name: t('plan_compare_support'), individual: t('plan_compare_support_mail'), professional: t('plan_compare_support_whatsapp_mail'), enterprise: t('plan_compare_support_phone_whatsapp_mail') },
  ];

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
                    const value = feature[plan as keyof typeof feature];
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
                  {feature.addOnPrice && feature.addOnPrice[plan as keyof typeof feature.addOnPrice] && (
                    <span className="text-xs text-muted-foreground mt-1">
                      +{feature.addOnPrice[plan as keyof typeof feature.addOnPrice]}
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ))}
        </motion.div>
      </Card>
    </div>
  );
}
