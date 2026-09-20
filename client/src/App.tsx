import { Switch, Route, useLocation } from "wouter";
import { MotionConfig } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
import Landing from "@/pages/Landing";

// Every non-home route is code-split so the landing page ships only its own JS.
// This matters more since the rebuild: /discover pulls in MapLibre, and no
// other route should pay for it.
const Discover = lazy(() => import("@/pages/Discover"));
const LocationPage = lazy(() => import("@/pages/LocationPage"));
const PractitionerPage = lazy(() => import("@/pages/PractitionerPage"));
const Resources = lazy(() => import("@/pages/Resources"));
const ForPractitioners = lazy(() => import("@/pages/ForPractitioners"));
const Recommend = lazy(() => import("@/pages/Recommend"));
const AppPage = lazy(() => import("@/pages/AppPage"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const StateMortgageProtection = lazy(() => import("@/pages/StateMortgageProtection"));
const GetCoverage = lazy(() => import("@/pages/GetCoverage"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const AdminBlogList = lazy(() => import("@/pages/AdminBlogList"));
const AdminBlogEditor = lazy(() => import("@/pages/AdminBlogEditor"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AIPrivacy = lazy(() => import("@/pages/AIPrivacy"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Terms = lazy(() => import("@/pages/Terms"));
const SmsOptIn = lazy(() => import("@/pages/SmsOptIn"));
const FoodChart = lazy(() => import("@/pages/FoodChart"));
const DeleteAccount = lazy(() => import("@/pages/DeleteAccount"));
const DeleteData = lazy(() => import("@/pages/DeleteData"));
const NotFound = lazy(() => import("@/pages/not-found"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-sakred-canvas flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-sakred-gold/30 border-t-sakred-gold animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const token = localStorage.getItem("adminToken");
  
  const { data: authStatus, isLoading, isError } = useQuery<{ authenticated: boolean; required: boolean }>({
    queryKey: ["/api/admin/auth-status"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  if (authStatus?.required && !authStatus?.authenticated) {
    if (!token) {
      navigate("/admin/login");
      return null;
    }
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
    return null;
  }

  if (isError && !token) {
    navigate("/admin/login");
    return null;
  }

  return <>{children}</>;
}

/**
 * wouter keeps the window scroll position across navigations, so following a
 * link from part-way down a list (e.g. /blog) lands you part-way down the next
 * page instead of at its top. Reset on every pathname change.
 *
 * Skipped when the URL carries a hash, so in-page anchors still work, and when
 * the browser is restoring a history entry on back/forward.
 */
function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = "auto";
      };
    }
  }, []);

  return null;
}

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
    <ScrollToTop />
    <Switch>
      <Route path="/" component={Landing} />

      {/* The network. Order matters: the two- and three-segment /discover
          routes must be declared before the bare one, or wouter's Switch
          matches "/discover" first and the category routes never fire. */}
      <Route path="/discover/:modality/:city" component={Discover} />
      <Route path="/discover/:modality" component={Discover} />
      <Route path="/discover" component={Discover} />
      <Route path="/locations/:slug" component={LocationPage} />
      <Route path="/practitioners/:slug" component={PractitionerPage} />
      <Route path="/recommend" component={Recommend} />
      <Route path="/for-practitioners" component={ForPractitioners} />
      <Route path="/resources" component={Resources} />

      <Route path="/app" component={AppPage} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/mortgage-protection/:state" component={StateMortgageProtection} />
      <Route path="/get-coverage" component={GetCoverage} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/blog">
        <RequireAdminAuth><AdminBlogList /></RequireAdminAuth>
      </Route>
      <Route path="/admin/blog/new">
        <RequireAdminAuth><AdminBlogEditor /></RequireAdminAuth>
      </Route>
      <Route path="/admin/blog/:id">
        {(params) => <RequireAdminAuth><AdminBlogEditor /></RequireAdminAuth>}
      </Route>
      <Route path="/ai-privacy" component={AIPrivacy} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/terms" component={Terms} />
      <Route path="/opt-in" component={SmsOptIn} />
      <Route path="/food-chart" component={FoodChart} />
      <Route path="/delete-account" component={DeleteAccount} />
      <Route path="/delete-data" component={DeleteData} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* reducedMotion="user" is a site-wide safety net: for visitors who have asked their
          OS for reduced motion, every framer-motion transform/layout animation is skipped
          (opacity still cross-fades) — including the ad-hoc whileInView blocks on pages
          that haven't been migrated to the shared primitives in components/motion.tsx. */}
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          <Toaster />
          <Router />
          {/* Page views + the custom funnel events in lib/analytics.ts.
              Self-hosted by Vercel, so no third-party script and no consent
              banner obligation for basic traffic measurement. */}
          <Analytics />
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
