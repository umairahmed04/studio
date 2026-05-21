import { ToolLayout } from '@/components/tools/ToolLayout';

export default function TermsPage() {
  return (
    <ToolLayout 
      title="Terms of Service" 
      description="Please read these terms carefully before using our platform."
    >
      <div className="glass p-8 md:p-12 rounded-3xl prose dark:prose-invert max-w-none space-y-8 text-sm md:text-base leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using ATSResumeScan, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">2. Description of Service</h2>
          <p className="text-muted-foreground">
            ATSResumeScan provides AI-powered resume analysis, job matching, cover letter generation, and LinkedIn optimization tools. These services are provided "as-is" and are intended for informational and career development purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">3. User Accounts</h2>
          <p className="text-muted-foreground">
            To access certain features, you may need to register an account via Google Authentication. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
          </p>
        </section>

        <section className="space-y-4 border-l-4 border-primary pl-6 bg-primary/5 py-4">
          <h2 className="text-2xl font-bold text-foreground">4. AI-Generated Content</h2>
          <p className="text-muted-foreground">
            Our platform uses Large Language Models (LLMs) to generate suggestions and content. You acknowledge that:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground">
            <li>AI-generated content may occasionally be inaccurate or contain errors.</li>
            <li>You are responsible for reviewing and verifying all content before using it in job applications.</li>
            <li>We do not guarantee job interviews or placement as a result of using our tools.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">5. Prohibited Use</h2>
          <p className="text-muted-foreground">
            You agree not to use the service for any unlawful purposes, including but not limited to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground">
            <li>Attempting to reverse-engineer our AI models.</li>
            <li>Scraping content from the website without authorization.</li>
            <li>Uploading malicious files or code.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">6. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            In no event shall ATSResumeScan or its creators be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services.
          </p>
        </section>

        <section className="space-y-4 text-center pt-8">
          <p className="text-xs text-muted-foreground italic">
            We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
