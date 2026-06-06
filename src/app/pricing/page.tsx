import { Metadata } from 'next';
import { CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Affordable Pricing | Professional AI Resume Tools & Success Plans',
  description: 'Invest in your career with the best AI resume tools. Free ATS scans, premium optimization, and expert career guidance starting at $0.',
};

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic tools for getting started",
      features: [
        "3 Basic ATS Scans / mo",
        "Keyword Identification",
        "1 Job Match Report",
        "Community Support"
      ],
      button: "Start Free",
      variant: "outline" as const
    },
    {
      name: "Pro",
      price: "$19",
      description: "Complete toolkit for serious job seekers",
      features: [
        "Unlimited ATS Scans",
        "AI Bullet Point Optimizer",
        "Unlimited Job Match Reports",
        "Cover Letter Generator",
        "LinkedIn Summary Creator",
        "Priority Email Support"
      ],
      button: "Upgrade to Pro",
      variant: "default" as const,
      popular: true
    },
    {
      name: "Career",
      price: "$99",
      description: "Lifetime access to all current and future tools",
      features: [
        "Everything in Pro Forever",
        "Early Access to New AI Tools",
        "Resume Review by Experts",
        "Private Success Community",
        "One-on-One Career Prep",
        "Lifetime Updates"
      ],
      button: "Get Lifetime Access",
      variant: "outline" as const
    }
  ];

  return (
    <div className="py-24 hero-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">Simple & Transparent Pricing</Badge>
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 tracking-tight">Invest in Your <span className="gradient-text">Dream Job</span></h1>
          <p className="text-lg text-muted-foreground">Stop guessing what recruiters want. Use our AI-powered tools to land more interviews and higher salaries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32">
          {plans.map((plan) => (
            <Card key={plan.name} className={`glass relative overflow-hidden flex flex-col ${plan.popular ? 'border-primary ring-2 ring-primary/20 scale-105 z-10' : 'border-white/5'}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                  Best Value
                </div>
              )}
              <CardHeader className="p-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-headline font-bold">{plan.price}</span>
                  {plan.price !== '$99' && <span className="text-muted-foreground ml-1">/mo</span>}
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1">
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 size={16} className="text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button variant={plan.variant} className="w-full h-12 font-bold" size="lg">
                  {plan.button}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-3xl font-headline font-bold text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="p-1">
              <AccordionTrigger>Can I cancel my Pro subscription at any time?</AccordionTrigger>
              <AccordionContent>
                Yes. You can cancel your subscription at any time from your account dashboard. You'll maintain access to Pro features until the end of your current billing cycle.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="p-2">
              <AccordionTrigger>What is included in the free plan?</AccordionTrigger>
              <AccordionContent>
                The free plan includes 3 basic ATS scans per month, standard resume templates, and a job match report. It's designed to give you a clear understanding of how recruitment software sees your profile.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="p-3">
              <AccordionTrigger>How does the Lifetime access work?</AccordionTrigger>
              <AccordionContent>
                The Career plan is a one-time payment. You'll get unlimited access to all Pro features forever, including any new tools we release in the future. No recurring fees, ever.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mt-24 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="font-bold">Secure Billing</h4>
                <p className="text-xs text-muted-foreground">SSL-encrypted payments via Stripe for your security.</p>
             </div>
             <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto text-accent mb-4">
                  <Zap size={24} />
                </div>
                <h4 className="font-bold">Instant Activation</h4>
                <p className="text-xs text-muted-foreground">Access Pro tools immediately after upgrade.</p>
             </div>
             <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto text-yellow-500 mb-4">
                  <Sparkles size={24} />
                </div>
                <h4 className="font-bold">Hiring Success</h4>
                <p className="text-xs text-muted-foreground">Optimized by recruitment experts to ensure results.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
