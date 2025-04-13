import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import SupplierList from "../components/supplier/SupplierList";
import SupplierForm from "../components/supplier/SupplierForm";
import { Plus } from "lucide-react";

export default function Suppliers() {
  const [showForm, setShowForm] = useState(false);
  
  // Fetch suppliers
  const {
    data: suppliers = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["/api/suppliers"],
    refetchOnWindowFocus: false
  });

  const handleAddNew = () => {
    setShowForm(true);
  };

  const handleFormComplete = () => {
    setShowForm(false);
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Suppliers</h2>
        <Button onClick={handleAddNew} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add New Supplier
        </Button>
      </div>

      {showForm ? (
        <SupplierForm onComplete={handleFormComplete} />
      ) : (
        <SupplierList 
          suppliers={suppliers} 
          isLoading={isLoading} 
          onAddNewClick={handleAddNew}
        />
      )}
    </div>
  );
}