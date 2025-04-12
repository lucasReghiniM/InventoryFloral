import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InventoryList from "../components/inventory/InventoryList";
import InventoryHistory from "../components/inventory/InventoryHistory";
import RemoveProductModal from "../components/inventory/RemoveProductModal";
import { useQuery } from "@tanstack/react-query";

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { 
    data: products, 
    isLoading: isProductsLoading 
  } = useQuery({
    queryKey: ["/api/products"],
  });

  const { 
    data: adjustments, 
    isLoading: isAdjustmentsLoading 
  } = useQuery({
    queryKey: ["/api/inventory-adjustments"],
  });

  const filteredProducts = products 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleRemoveClick = (productId: number) => {
    setSelectedProductId(productId);
    setIsRemoveModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Current Inventory</h2>
        
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-800" />
            </div>
          </div>
          
          <Button onClick={() => setIsRemoveModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Adjust Stock
          </Button>
        </div>
      </div>

      <InventoryList 
        products={filteredProducts} 
        isLoading={isProductsLoading} 
        onRemoveClick={handleRemoveClick} 
      />

      <h2 className="text-xl font-semibold mt-8 mb-6">Inventory History</h2>
      <InventoryHistory adjustments={adjustments || []} isLoading={isAdjustmentsLoading} products={products || []} />

      <RemoveProductModal 
        isOpen={isRemoveModalOpen} 
        onClose={() => setIsRemoveModalOpen(false)} 
        productId={selectedProductId}
        products={products || []}
      />
    </div>
  );
};

export default Inventory;
