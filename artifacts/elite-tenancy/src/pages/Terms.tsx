import PublicLayout from "@/components/PublicLayout";

export default function Terms() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 1 January 2025</p>
        <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-li:text-muted-foreground">
          <h2>1. Acceptance of Terms</h2>
          <p>By using the Elite Tenancy platform and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          <h2>2. Services</h2>
          <p>Elite Tenancy Ltd provides a tenant introduction and property management service. Our Introduction Only service connects landlords with pre-qualified tenants. Our Premium Managed service additionally provides ongoing property management. Our fee for Introduction Only is the equivalent of two weeks' rent per successful tenancy commencement. Our Premium Managed fee is 8% of monthly rent collected, and our Smart Managed fee is between 3% and 5% of monthly rent collected, as agreed with you in writing.</p>
          <h2>3. Landlord obligations</h2>
          <p>Landlords using our services warrant that: (a) they have the legal right to let the property; (b) the property meets all applicable health and safety standards; (c) all required licences are held; (d) they will comply with all applicable landlord and tenant legislation.</p>
          <h2>4. Tenant obligations</h2>
          <p>Tenants warrant that the information provided in their application is true and accurate. Tenants agree to allow referencing checks and to cooperate fully with our six-stage screening process.</p>
          <h2>5. Fees and payment</h2>
          <p>Our fees are due and payable on the commencement date of the tenancy. No fee is payable if the introduction does not result in a tenancy. For Premium Managed, fees are deducted monthly from rent collected.</p>
          <h2>6. Limitation of liability</h2>
          <p>To the fullest extent permitted by law, Elite Tenancy's liability to you in connection with our services shall not exceed the total fees paid by you in the twelve months preceding the claim.</p>
          <h2>7. Governing law</h2>
          <p>These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          <h2>8. Contact</h2>
          <p>For any questions about these Terms, contact us at legal@elitetenancy.co.uk.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
