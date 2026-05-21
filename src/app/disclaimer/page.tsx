import { ToolLayout } from '@/components/tools/ToolLayout';

export default function DisclaimerPage() {
  return (
    <ToolLayout 
      title="Disclaimer" 
      description="Important information regarding the use of our AI career tools."
    >
      <div className="glass p-8 md:p-12 rounded-3xl prose dark:prose-invert max-w-none space-y-8 text-sm md:text-base leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">General Disclaimer</h2>
          <p className="text-muted-foreground">
            The information provided by ATSResumeScan ("we," "us," or "our") on our website is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
          </p>
        </section>

        <section className="space-y-4 border-l-4 border-accent pl-6 bg-accent/5 py-4">
          <h2 className="text-2xl font-bold text-foreground">Professional Advice Disclaimer</h2>
          <p className="text-muted-foreground">
            Our tools provide AI-driven career advice and suggestions. This is not a substitute for professional career coaching or legal advice. Every hiring situation is unique, and you should always exercise your own judgment and consult with human professionals when necessary.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">AI Output Disclaimer</h2>
          <p className="text-muted-foreground">
            Our services utilize artificial intelligence (Genkit/Gemini) to analyze data. Please be aware that AI can "hallucinate" or generate incorrect information. You are solely responsible for the accuracy of any resume or cover letter you submit to potential employers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">External Links Disclaimer</h2>
          <p className="text-muted-foreground">
            The Site may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, reliability, availability, or completeness by us.
          </p>
        </section>

        <section className="space-y-4 border-l-4 border-primary pl-6 bg-primary/5 py-4">
          <h2 className="text-2xl font-bold text-foreground">Google AdSense Disclosure</h2>
          <p className="text-muted-foreground">
            We use third-party advertising companies to serve ads when you visit our website. These companies may use information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you. Please see our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> for more details on how these cookies are managed.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Affiliate Disclosure</h2>
          <p className="text-muted-foreground">
            Some links on this website may be affiliate links, meaning we may earn a small commission if you click on the link or make a purchase using the link at no additional cost to you.
          </p>
        </section>

        <section className="space-y-4 pt-8">
          <h2 className="text-2xl font-bold text-foreground">Errors and Omissions</h2>
          <p className="text-muted-foreground">
            While we have made every attempt to ensure that the information contained in this site has been obtained from reliable sources, ATSResumeScan is not responsible for any errors or omissions, or for the results obtained from the use of this information.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
