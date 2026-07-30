import { Switch, Route, useLocation } from "wouter";
import { MotionConfig } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import Landing from "@/pages/Landing";

// Every non-home route is code-split so the landing page ships only its own JS.
const AppPage = lazy(() => import("@/pages/AppPage"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const About = lazy(() => import("@/pages/About"));
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
    <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059] animate-spin" />
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

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={AppPage} />
      <Route path="/about" component={About} />
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
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
