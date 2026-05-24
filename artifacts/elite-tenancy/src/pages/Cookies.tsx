import PublicLayout from "@/components/PublicLayout";

export default function Cookies() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 1 January 2025</p>
        <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-li:text-muted-foreground">
          <h2>What are cookies?</h2>
          <p>Cookies are small text files that are placed on your device by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.</p>
          <h2>How we use cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul>
            <li>Strictly necessary cookies: These are essential for the website to function properly and cannot be switched off.</li>
            <li>Performance cookies: These allow us to count visits and traffic sources so we can measure and improve the performance of our site.</li>
            <li>Functional cookies: These allow the website to provide enhanced functionality and personalisation.</li>
            <li>Targeting cookies: These may be set through our site by our advertising partners to build a profile of your interests.</li>
          </ul>
          <h2>Managing cookies</h2>
          <p>You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.</p>
          <h2>Contact us</h2>
          <p>For any questions about our use of cookies, please contact us at privacy@elitetenancy.co.uk.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
