import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InventoryProvider } from "./contexts/InventoryContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Import from "./pages/Import";
import Sales from "./pages/Sales";
import Invoices from "./pages/Invoices";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import SupplierHistory from "./pages/SupplierHistory";
import Customers from "./pages/Customers";
import ProductDetails from "./pages/ProductDetails";
import CustomerHistory from "./pages/CustomerHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <InventoryProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/import" element={<Import />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/:id/history" element={<SupplierHistory />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id/history" element={<CustomerHistory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </InventoryProvider>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
