import React from "react";
import { ShoppingCart, Receipt, Package, Box, Users } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-neutral-200 mb-6">
      <div className="flex flex-wrap -mb-px">
        <button
          onClick={() => setActiveTab("purchases")}
          className={`px-4 py-3 border-b-2 font-medium flex items-center ${
            activeTab === "purchases"
              ? "text-primary border-primary"
              : "text-neutral-800 border-transparent hover:text-primary hover:border-primary/30"
          }`}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Purchases
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-3 border-b-2 font-medium flex items-center ${
            activeTab === "sales"
              ? "text-primary border-primary"
              : "text-neutral-800 border-transparent hover:text-primary hover:border-primary/30"
          }`}
        >
          <Receipt className="mr-2 h-4 w-4" />
          Sales
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-3 border-b-2 font-medium flex items-center ${
            activeTab === "inventory"
              ? "text-primary border-primary"
              : "text-neutral-800 border-transparent hover:text-primary hover:border-primary/30"
          }`}
        >
          <Package className="mr-2 h-4 w-4" />
          Inventory
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-3 border-b-2 font-medium flex items-center ${
            activeTab === "products"
              ? "text-primary border-primary"
              : "text-neutral-800 border-transparent hover:text-primary hover:border-primary/30"
          }`}
        >
          <Box className="mr-2 h-4 w-4" />
          Products
        </button>
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`px-4 py-3 border-b-2 font-medium flex items-center ${
            activeTab === "suppliers"
              ? "text-primary border-primary"
              : "text-neutral-800 border-transparent hover:text-primary hover:border-primary/30"
          }`}
        >
          <Users className="mr-2 h-4 w-4" />
          Suppliers
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;
