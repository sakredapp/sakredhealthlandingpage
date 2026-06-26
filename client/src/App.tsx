import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import AppPage from "@/pages/AppPage";
import GetCoverage from "@/pages/GetCoverage";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import AdminBlogList from "@/pages/AdminBlogList";
import AdminBlogEditor from "@/pages/AdminBlogEditor";
import AdminLogin from "@/pages/AdminLogin";
import AIPrivacy from "@/pages/AIPrivacy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Terms from "@/pages/Terms";
import SmsOptIn from "@/pages/SmsOptIn";
import FoodChart from "@/pages/FoodChart";
import DeleteAccount from "@/pages/DeleteAccount";
import DeleteData from "@/pages/DeleteData";
import NotFound from "@/pages/not-found";

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
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={AppPage} />
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
