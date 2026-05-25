import { Metadata } from 'next';
import { ToolLayout } from '@/components/tools/ToolLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | Your Data Security at ATSResumeScan',
  description: 'Learn how ATSResumeScan protects your personal data and resume information. We are committed to transparency and high-performance data encryption.',
};

export default function PrivacyPage() {
  return (
    <ToolLayout 
      title="Privacy Policy" 
      description="Last Updated: May 2026. Your privacy is our top priority."
    >
      <div className="glass p-8 md:p-12 rounded-3xl prose dark:prose-invert max-w-none space-y-8 text-sm md:text-base leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
          <p className="text-muted-foreground">
            Welcome to ATSResumeScan ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website and use our AI-powered career tools.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information that you provide directly to us, such as:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground">
            <li><strong>Account Information:</strong> Name, email address, and profile picture when you sign in via Google.</li>
            <li><strong>User Content:</strong> Resume text, LinkedIn profile content, and job descriptions you upload or paste for analysis.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our site, including log files and device information.</li>
          </ul>
        </section>

        <section className="space-y-4 border-l-4 border-primary pl-6 bg-primary/5 py-4">
          <h2 className="text-2xl font-bold text-foreground">3. Google AdSense & Cookies</h2>
          <p className="text-muted-foreground">
            We use Google AdSense to serve advertisements on our website. To comply with Google's policies, please be aware of the following:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground">
            <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" className="text-primary hover:underline">Google Ads Settings</a>.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">4. How We Use Your Information</h2>
          <p className="text-muted-foreground">
            We use your information to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground">
            <li>Provide, operate, and maintain our tools and services.</li>
            <li>Improve and personalize your experience.</li>
            <li>Communicate with you regarding account updates or support.</li>
            <li>Analyze usage patterns to enhance our AI models.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">5. Data Retention</h2>
          <p className="text-muted-foreground">
            If you are a registered user, we store your scans and resumes in our secure Firestore database until you choose to delete them or close your account. For guest users, data may be cached temporarily for the duration of the session.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">6. Your Rights</h2>
          <p className="text-muted-foreground">
            Depending on your location (e.g., GDPR in Europe, CCPA in California), you may have the right to access, correct, or delete your personal data. Please contact us if you wish to exercise these rights.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">7. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please reach out to us at <span className="font-bold text-primary">privacy@atsresumescan.com</span>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
