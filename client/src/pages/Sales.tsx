import React, { useState } from "react";
import SaleForm from "../components/sales/SaleForm";
import SaleList from "../components/sales/SaleList";
import SaleDetails from "../components/sales/SaleDetails";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

const Sales: React.FC = () => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  
  const { 
    data: sales, 
    isLoading: isSalesLoading 
  } = useQuery({
    queryKey: ["/api/sales"],
  });

  const handleViewDetails = (saleId: number) => {
    setSelectedSaleId(saleId);
  };

  const handleCloseDetails = () => {
    setSelectedSaleId(null);
  };

  return (
    <div className="space-y-6">
      {selectedSaleId ? (
        <SaleDetails 
          saleId={selectedSaleId} 
          onClose={handleCloseDetails} 
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Sales</h1>
            <Button 
              onClick={() => setShowNewForm(!showNewForm)}
              variant={showNewForm ? "outline" : "default"}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              {showNewForm ? "Cancel" : "New Sale"}
            </Button>
          </div>

          {showNewForm && (
            <Card>
              <CardHeader>
                <CardTitle>New Sale</CardTitle>
                <CardDescription>Add a new sale to your records</CardDescription>
              </CardHeader>
              <CardContent>
                <SaleForm onComplete={() => setShowNewForm(false)} />
              </CardContent>
            </Card>
          )}

          <SaleList 
            sales={sales || []} 
            isLoading={isSalesLoading} 
            onViewDetails={handleViewDetails}
          />
        </>
      )}
    </div>
  );
};

export default Sales;
