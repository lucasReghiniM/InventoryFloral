import React from "react";
import SaleForm from "../components/sales/SaleForm";
import SaleList from "../components/sales/SaleList";
import { useQuery } from "@tanstack/react-query";

const Sales: React.FC = () => {
  const { 
    data: sales, 
    isLoading: isSalesLoading 
  } = useQuery({
    queryKey: ["/api/sales"],
  });

  return (
    <div className="space-y-6">
      <SaleForm />
      <SaleList sales={sales || []} isLoading={isSalesLoading} />
    </div>
  );
};

export default Sales;
