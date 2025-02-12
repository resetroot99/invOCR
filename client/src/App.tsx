import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Upload from "@/pages/upload";
import Dashboard from "@/pages/dashboard";
import InvoiceDetail from "@/pages/invoice-detail";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/upload" component={Upload} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/invoice/:id" component={InvoiceDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;