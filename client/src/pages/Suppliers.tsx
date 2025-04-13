import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SupplierList from "../components/supplier/SupplierList";
import SupplierForm from "../components/supplier/SupplierForm";

export default function Suppliers() {
  const [activeTab, setActiveTab] = useState("list");

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  const handleAddNewClick = () => {
    setActiveTab("add");
  };

  const handleSupplierCreated = () => {
    setActiveTab("list");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Suppliers</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Supplier List</TabsTrigger>
          <TabsTrigger value="add">Add Supplier</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="py-4">
          <SupplierList 
            suppliers={suppliers || []} 
            isLoading={isLoading} 
            onAddNewClick={handleAddNewClick}
          />
        </TabsContent>

        <TabsContent value="add" className="py-4">
          <SupplierForm onComplete={handleSupplierCreated} />
        </TabsContent>
      </Tabs>
    </div>
  );
}