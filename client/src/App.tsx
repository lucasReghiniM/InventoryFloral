import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/Layout";
import TabNavigation from "./components/TabNavigation";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";
import NotFound from "@/pages/not-found";

function App() {
  const [activeTab, setActiveTab] = useState<string>("purchases");

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="pb-16">
          {activeTab === "purchases" && <Purchases />}
          {activeTab === "sales" && <Sales />}
          {activeTab === "inventory" && <Inventory />}
        </div>
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
