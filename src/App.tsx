import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RestaurantProvider } from "@/context/RestaurantContext";
import Index from "./pages/Index.tsx";
import CustomerDashboard from "./pages/CustomerDashboard.tsx";
import WaiterDashboard from "./pages/WaiterDashboard.tsx";
import ChefDashboard from "./pages/ChefDashboard.tsx";
import ManagerDashboard from "./pages/ManagerDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RestaurantProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/waiter" element={<WaiterDashboard />} />
            <Route path="/chef" element={<ChefDashboard />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RestaurantProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
