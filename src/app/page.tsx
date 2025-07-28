
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, Bot, Globe, DraftingCompass, Send, MapPin, Phone, ShieldCheck, Clock, Moon, Sun, Briefcase, User } from 'lucide-react';
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
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


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
      features: [
        t('home_plan_feature_1_user'), 
        t('home_plan_feature_email_whatsapp'),
        t('home_plan_feature_calendar_management'),
        t('home_plan_feature_task_management'),
        t('home_plan_feature_contact_management'),
        t('home_plan_feature_ai_basic')
      ],
      cta: t('home_plan_individual_cta'),
      href: '/auth/signup?plan=user',
    },
    {
      name: t('home_plan_small_team_name'),
      price: '€99',
      priceSuffix: '/mo',
      features: [
        t('home_plan_feature_10_users'), 
        t('home_plan_feature_shared_inbox'),
        t('home_plan_feature_team_collaboration'),
        t('home_plan_feature_ai_advanced'),
        t('home_plan_feature_ai_logs'),
        t('home_plan_feature_priority_support')
      ],
      cta: t('home_plan_small_team_cta'),
      href: '/auth/signup?plan=medium_team',
      popular: true,
    },
    {
      name: t('home_plan_medium_team_name'),
      price: '€299',
      priceSuffix: '/mo',
      features: [
        t('home_plan_feature_50_users'), 
        t('home_plan_feature_admin_controls'),
        t('home_plan_feature_full_customization'),
        t('home_plan_feature_billing_management'),
        t('home_plan_feature_custom_workflows'),
        t('home_plan_feature_dedicated_support')
      ],
      cta: t('home_plan_coming_soon_cta'),
      href: '/auth/signup?plan=big_team',
      disabled: true,
    },
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
  
  const pageBackgroundStyle = isMounted ? {
    backgroundImage: `radial-gradient(ellipse farthest-corner at 20% 80%, hsla(var(--primary) / ${theme === 'dark' ? 0.15 : 0.1}), transparent 50%), radial-gradient(ellipse farthest-corner at 80% 30%, hsla(var(--accent) / ${theme === 'dark' ? 0.15 : 0.1}), transparent 50%)`,
  } : {};

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="flex flex-col items-center" style={pageBackgroundStyle}>
          {/* Hero Section */}
          <section className="w-full py-20 md:py-24" id="hero-section">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
              <motion.div 
                className="text-center md:text-left"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                  {t('home_hero_title')}
                </h1>
                <p className="mt-6 text-lg text-muted-foreground">
                  {t('home_hero_description')}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/auth/login">{t('login')}</Link>
                  </Button>
                  <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/auth/signup">{t('home_hero_cta_get_started')}</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
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
            className="w-full py-16 md:py-24 scroll-mt-28"
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
            className="w-full py-16 md:py-24"
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
                      <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                        <div className="p-3 rounded-full bg-primary/10 mb-4">
                          {feature.icon}
                        </div>
                        <CardHeader className="p-0">
                          <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 mt-2">
                          <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                      </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Pricing Section */}
          <motion.section 
            id="pricing" 
            className="w-full py-16 md:py-24 scroll-mt-28"
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
                {plans.map((plan: any) => (
                  <Card key={plan.name} className={cn(
                    'flex flex-col shadow-lg transition-shadow duration-300',
                    plan.popular && !plan.disabled ? 'border-2 border-primary relative' : '',
                    plan.disabled ? 'grayscale cursor-not-allowed opacity-60' : 'hover:shadow-xl'
                  )}>
                    {plan.popular && !plan.disabled && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">{t('home_plan_most_popular')}</div>}
                    
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                      <div className="mt-2 flex flex-col items-center justify-center h-[56px]">
                        <p className="text-4xl font-bold text-primary">
                          {plan.price}<span className="text-lg font-normal text-muted-foreground">{plan.priceSuffix}</span>
                        </p>
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
                <Card className="mt-12 text-center p-6 bg-muted/50 border-dashed grayscale opacity-60">
                  <CardHeader>
                    <CardTitle className="text-2xl">{t('home_custom_plan_title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                      {t('home_custom_plan_desc')}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button variant="outline" disabled>
                      {t('home_custom_plan_cta')}
                    </Button>
                  </CardFooter>
                </Card>
            </div>
          </motion.section>

           {/* Who it's for section */}
            <motion.section 
                className="w-full py-16 md:py-24"
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

          {/* Contact Section */}
           <motion.section 
            id="contact" 
            className="w-full py-16 md:py-24 scroll-mt-0"
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
                          <a href="mailto:support@calendaria.app" className="hover:text-primary">support@calendaria.app</a>
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
          <section className="w-full py-16 md:py-24">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">{t('home_final_cta_title')}</h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
                {t('home_final_cta_desc')}
              </p>
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/auth/signup">{t('home_final_cta_button')}</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
