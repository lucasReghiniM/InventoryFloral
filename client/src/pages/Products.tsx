import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ProductList from "../components/product/ProductList";
import ProductForm from "../components/product/ProductForm";
import ProductDetails from "../components/product/ProductDetails";
import { Plus } from "lucide-react";

export default function Products() {
  const [showForm, setShowForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Fetch products
  const {
    data: products = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["/api/products"],
    refetchOnWindowFocus: false
  });

  const handleAddNew = () => {
    setShowForm(true);
    setSelectedProductId(null);
  };

  const handleFormComplete = () => {
    setShowForm(false);
    refetch();
  };

  const handleViewDetails = (productId: string) => {
    setSelectedProductId(productId);
    setShowForm(false);
  };

  const handleDetailsClose = () => {
    setSelectedProductId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Products</h2>
        {!showForm && !selectedProductId && (
          <Button onClick={handleAddNew} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        )}
      </div>

      {showForm ? (
        <ProductForm onComplete={handleFormComplete} />
      ) : selectedProductId ? (
        <ProductDetails productId={selectedProductId} onClose={handleDetailsClose} />
      ) : (
        <ProductList 
          products={products} 
          isLoading={isLoading} 
          onAddNewClick={handleAddNew}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
}