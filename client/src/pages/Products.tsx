import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductList from "../components/product/ProductList";
import ProductForm from "../components/product/ProductForm";
import ProductDetails from "../components/product/ProductDetails";

export default function Products() {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const handleAddNewClick = () => {
    setActiveTab("add");
  };

  const handleProductCreated = () => {
    setActiveTab("list");
  };

  const handleViewDetails = (productId: string) => {
    setSelectedProductId(productId);
    setActiveTab("details");
  };

  const handleCloseDetails = () => {
    setSelectedProductId(null);
    setActiveTab("list");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Products</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Product List</TabsTrigger>
          <TabsTrigger value="add">Add Product</TabsTrigger>
          {selectedProductId && (
            <TabsTrigger value="details">Product Details</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="py-4">
          <ProductList 
            products={products || []} 
            isLoading={isLoading} 
            onAddNewClick={handleAddNewClick}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="add" className="py-4">
          <ProductForm onComplete={handleProductCreated} />
        </TabsContent>

        <TabsContent value="details" className="py-4">
          {selectedProductId && (
            <ProductDetails
              productId={selectedProductId}
              onClose={handleCloseDetails}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}