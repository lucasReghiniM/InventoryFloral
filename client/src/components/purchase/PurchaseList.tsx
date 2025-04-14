import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

interface Purchase {
  id: number;
  invoiceNumber: string;
  orderDate: string;
  supplier: string;
  totalAmount: number;
}

interface PurchaseListProps {
  purchases: Purchase[];
  isLoading: boolean;
  onViewDetails: (purchaseId: number) => void;
}

const PurchaseList: React.FC<PurchaseListProps> = ({
  purchases,
  isLoading,
  onViewDetails,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deletePurchaseMutation = useMutation({
    mutationFn: (id: number) => {
      console.log("🟡 Deletando purchase ID:", id, typeof id);
      return apiRequest(`/api/purchases/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/inventory-adjustments"],
      });

      toast({
        title: "Purchase deleted",
        description: "The purchase has been removed from the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete purchase",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this purchase? This action cannot be undone.",
      )
    ) {
      deletePurchaseMutation.mutate(id);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-6">Recent Purchases</h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                  Invoice #
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                  Date
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                  Supplier
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                  Total
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading purchases...
                  </TableCell>
                </TableRow>
              ) : purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No purchases found
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">
                      {purchase.invoiceNumber}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">
                      {format(new Date(purchase.orderDate), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">
                      {purchase.supplier}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-800">
                      ${purchase.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-primary hover:text-primary/90 hover:bg-primary/10"
                        onClick={() => onViewDetails(purchase.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDelete(purchase.id)}
                        disabled={deletePurchaseMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default PurchaseList;
