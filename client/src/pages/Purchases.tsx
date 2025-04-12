import React from "react";
import PurchaseForm from "../components/purchase/PurchaseForm";
import PurchaseList from "../components/purchase/PurchaseList";
import { useQuery } from "@tanstack/react-query";

const Purchases: React.FC = () => {
  const { 
    data: purchases, 
    isLoading: isPurchasesLoading 
  } = useQuery({
    queryKey: ["/api/purchases"],
  });

  return (
    <div className="space-y-6">
      <PurchaseForm />
      <PurchaseList purchases={purchases || []} isLoading={isPurchasesLoading} />
    </div>
  );
};

export default Purchases;
