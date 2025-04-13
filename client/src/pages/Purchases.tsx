import React, { useState } from "react";
import PurchaseForm from "../components/purchase/PurchaseForm";
import PurchaseList from "../components/purchase/PurchaseList";
import PurchaseDetails from "../components/purchase/PurchaseDetails";
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

const Purchases: React.FC = () => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  
  const { 
    data: purchases, 
    isLoading: isPurchasesLoading 
  } = useQuery({
    queryKey: ["/api/purchases"],
  });

  const handleViewDetails = (purchaseId: number) => {
    setSelectedPurchaseId(purchaseId);
  };

  const handleCloseDetails = () => {
    setSelectedPurchaseId(null);
  };

  return (
    <div className="space-y-6">
      {selectedPurchaseId ? (
        <PurchaseDetails 
          purchaseId={selectedPurchaseId} 
          onClose={handleCloseDetails} 
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Compras</h1>
            <Button 
              onClick={() => setShowNewForm(!showNewForm)}
              variant={showNewForm ? "outline" : "default"}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              {showNewForm ? "Cancel" : "New Purchase"}
            </Button>
          </div>

          {showNewForm && (
            <Card>
              <CardHeader>
                <CardTitle>Nova compra</CardTitle>
                <CardDescription>Adicione uma nova compra no seu inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <PurchaseForm onComplete={() => setShowNewForm(false)} />
              </CardContent>
            </Card>
          )}

          <PurchaseList 
            purchases={purchases || []} 
            isLoading={isPurchasesLoading} 
            onViewDetails={handleViewDetails}
          />
        </>
      )}
    </div>
  );
};

export default Purchases;
