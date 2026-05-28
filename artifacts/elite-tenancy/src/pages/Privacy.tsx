import PublicLayout from "@/components/PublicLayout";

export default function Privacy() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 1 January 2025</p>
        <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-li:text-muted-foreground">
          <h2>1. Who we are</h2>
          <p>Elite Tenancy Ltd ("Elite Tenancy", "we", "us", "our") is a company registered in England and Wales. Our registered address is Office 18077, 182-184 High Street North, East Ham, London, E6 2JA. We are the controller of your personal data under this policy.</p>
          <h2>2. What personal data we collect</h2>
          <p>We collect and process the following categories of personal data:</p>
          <ul>
            <li>Identity data: name, username or similar identifier</li>
            <li>Contact data: email address, telephone number, postal address</li>
            <li>Financial data: bank account and payment card details (processed securely via our payment provider)</li>
            <li>Transaction data: details of payments to and from you and details of services you have purchased from us</li>
            <li>Technical data: internet protocol (IP) address, browser type and version, time zone setting and location, operating system and platform</li>
            <li>Usage data: information about how you use our website and services</li>
            <li>Marketing and communications data: your preferences in receiving marketing from us and your communication preferences</li>
          </ul>
          <h2>3. How we use your personal data</h2>
          <p>We use your personal data to provide and manage our lettings introduction and property management services, to communicate with you, to comply with legal obligations, and to improve our services. We do not sell your personal data to third parties.</p>
          <h2>4. Sharing your personal data</h2>
          <p>We may share your personal data with landlords or tenants as necessary to provide our services, with our service providers who process data on our behalf, and with regulatory authorities where required by law.</p>
          <h2>5. Data retention</h2>
          <p>We retain your personal data for as long as necessary to fulfil the purposes for which it was collected, including to satisfy any legal, accounting or reporting requirements. Typically this is seven years from the end of your relationship with us.</p>
          <h2>6. Your rights</h2>
          <p>Under the UK General Data Protection Regulation (UK GDPR), you have the right to access, rectify, erase, restrict processing of, and port your personal data. You also have the right to object to processing and to withdraw consent where processing is based on consent. To exercise your rights, contact us at privacy@elitetenancy.co.uk.</p>
          <h2>7. Contact us</h2>
          <p>For any questions or concerns about this Privacy Policy, please contact our Data Protection Officer at privacy@elitetenancy.co.uk or write to us at Elite Tenancy Ltd, Office 18077, 182-184 High Street North, East Ham, London, E6 2JA.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
