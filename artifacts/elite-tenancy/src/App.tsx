import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from "@clerk/react";
import { useGetAuthMe } from "@workspace/api-client-react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import Listings from "@/pages/Listings";
import ListingDetail from "@/pages/ListingDetail";
import ForLandlords from "@/pages/ForLandlords";
import Pricing from "@/pages/Pricing";
import HowItWorks from "@/pages/HowItWorks";
import ListYourProperty from "@/pages/ListYourProperty";
import FindARoom from "@/pages/FindARoom";
import Blog from "@/pages/Blog";
import BlogArticle from "@/pages/BlogArticle";
import Valuation from "@/pages/Valuation";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Cookies from "@/pages/Cookies";

import TenantDashboard from "@/pages/tenant/Dashboard";
import MyTenancy from "@/pages/tenant/MyTenancy";
import Rent from "@/pages/tenant/Rent";
import TenantMaintenance from "@/pages/tenant/Maintenance";
import TenantDocuments from "@/pages/tenant/Documents";

import LandlordDashboard from "@/pages/landlord/Dashboard";
import LandlordListings from "@/pages/landlord/Listings";
import LandlordTenants from "@/pages/landlord/Tenants";
import LandlordFinances from "@/pages/landlord/Finances";
import LandlordMaintenance from "@/pages/landlord/Maintenance";
import LandlordLeads from "@/pages/landlord/Leads";
import LandlordManaged from "@/pages/landlord/Managed";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminListings from "@/pages/admin/Listings";
import AdminLeads from "@/pages/admin/Leads";
import AdminArticles from "@/pages/admin/Articles";
import AdminUsers from "@/pages/admin/Users";

import TenantMessages from "@/pages/tenant/Messages";
import LandlordMessages from "@/pages/landlord/Messages";
import TenantMatch from "@/pages/TenantMatch";
import SpareRoomAlternative from "@/pages/SpareRoomAlternative";
import RRAChecker from "@/pages/RRAChecker";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import { ChatProvider } from "@/contexts/ChatContext";

// City SEO landing pages
import London from "@/pages/city/London";
import Manchester from "@/pages/city/Manchester";
import Birmingham from "@/pages/city/Birmingham";
import Leeds from "@/pages/city/Leeds";
import Bristol from "@/pages/city/Bristol";
import Sheffield from "@/pages/city/Sheffield";
import Liverpool from "@/pages/city/Liverpool";
import Edinburgh from "@/pages/city/Edinburgh";
import Cardiff from "@/pages/city/Cardiff";
import Glasgow from "@/pages/city/Glasgow";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#c9a227",
    colorForeground: "#f1ece1",
    colorMutedForeground: "#9a8f7a",
    colorDanger: "#ef4444",
    colorBackground: "#0d1b2a",
    colorInput: "#162234",
    colorInputForeground: "#f1ece1",
    colorNeutral: "#2a3a4a",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0d1b2a] border border-[#2a3a4a] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#f1ece1] font-serif",
    headerSubtitle: "text-[#9a8f7a]",
    socialButtonsBlockButtonText: "text-[#f1ece1]",
    formFieldLabel: "text-[#9a8f7a] text-xs",
    footerActionLink: "text-[#c9a227] hover:text-[#e6b82a]",
    footerActionText: "text-[#9a8f7a]",
    dividerText: "text-[#9a8f7a]",
    identityPreviewEditButton: "text-[#c9a227]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-[#f1ece1]",
    logoBox: "flex justify-center py-2",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "bg-[#162234] border border-[#2a3a4a] hover:bg-[#1e2f42] text-[#f1ece1]",
    formButtonPrimary: "bg-[#c9a227] hover:bg-[#e6b82a] text-[#0d1b2a] font-semibold",
    formFieldInput: "bg-[#162234] border-[#2a3a4a] text-[#f1ece1]",
    footerAction: "border-t border-[#2a3a4a]",
    dividerLine: "bg-[#2a3a4a]",
    alert: "bg-[#162234] border border-[#2a3a4a]",
    otpCodeFieldInput: "bg-[#162234] border-[#2a3a4a] text-[#f1ece1]",
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

function AppRoutes() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/find-my-match" component={TenantMatch} />
      <Route path="/listings" component={Listings} />
      <Route path="/listings/:id" component={ListingDetail} />
      <Route path="/for-landlords" component={ForLandlords} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/list-your-property" component={ListYourProperty} />
      <Route path="/find-a-room" component={FindARoom} />
      <Route path="/spareroom-alternative" component={SpareRoomAlternative} />
      <Route path="/rra-2025-checker" component={RRAChecker} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogArticle} />
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

      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
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
