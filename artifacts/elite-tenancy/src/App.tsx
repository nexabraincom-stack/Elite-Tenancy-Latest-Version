import { useEffect, useRef, lazy, Suspense } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from "@clerk/react";
import { useGetAuthMe } from "@workspace/api-client-react";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages are lazy-loaded so each route ships as its own chunk. This keeps the
// initial JS bundle small (huge mobile FCP/LCP win) instead of loading all
// ~58 pages up front. A <Suspense> boundary around the router shows PageLoader
// while a route's chunk downloads.
const Home = lazy(() => import("@/pages/Home"));
const Listings = lazy(() => import("@/pages/Listings"));
const ListingDetail = lazy(() => import("@/pages/ListingDetail"));
const ForLandlords = lazy(() => import("@/pages/ForLandlords"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const ListYourProperty = lazy(() => import("@/pages/ListYourProperty"));
const FindARoom = lazy(() => import("@/pages/FindARoom"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogArticle = lazy(() => import("@/pages/BlogArticle"));
const Valuation = lazy(() => import("@/pages/Valuation"));
const Contact = lazy(() => import("@/pages/Contact"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Cookies = lazy(() => import("@/pages/Cookies"));

const TenantDashboard = lazy(() => import("@/pages/tenant/Dashboard"));
const MyTenancy = lazy(() => import("@/pages/tenant/MyTenancy"));
const Rent = lazy(() => import("@/pages/tenant/Rent"));
const TenantMaintenance = lazy(() => import("@/pages/tenant/Maintenance"));
const TenantDocuments = lazy(() => import("@/pages/tenant/Documents"));

const LandlordDashboard = lazy(() => import("@/pages/landlord/Dashboard"));
const LandlordListings = lazy(() => import("@/pages/landlord/Listings"));
const LandlordTenants = lazy(() => import("@/pages/landlord/Tenants"));
const LandlordFinances = lazy(() => import("@/pages/landlord/Finances"));
const LandlordMaintenance = lazy(() => import("@/pages/landlord/Maintenance"));
const LandlordLeads = lazy(() => import("@/pages/landlord/Leads"));
const LandlordPassports = lazy(() => import("@/pages/landlord/Passports"));
const LandlordManaged = lazy(() => import("@/pages/landlord/Managed"));

const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminListings = lazy(() => import("@/pages/admin/Listings"));
const AdminLeads = lazy(() => import("@/pages/admin/Leads"));
const AdminArticles = lazy(() => import("@/pages/admin/Articles"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminSeoDashboard = lazy(() => import("@/pages/admin/SeoDashboard"));

const TenantMessages = lazy(() => import("@/pages/tenant/Messages"));
const LandlordMessages = lazy(() => import("@/pages/landlord/Messages"));
const TenantMatch = lazy(() => import("@/pages/TenantMatch"));
const SpareRoomAlternative = lazy(() => import("@/pages/SpareRoomAlternative"));
const RRAChecker = lazy(() => import("@/pages/RRAChecker"));
const RoomsToLet = lazy(() => import("@/pages/RoomsToLet"));
const ForAgents = lazy(() => import("@/pages/ForAgents"));
const RenterPassport = lazy(() => import("@/pages/RenterPassport"));
const RoomWanted = lazy(() => import("@/pages/RoomWanted"));
const VerifyLandlord = lazy(() => import("@/pages/VerifyLandlord"));
const RightToRentCheck = lazy(() => import("@/pages/RightToRentCheck"));
const RentCalculator = lazy(() => import("@/pages/RentCalculator"));
const Faq = lazy(() => import("@/pages/Faq"));
const About = lazy(() => import("@/pages/About"));
const RentersRightsAct2025 = lazy(() => import("@/pages/RentersRightsAct2025"));
const TenantIntroductionService = lazy(() => import("@/pages/TenantIntroductionService"));
const DepositProtection = lazy(() => import("@/pages/DepositProtection"));
const RightToRentGuide = lazy(() => import("@/pages/RightToRentGuide"));
const HmoLicenceGuide = lazy(() => import("@/pages/HmoLicenceGuide"));

// International SEO landing pages
const InternationalStudents = lazy(() => import("@/pages/InternationalStudents"));
const MoveToUK = lazy(() => import("@/pages/MoveToUK"));
const EuCitizensGuide = lazy(() => import("@/pages/EuCitizensGuide"));
const LondonRentalsEurope = lazy(() => import("@/pages/LondonRentalsEurope"));
const UkVisaRentalGuide = lazy(() => import("@/pages/UkVisaRentalGuide"));
const Profile = lazy(() => import("@/pages/Profile"));
const NotFound = lazy(() => import("@/pages/not-found"));
import { ChatProvider } from "@/contexts/ChatContext";
import { usePageTracking } from "@/hooks/use-page-tracking";

// City SEO landing pages
const London = lazy(() => import("@/pages/city/London"));
const Manchester = lazy(() => import("@/pages/city/Manchester"));
const Birmingham = lazy(() => import("@/pages/city/Birmingham"));
const Leeds = lazy(() => import("@/pages/city/Leeds"));
const Bristol = lazy(() => import("@/pages/city/Bristol"));
const Sheffield = lazy(() => import("@/pages/city/Sheffield"));
const Liverpool = lazy(() => import("@/pages/city/Liverpool"));
const Edinburgh = lazy(() => import("@/pages/city/Edinburgh"));
const Cardiff = lazy(() => import("@/pages/city/Cardiff"));
const Glasgow = lazy(() => import("@/pages/city/Glasgow"));
const CityPage = lazy(() => import("@/pages/city/CityPage"));
import { EXTRA_CITIES } from "@/pages/city/extraCities";

// Use the publishable key exactly as issued so Clerk loads its JS from the
// key's real Frontend API domain (clerk.elitetenancy.co.uk — which resolves).
//
// Previously this was publishableKeyFromHost(window.location.hostname, key),
// which rewrites the Frontend API to clerk.<current-host>. On the canonical
// www host that produced clerk.www.elitetenancy.co.uk, which has NO DNS record,
// so Clerk JS failed to load (ERR_NAME_NOT_RESOLVED) and every /sign-in and
// /sign-up page rendered blank. The key already encodes the correct domain.
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// NOTE: proxyUrl intentionally removed. The VITE_CLERK_PROXY_URL proxy
// (clerk.elitetenancy.co.uk) was issuing 307 redirects when Googlebot tried
// to load clerk.browser.js and ui.browser.js, which broke JS hydration and
// caused a Soft 404 on every blog page. Clerk works correctly without the
// proxy because the publishable key already encodes the correct Frontend API
// domain. The env var is kept so existing Vercel config needs no changes.

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

// Clerk sign-in/sign-up card — matches the site's light ivory theme exactly.
// Colors sourced from index.css :root variables:
//   --background: 40 33% 96%  → #f5f0e8 (warm ivory)
//   --foreground: 167 39% 14% → #0f2920 (dark forest green)
//   --primary:    165 41% 21% → #1f4a3a (deep green — buttons)
//   --accent:     41  49% 48% → #b5862a (gold — links/accents)
//   --input:      150 15% 84% → #d0ddd6 (light grey-green)
//   --border:     150 18% 88% → #d8e6dc
//   --muted-foreground: 34 11% 40% → #6b6054
const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#1f4a3a",
    colorForeground: "#0f2920",
    colorMutedForeground: "#6b6054",
    colorDanger: "#ef4444",
    colorBackground: "#f5f0e8",
    colorInput: "#d0ddd6",
    colorInputForeground: "#0f2920",
    colorNeutral: "#6b6054",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white border border-[#d8e6dc] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#0f2920] font-serif",
    headerSubtitle: "text-[#6b6054]",
    socialButtonsBlockButtonText: "text-[#0f2920]",
    formFieldLabel: "text-[#6b6054] text-xs",
    footerActionLink: "text-[#1f4a3a] hover:text-[#b5862a]",
    footerActionText: "text-[#6b6054]",
    dividerText: "text-[#6b6054]",
    identityPreviewEditButton: "text-[#1f4a3a]",
    formFieldSuccessText: "text-green-700",
    alertText: "text-[#0f2920]",
    logoBox: "flex justify-center py-2",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "bg-white border border-[#d8e6dc] hover:bg-[#f5f0e8] text-[#0f2920]",
    formButtonPrimary: "bg-[#1f4a3a] hover:bg-[#2a6150] text-[#f5f0e8] font-semibold",
    formFieldInput: "bg-white border-[#d8e6dc] text-[#0f2920]",
    footerAction: "border-t border-[#d8e6dc] bg-[#f5f0e8]",
    dividerLine: "bg-[#d8e6dc]",
    alert: "bg-[#f5f0e8] border border-[#d8e6dc]",
    otpCodeFieldInput: "bg-white border-[#d8e6dc] text-[#0f2920]",
    formFieldRow: "gap-2",
    main: "gap-4",
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/dashboard`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/dashboard`}
      />
    </div>
  );
}

const ROLE_DESTINATIONS = {
  admin: "/admin/dashboard",
  landlord: "/landlord/dashboard",
  tenant: "/tenant/dashboard",
} as const;

function RoleRedirect() {
  const { user, isLoaded } = useUser();
  const [, navigate] = useLocation();

  // Only fire once Clerk has confirmed the user is signed in, so the
  // session cookie is guaranteed to be present for the /api/auth/me call.
  const { data: me, isError } = useGetAuthMe({
    enabled: isLoaded && !!user,
  });

  useEffect(() => {
    if (me) {
      navigate(ROLE_DESTINATIONS[me.role] ?? "/tenant/dashboard", { replace: true });
    } else if (isError) {
      navigate("/tenant/dashboard", { replace: true });
    }
  }, [me, isError, navigate]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Redirecting you…</p>
      </div>
    </div>
  );
}

function ProtectedRoute({
  component: Component,
  requiredRole,
  fallback,
}: {
  component: React.ComponentType;
  requiredRole?: "tenant" | "landlord" | "admin";
  fallback?: string;
}) {
  return (
    <>
      <Show when="signed-in">
        {requiredRole ? (
          <RoleGate component={Component} requiredRole={requiredRole} />
        ) : (
          <Component />
        )}
      </Show>
      <Show when="signed-out">
        <Redirect to={fallback ?? "/sign-in"} />
      </Show>
    </>
  );
}

function RoleGate({
  component: Component,
  requiredRole,
}: {
  component: React.ComponentType;
  requiredRole: "tenant" | "landlord" | "admin";
}) {
  const { data: me, isLoading } = useGetAuthMe();

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!me || me.role !== requiredRole) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

function AppRoutes() {
  usePageTracking();
  return (
    <Suspense fallback={<PageLoader />}>
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/find-my-match" component={TenantMatch} />
      <Route path="/renter-passport" component={RenterPassport} />
      <Route path="/room-wanted" component={RoomWanted} />
      <Route path="/verify-landlord" component={VerifyLandlord} />
      <Route path="/right-to-rent-check" component={RightToRentCheck} />
      <Route path="/rent-calculator" component={RentCalculator} />
      <Route path="/faq" component={Faq} />
      <Route path="/about" component={About} />
      <Route path="/renters-rights-act-2025" component={RentersRightsAct2025} />
      <Route path="/tenant-introduction-service" component={TenantIntroductionService} />
      <Route path="/deposit-protection" component={DepositProtection} />
      <Route path="/right-to-rent-guide" component={RightToRentGuide} />
      <Route path="/hmo-licence-guide" component={HmoLicenceGuide} />
      <Route path="/listings" component={Listings} />
      <Route path="/listings/:id" component={ListingDetail} />
      <Route path="/for-landlords" component={ForLandlords} />
      <Route path="/for-agents" component={ForAgents} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/list-your-property" component={ListYourProperty} />
      <Route path="/find-a-room" component={FindARoom} />
      <Route path="/spareroom-alternative" component={SpareRoomAlternative} />
      <Route path="/rra-2025-checker" component={RRAChecker} />
      <Route path="/rooms-to-let/:city" component={RoomsToLet} />
      <Route path="/rooms-to-let" component={RoomsToLet} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogArticle} />
      {/* International SEO landing pages */}
      <Route path="/international-students" component={InternationalStudents} />
      <Route path="/move-to-uk" component={MoveToUK} />
      <Route path="/eu-citizens-uk-rental-guide" component={EuCitizensGuide} />
      <Route path="/london-rentals-for-europeans" component={LondonRentalsEurope} />
      <Route path="/uk-visa-rental-guide" component={UkVisaRentalGuide} />
      <Route path="/valuation" component={Valuation} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/cookies" component={Cookies} />

      {/* City SEO landing pages */}
      <Route path="/london" component={London} />
      <Route path="/manchester" component={Manchester} />
      <Route path="/birmingham" component={Birmingham} />
      <Route path="/leeds" component={Leeds} />
      <Route path="/bristol" component={Bristol} />
      <Route path="/sheffield" component={Sheffield} />
      <Route path="/liverpool" component={Liverpool} />
      <Route path="/edinburgh" component={Edinburgh} />
      <Route path="/cardiff" component={Cardiff} />
      <Route path="/glasgow" component={Glasgow} />

      {/* Programmatic city SEO landing pages (data-driven — see extraCities.ts) */}
      {EXTRA_CITIES.map((c) => (
        <Route key={c.slug} path={`/${c.slug}`}>
          {() => <CityPage {...c} />}
        </Route>
      ))}

      {/* Auth — Clerk-managed */}
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />

      {/* Profile — auth-gated */}
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>

      {/* Role-based redirect after sign-in */}
      <Route path="/dashboard">
        {() => (
          <>
            <Show when="signed-in">
              <RoleRedirect />
            </Show>
            <Show when="signed-out">
              <Redirect to="/sign-in" />
            </Show>
          </>
        )}
      </Route>

      {/* Tenant portal — auth-gated */}
      <Route path="/tenant/dashboard">
        {() => <ProtectedRoute component={TenantDashboard} />}
      </Route>
      <Route path="/tenant/my-tenancy">
        {() => <ProtectedRoute component={MyTenancy} />}
      </Route>
      <Route path="/tenant/rent">
        {() => <ProtectedRoute component={Rent} />}
      </Route>
      <Route path="/tenant/maintenance">
        {() => <ProtectedRoute component={TenantMaintenance} />}
      </Route>
      <Route path="/tenant/documents">
        {() => <ProtectedRoute component={TenantDocuments} />}
      </Route>
      <Route path="/tenant/messages">
        {() => <ProtectedRoute component={TenantMessages} />}
      </Route>

      {/* Landlord portal — landlord role required */}
      <Route path="/landlord/dashboard">
        {() => <ProtectedRoute component={LandlordDashboard} requiredRole="landlord" />}
      </Route>
      <Route path="/landlord/listings">
        {() => <ProtectedRoute component={LandlordListings} requiredRole="landlord" />}
      </Route>
      <Route path="/landlord/tenants">
        {() => <ProtectedRoute component={LandlordTenants} requiredRole="landlord" />}
      </Route>
      <Route path="/landlord/finances">
        {() => <ProtectedRoute component={LandlordFinances} requiredRole="landlord" />}
      </Route>
      <Route path="/landlord/maintenance">
        {() => <ProtectedRoute component={LandlordMaintenance} requiredRole="landlord" />}
      </Route>
      <Route path="/landlord/leads">
        {() => <ProtectedRoute component={LandlordLeads} requiredRole="landlord" />}
      </Route>
      <Route path="/landlord/passports">
        {() => <ProtectedRoute component={LandlordPassports} requiredRole="landlord" />}
      </Route>
      <Route path="/landlord/managed">
        {() => <ProtectedRoute component={LandlordManaged} requiredRole="landlord" />}
      </Route>
      <Route path="/landlord/messages">
        {() => <ProtectedRoute component={LandlordMessages} requiredRole="landlord" />}
      </Route>

      {/* Admin portal — admin role required */}
      <Route path="/admin/dashboard">
        {() => <ProtectedRoute component={AdminDashboard} requiredRole="admin" />}
      </Route>
      <Route path="/admin/listings">
        {() => <ProtectedRoute component={AdminListings} requiredRole="admin" />}
      </Route>
      <Route path="/admin/leads">
        {() => <ProtectedRoute component={AdminLeads} requiredRole="admin" />}
      </Route>
      <Route path="/admin/articles">
        {() => <ProtectedRoute component={AdminArticles} requiredRole="admin" />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute component={AdminUsers} requiredRole="admin" />}
      </Route>
      <Route path="/admin/seo-dashboard">
        {() => <ProtectedRoute component={AdminSeoDashboard} requiredRole="admin" />}
      </Route>

      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your Elite Tenancy account",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Join Elite Tenancy — premium UK lettings",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ChatProvider>
            <ClerkQueryClientCacheInvalidator />
            <AppRoutes />
            <Toaster />
          </ChatProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
