
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, Bot, Globe, DraftingCompass, Send, MapPin, Phone, ShieldCheck, Clock, Star, Users, TrendingUp, Zap, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { useState, useEffect } from 'react';
import { toast } from "sonner"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { PricingComparison } from '@/components/ui/pricing-comparison';
import { FloatingChatWidget } from '@/components/ui/floating-chat-widget';
import { BackToTop } from '@/components/ui/back-to-top';



const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
};

export default function LandingPage() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CalendarIA",
    "description": "AI-powered business calendar and communication assistant that automates scheduling, manages customer interactions, and streamlines business operations.",
    "url": "https://calendaria.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "EUR",
      "lowPrice": "19",
      "highPrice": "299",
      "offerCount": "3"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "features": [
      "AI-powered scheduling assistant",
      "Unified communication inbox",
      "Multi-language support",
      "WhatsApp and email integration",
      "Call management and analytics",
      "Team collaboration tools"
    ]
  };


  const features = [
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: t('home_conversational_assistant_title'),
      description: t('home_conversational_assistant_desc'),
    },
    {
      icon: <Mail className="h-8 w-8 text-primary" />,
      title: t('home_unified_inbox_title'),
      description: t('home_unified_inbox_desc'),
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: t('home_total_control_title'),
      description: t('home_total_control_desc'),
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: t('home_language_support_title'),
      description: t('home_language_support_desc'),
    },
    {
      icon: <DraftingCompass className="h-8 w-8 text-primary" />,
      title: t('home_full_customization_title'),
      description: t('home_full_customization_desc'),
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: t('home_time_tracking_title'),
      description: t('home_time_tracking_desc'),
    },
  ];

  const whoIsItFor = [
    { name: t('home_whoitsfor_item2'), icon: <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" /> },
    { name: t('home_whoitsfor_item4'), icon: <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" /> },
    { name: t('home_whoitsfor_item3'), icon: <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" /> },
    { name: t('home_whoitsfor_item1'), icon: <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" /> },
    { name: t('home_whoitsfor_item6'), icon: <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" /> },
    { name: t('home_whoitsfor_item7'), icon: <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" /> },
    { name: t('home_whoitsfor_item5'), icon: <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" /> },
  ];

  const plans = [
    {
      name: t('home_plan_individual_name'),
      price: '€19',
      priceSuffix: '/mo',
      addOnBadge: t('plan_compare_addon_badge'),
      features: [
        t('plan_feature_from_1_user'),
        t('plan_feature_2gb_storage'),
        t('plan_compare_booking_calendar'),
        t('plan_compare_email_bot'),
        t('plan_compare_unified_inbox'),
        t('plan_feature_50_reminders'),
        t('plan_feature_language_es'),
        t('plan_feature_5000_automatizations'),
        t('plan_feature_support_email')
      ],
      cta: t('home_plan_individual_cta'),
      href: '/auth/signup-mt?plan=user',
    },
    {
      name: t('home_plan_professional_name'),
      price: '€99',
      priceSuffix: '/mo',
      addOnBadge: t('plan_compare_addon_badge'),
      features: [
        t('plan_feature_from_20_users'),
        t('plan_feature_5gb_storage'),
        t('plan_compare_booking_calendar'),
        t('plan_compare_email_bot'),
        t('plan_compare_call_bot'),
        t('plan_compare_call_transfer'),
        t('plan_feature_200_reminders'),
        t('plan_feature_language_es_en'),
        t('plan_feature_25000_automatizations'),
        t('plan_feature_support_whatsapp_email')
      ],
      cta: t('home_plan_professional_cta'),
      href: '/auth/signup-mt?plan=professional',
      popular: true,
    },
    {
      name: t('home_plan_enterprise_name'),
      price: '€299',
      priceSuffix: '/mo',
      addOnBadge: t('plan_compare_addon_badge'),
      features: [
        t('plan_feature_from_50_users'),
        t('plan_feature_10gb_storage'),
        t('plan_compare_call_bot'),
        t('plan_compare_booking_calendar'),
        t('plan_compare_advanced_call_analytics'),
        t('home_plan_feature_admin_controls'),
        t('home_plan_feature_full_customization'),
        t('plan_compare_call_recording'),
        t('plan_compare_custom_embed_chat'),
        t('plan_compare_staff_mgmt'),
        t('plan_compare_task_mgmt_team'),
        t('plan_feature_1000_reminders'),
        t('plan_feature_language_all'),
        t('plan_feature_infinite_automatizations'),
        t('plan_feature_support_phone_whatsapp_email')
      ],
      cta: t('home_plan_enterprise_cta'),
      href: '/auth/signup-mt?plan=enterprise',
    },
  ];

  // Estadísticas del producto
  const stats = [
    { icon: <Users className="h-8 w-8 text-primary" />, value: "10,000+", label: t('stats_active_users') },
    { icon: <Clock className="h-8 w-8 text-primary" />, value: "50,000+", label: t('stats_hours_saved') },
    { icon: <TrendingUp className="h-8 w-8 text-primary" />, value: "98%", label: t('stats_satisfaction') },
    { icon: <Zap className="h-8 w-8 text-primary" />, value: "24/7", label: t('stats_uptime') }
  ];

  // Testimonios de clientes
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart Inc.",
      image: "https://placehold.co/80x80.png",
      content: t('testimonial_1_content'),
      rating: 5
    },
    {
      name: "Miguel Rodriguez",
      role: "Operations Manager, Global Corp",
      image: "https://placehold.co/80x80.png",
      content: t('testimonial_2_content'),
      rating: 5
    },
    {
      name: "Emma Chen",
      role: "Project Director, Innovation Labs",
      image: "https://placehold.co/80x80.png",
      content: t('testimonial_3_content'),
      rating: 5
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: t('faq_1_question'),
      answer: t('faq_1_answer')
    },
    {
      question: t('faq_2_question'),
      answer: t('faq_2_answer')
    },
    {
      question: t('faq_3_question'),
      answer: t('faq_3_answer')
    },
    {
      question: t('faq_4_question'),
      answer: t('faq_4_answer')
    },
    {
      question: t('faq_5_question'),
      answer: t('faq_5_answer')
    }
  ];

  // Integraciones populares
  const integrations = [
    { name: "Google Calendar", logo: "https://placehold.co/120x60.png" },
    { name: "Microsoft Outlook", logo: "https://placehold.co/120x60.png" },
    { name: "Slack", logo: "https://placehold.co/120x60.png" },
    { name: "Zoom", logo: "https://placehold.co/120x60.png" },
    { name: "WhatsApp Business", logo: "https://placehold.co/120x60.png" },
    { name: "Zapier", logo: "https://placehold.co/120x60.png" }
  ];

  // Empresas que confían en nosotros
  const trustedCompanies = [
    { name: "TechCorp", logo: "https://placehold.co/160x80.png" },
    { name: "InnovateInc", logo: "https://placehold.co/160x80.png" },
    { name: "GlobalSolutions", logo: "https://placehold.co/160x80.png" },
    { name: "FutureWorks", logo: "https://placehold.co/160x80.png" },
    { name: "SmartBusiness", logo: "https://placehold.co/160x80.png" },
    { name: "NextGenCorp", logo: "https://placehold.co/160x80.png" }
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*\#/, '');
    const elem = document.getElementById(targetId);
    
    if (elem) {
        const smoothScrollToElement = (element: HTMLElement, duration: number, offset: number = 0) => {
            const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime: number | null = null;
        
            const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            };
        
            const animation = (currentTime: number) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            };
        
            requestAnimationFrame(animation);
        }
        // h-16 = 4rem = 64px offset for the sticky header
        smoothScrollToElement(elem, 1000, 64);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual contact form submission logic
    console.log({ name, email, company, message });
    toast.success("Message Sent!", {
      description: "Thank you for contacting us. We'll get back to you shortly."
    });
    setName('');
    setEmail('');
    setCompany('');
    setMessage('');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription logic
    console.log({ newsletterEmail });
    toast.success("Subscribed!", {
      description: "You've been subscribed to our newsletter."
    });
    setNewsletterEmail('');
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  
  const pageBackgroundStyle = isMounted ? {
    backgroundImage: `
      radial-gradient(ellipse farthest-corner at 20% 80%, hsla(var(--primary) / ${theme === 'dark' ? 0.35 : 0.25}), transparent 60%), 
      radial-gradient(ellipse farthest-corner at 80% 30%, hsla(var(--accent) / ${theme === 'dark' ? 0.35 : 0.25}), transparent 60%),
      radial-gradient(ellipse farthest-corner at 40% 40%, hsla(var(--primary) / ${theme === 'dark' ? 0.18 : 0.15}), transparent 70%),
      radial-gradient(ellipse farthest-corner at 60% 10%, hsla(var(--accent) / ${theme === 'dark' ? 0.22 : 0.18}), transparent 75%),
      radial-gradient(ellipse farthest-corner at 10% 40%, hsla(263, 70%, 50% / ${theme === 'dark' ? 0.15 : 0.12}), transparent 80%),
      radial-gradient(ellipse farthest-corner at 90% 70%, hsla(271, 91%, 65% / ${theme === 'dark' ? 0.12 : 0.1}), transparent 85%)
    `,
  } : {};

  return (
    <div className="flex min-h-screen flex-col">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      <PublicHeader />
      <main className="flex-1">
        <div className="flex flex-col items-center relative" style={pageBackgroundStyle}>
          {/* Overlay de efectos adicionales */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-600/8 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.1),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.08),transparent_50%)] pointer-events-none" />
          
          {/* Hero Section */}
          <section className="w-full py-20 md:py-24 relative z-10" id="hero-section">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
              <motion.div 
                className="text-center md:text-left"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                    {t('home_hero_title')}
                  </span>
                </h1>
                <p className="mt-6 text-lg text-muted-foreground">
                  {t('home_hero_description')}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                  <Button size="lg" className="bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 border-0" asChild>
                    <Link href="/auth/signup-mt">{t('home_hero_cta_get_started')}</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-300" asChild>
                    <Link href="/auth/login-mt">{t('login')}</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-accent/30 text-accent hover:border-accent/50 hover:bg-accent/10 hover:text-accent transition-all duration-300" asChild>
                    <Link href="#features" onClick={handleScroll}>{t('learn_more')}</Link>
                  </Button>
                </div>
              </motion.div>
               <motion.div 
                className="relative h-64 md:h-auto w-full max-w-lg mx-auto aspect-square rounded-xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
               >
                 <Image src="https://placehold.co/600x600.png" alt="Friendly assistant robot" layout="fill" objectFit="cover" data-ai-hint="friendly robot" className="rounded-xl"/>
              </motion.div>
            </div>
          </section>

          {/* How it Works Section - NOW FEATURES */}
          <motion.section 
            id="features"
            className="w-full py-16 md:py-24 scroll-mt-28 relative z-10"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">{t('home_howitworks_title')}</h2>
              
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">1</div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2">{t('home_howitworks_step1_title')}</h3>
                    <p className="text-muted-foreground">{t('home_howitworks_step1_desc')}</p>
                  </div>
                  <motion.div 
                      className="relative h-48 w-full max-w-xs mx-auto rounded-lg overflow-hidden shadow-md mt-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                  >
                      <Image 
                          src="https://placehold.co/300x200.png" 
                          alt="Step 1: Connect your accounts" 
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint="connect accounts"
                          className="rounded-lg"
                      />
                  </motion.div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">2</div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2">{t('home_howitworks_step2_title')}</h3>
                    <p className="text-muted-foreground">{t('home_howitworks_step2_desc')}</p>
                  </div>
                  <motion.div 
                      className="relative h-48 w-full max-w-xs mx-auto rounded-lg overflow-hidden shadow-md mt-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                  >
                      <Image 
                          src="https://placehold.co/300x200.png" 
                          alt="Step 2: Let AI do the work" 
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint="ai working"
                          className="rounded-lg"
                      />
                  </motion.div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">3</div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2">{t('home_howitworks_step3_title')}</h3>
                    <p className="text-muted-foreground">{t('home_howitworks_step3_desc')}</p>
                  </div>
                  <motion.div 
                      className="relative h-48 w-full max-w-xs mx-auto rounded-lg overflow-hidden shadow-md mt-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      viewport={{ once: true }}
                  >
                      <Image 
                          src="https://placehold.co/300x200.png" 
                          alt="Step 3: Review and adjust" 
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint="user dashboard"
                          className="rounded-lg"
                      />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Features Section - NOW 6 CARDS */}
          <motion.section 
            className="w-full py-16 md:py-24 relative z-10"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 leading-loose">
                {t('home_features_title_line1')}<br/>{t('home_features_title_line2')}
              </h2>
              <p className="text-center text-muted-foreground text-lg mb-12 md:mb-16 max-w-3xl mx-auto">
                {t('home_features_description')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, i) => (
                  <motion.div 
                    key={feature.title}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                      <Card className="group relative flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-primary/10 hover:border-primary/20 bg-gradient-to-br from-card via-card to-card/95 hover:from-primary/8 hover:via-accent/6 hover:to-accent/8">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/6 to-accent/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                        <div className="relative z-10 p-4 rounded-full bg-gradient-to-br from-primary/20 via-primary/15 to-accent/20 mb-4 group-hover:scale-110 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300 shadow-md">
                          {feature.icon}
                        </div>
                        <div className="relative z-10 w-full text-center space-y-2">
                          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                          <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">{feature.description}</p>
                        </div>
                      </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Pricing Section */}
          <motion.section 
            id="pricing" 
            className="w-full py-16 md:py-24 scroll-mt-28 relative z-10"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">{t('home_pricing_title')}</h2>
              <p className="text-center text-muted-foreground mb-12 md:mb-16 max-w-2xl mx-auto">
                {t('home_pricing_desc')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {plans.map((plan: { name: string; price: string; priceSuffix: string; features: string[]; cta: string; href: string; popular?: boolean; disabled?: boolean; addOnBadge?: string }) => (
                  <Card key={plan.name} className={cn(
                    'flex flex-col shadow-lg transition-shadow duration-300',
                    plan.popular && !plan.disabled ? 'border-2 border-primary relative' : '',
                    plan.disabled ? 'grayscale cursor-not-allowed opacity-60' : 'hover:shadow-xl'
                  )}>
                    {plan.popular && !plan.disabled && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">{t('home_plan_most_popular')}</div>}
                    
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                      <div className="mt-2 flex flex-col items-center justify-center">
                        <p className="text-4xl font-bold text-primary">
                          {plan.price}<span className="text-lg font-normal text-muted-foreground">{plan.priceSuffix}</span>
                        </p>
                        {plan.addOnBadge && (
                          <div className="mt-2 inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 ring-1 ring-inset ring-yellow-500/20">
                            <span className="flex items-center">
                              {plan.addOnBadge}
                            </span>
                          </div>
                        )}
                        {plan.disabled && (
                          <p className="text-sm font-semibold text-muted-foreground mt-1">{t('home_plan_coming_soon_cta')}</p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <ul className="space-y-3">
                        {plan.features.map((feature: string) => (
                          <li key={feature} className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                       <Button 
                        className={`w-full ${plan.popular && !plan.disabled ? 'bg-primary hover:bg-primary/90' : 'bg-accent hover:bg-accent/90 text-accent-foreground'}`} 
                        asChild={!plan.disabled}
                        disabled={plan.disabled}
                      >
                        {plan.disabled ? (
                          <span>{plan.cta}</span>
                        ) : (
                          <Link href={plan.href}>{plan.cta}</Link>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="mt-16">
                <h3 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
                  {t('home_pricing_comparison_title')} <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 text-[0.95em] font-semibold ring-1 ring-inset ring-amber-500/20">{t('plan_compare_addon_badge')}</span>
                </h3>
                <PricingComparison />
              </div>

              {/* Tailored solution block intentionally removed per request */}
            </div>
          </motion.section>

           {/* Who it's for section */}
            <motion.section 
                className="w-full py-16 md:py-24 relative z-10"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative aspect-video rounded-xl shadow-xl overflow-hidden">
                           <Image
                              src="https://placehold.co/1200x675.png"
                              alt="Professionals using CalendarIA"
                              layout="fill"
                              objectFit="cover"
                              data-ai-hint="professionals meeting"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('home_whoitsfor_title')}</h2>
                            <p className="text-muted-foreground mb-8">
                                {t('home_whoitsfor_desc')}
                            </p>
                            <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
                                {whoIsItFor.map((item) => (
                                    <li key={item.name} className="flex items-center text-foreground">
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.section>

          {/* Statistics Section */}
          <motion.section 
            className="w-full py-16 md:py-24 relative z-10 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">{t('stats_title')}</h2>
              <p className="text-center text-muted-foreground mb-12 md:mb-16 max-w-2xl mx-auto">
                {t('stats_description')}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex justify-center mb-4">
                      {stat.icon}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Social Proof Section */}
          <motion.section 
            className="w-full py-12 md:py-16 relative z-10"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="container mx-auto px-4">
              <h3 className="text-xl md:text-2xl font-semibold text-center text-muted-foreground mb-8">
                {t('social_proof_title')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60 hover:opacity-80 transition-opacity duration-300">
                {trustedCompanies.map((company, i) => (
                  <motion.div 
                    key={company.name}
                    className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Image
                      src={company.logo}
                      alt={company.name}
                      width={160}
                      height={80}
                      className="max-w-full h-auto"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Demo Video Section */}
          <motion.section 
            className="w-full py-16 md:py-24 relative z-10"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('demo_title')}</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {t('demo_description')}
                </p>
              </div>
              <div className="relative max-w-4xl mx-auto">
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                  {!isVideoPlaying ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer" onClick={() => setIsVideoPlaying(true)}>
                      <div className="bg-white rounded-full p-6 shadow-lg hover:scale-110 transition-transform duration-300">
                        <Play className="h-12 w-12 text-primary ml-1" />
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  <Image
                    src="https://placehold.co/1200x675.png"
                    alt="Product Demo"
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="product demo"
                    className={`${isVideoPlaying ? 'hidden' : 'block'}`}
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Testimonials Section */}
          <motion.section 
            className="w-full py-16 md:py-24 relative z-10 bg-gradient-to-br from-accent/5 via-primary/5 to-accent/5"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">{t('testimonials_title')}</h2>
              <p className="text-center text-muted-foreground mb-12 md:mb-16 max-w-2xl mx-auto">
                {t('testimonials_description')}
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, i) => (
                  <motion.div 
                    key={testimonial.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="flex items-center space-x-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                        <div className="flex items-center">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            width={50}
                            height={50}
                            className="rounded-full mr-4"
                          />
                          <div>
                            <div className="font-semibold text-foreground">{testimonial.name}</div>
                            <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Integrations Section */}
          <motion.section 
            className="w-full py-16 md:py-24 relative z-10"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">{t('integrations_title')}</h2>
              <p className="text-center text-muted-foreground mb-12 md:mb-16 max-w-2xl mx-auto">
                {t('integrations_description')}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
                {integrations.map((integration, i) => (
                  <motion.div 
                    key={integration.name}
                    className="flex items-center justify-center p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow duration-300"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Image
                      src={integration.logo}
                      alt={integration.name}
                      width={120}
                      height={60}
                      className="max-w-full h-auto opacity-70 hover:opacity-100 transition-opacity duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* FAQ Section */}
          <motion.section 
            className="w-full py-16 md:py-24 relative z-10 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">{t('faq_title')}</h2>
              <p className="text-center text-muted-foreground mb-12 md:mb-16 max-w-2xl mx-auto">
                {t('faq_description')}
              </p>
              <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="shadow-lg">
                      <CardHeader 
                        className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                        onClick={() => toggleFaq(i)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                          {openFaq === i ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                      {openFaq === i && (
                        <CardContent>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Newsletter Section */}
          <motion.section 
            className="w-full py-16 md:py-24 relative z-10"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('newsletter_title')}</h2>
                <p className="text-muted-foreground mb-8">
                  {t('newsletter_description')}
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder={t('newsletter_email_placeholder')}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {t('newsletter_subscribe_button')}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-4">
                  {t('newsletter_privacy_note')}
                </p>
              </div>
            </div>
          </motion.section>

          {/* Contact Section */}
           <motion.section 
            id="contact" 
            className="w-full py-16 md:py-24 scroll-mt-0 relative z-10"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
           >
            <div className="container mx-auto px-4">
               <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{t('home_contact_title')}</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t('home_contact_desc')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-start">
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">{t('home_contact_form_title')}</CardTitle>
                    <CardDescription>{t('home_contact_form_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-name">{t('home_contact_form_name_label')}</Label>
                          <Input id="contact-name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-email">{t('home_contact_form_email_label')}</Label>
                          <Input id="contact-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-company">{t('home_contact_form_company_label')}</Label>
                        <Input id="contact-company" placeholder="Your Company LLC" value={company} onChange={(e) => setCompany(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-message">{t('home_contact_form_message_label')}</Label>
                        <Textarea id="contact-message" placeholder={t('home_contact_form_message_label')} value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} />
                      </div>
                      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3">
                        <Send className="mr-2 h-5 w-5" /> {t('home_contact_form_cta')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-8">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl">{t('home_contact_info_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 mr-3 mt-1 text-primary shrink-0" />
                        <div>
                          <strong>{t('home_contact_info_email')}:</strong><br />
                          <a href="mailto:support@calendaria-ai.app" className="hover:text-primary">support@calendaria-ai.app</a>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 mr-3 mt-1 text-primary shrink-0" />
                        <div>
                          <strong>{t('home_contact_info_phone')}:</strong><br />
                          <a href="tel:+15551234567" className="hover:text-primary">+1 (555) 123-4567</a> (Mon-Fri, 9am-5pm EST)
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-3 mt-1 text-primary shrink-0" />
                        <div>
                          <strong>{t('home_contact_info_address')}:</strong><br />
                          <a href="https://www.google.com/maps/search/?api=1&query=123%20Innovation%20Drive%2C%20Tech%20City%2C%20CA%2094000%2C%20USA" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                            123 Innovation Drive, Tech City, CA 94000, USA
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
           </motion.section>

          {/* CTA Section */}
          <section className="relative w-full py-16 md:py-24 overflow-hidden z-10">
            {/* Decorative background for CTA */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-50"></div>
            <div className="relative container mx-auto px-4 text-center z-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {t('home_final_cta_title')}
                </span>
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
                {t('home_final_cta_desc')}
              </p>
              <Button size="lg" asChild className="bg-gradient-to-r from-accent via-accent to-primary hover:from-accent/90 hover:via-accent/80 hover:to-primary/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/auth/signup-mt">{t('home_final_cta_button')}</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
      <FloatingChatWidget />
      <BackToTop />
    </div>
  );
}
