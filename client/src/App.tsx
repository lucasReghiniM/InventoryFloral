import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/Layout";
import TabNavigation from "./components/TabNavigation";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { logOut } from "./lib/firebase";
import { LuLogOut } from "react-icons/lu";

// Main application component when authenticated
function MainApp() {
  const [activeTab, setActiveTab] = useState<string>("purchases");
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {currentUser?.email}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center gap-1"
          >
            <LuLogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      <div className="pb-16">
        {activeTab === "purchases" && <Purchases />}
        {activeTab === "sales" && <Sales />}
        {activeTab === "inventory" && <Inventory />}
        {activeTab === "products" && <Products />}
        {activeTab === "suppliers" && <Suppliers />}
      </div>
    </Layout>
  );
}

// App wrapper with authentication logic
function AppContent() {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return currentUser ? <MainApp /> : <Login />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
