import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: number;
  name: string;
}

interface InventoryAdjustment {
  id: number;
  productId: number;
  adjustmentDate: string;
  adjustmentType: string;
  quantity: number;
  reason: string;
}

interface InventoryHistoryProps {
  adjustments: InventoryAdjustment[];
  products: Product[];
  isLoading: boolean;
}

const InventoryHistory: React.FC<InventoryHistoryProps> = ({ adjustments, products, isLoading }) => {
  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3"><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead className="px-4 py-3"><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead className="px-4 py-3"><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead className="px-4 py-3"><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead className="px-4 py-3"><Skeleton className="h-4 w-24" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3].map(i => (
                    <TableRow key={i}>
                      <TableCell className="px-4 py-3"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="px-4 py-3"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="px-4 py-3"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="px-4 py-3"><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell className="px-4 py-3"><Skeleton className="h-4 w-36" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">Data</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">Produto</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">Tipo</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">Quantidade</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">No inventory history found</TableCell>
                </TableRow>
              ) : (
                adjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">
                      {format(new Date(adjustment.adjustmentDate), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">
                      {getProductName(adjustment.productId)}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`${
                        adjustment.adjustmentType === "Incoming" 
                          ? "text-green-600" 
                          : "text-red-500"
                      } font-medium`}>
                        {adjustment.adjustmentType}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">
                      {adjustment.quantity}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">
                      {adjustment.reason}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryHistory;
