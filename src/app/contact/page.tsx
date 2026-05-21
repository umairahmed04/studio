import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | Support & Partnerships | ATSResumeScan',
  description: 'Have questions about your resume score or interested in partnership opportunities? Contact the ATSResumeScan team today.',
};

export default function ContactPage() {
  return (
    <ToolLayout 
      title="How Can We Help Your Career?" 
      description="Our career experts and technical support team are here to help you navigate the recruitment landscape."
      badge="Support Hub"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <ContactCard 
            icon={<Mail className="text-primary" />} 
            title="Email Support" 
            content="atsresumescan@gmail.com" 
          />
          <ContactCard 
            icon={<HelpCircle className="text-accent" />} 
            title="FAQ Support" 
            content="Check our FAQ for instant help." 
          />
        </div>

        <div className="lg:col-span-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>We typically respond to all inquiries within 24 business hours.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Full Name</label>
                  <Input placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Email Address</label>
                  <Input placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Subject</label>
                <Input placeholder="How can we help your job search?" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Message</label>
                <Textarea placeholder="Tell us more about your question or feedback..." className="min-h-[150px]" />
              </div>
              <div className="p-4 rounded-xl bg-muted/50 text-xs text-muted-foreground border italic text-center">
                For urgent business inquiries, please reach us directly at <strong className="text-foreground">atsresumescan@gmail.com</strong>
              </div>
              <Button className="w-full h-12 font-bold" size="lg">Submit Inquiry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}

function ContactCard({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
  return (
    <Card className="glass border-white/5">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-sm">{title}</h4>
          <p className="text-sm text-muted-foreground">{content}</p>
        </div>
      </CardContent>
    </Card>
  );
}
