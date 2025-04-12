import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

interface Sale {
  id: number;
  customerName: string;
  customerContact: string;
  saleDate: string;
  saleAmount: number;
}

interface SaleListProps {
  sales: Sale[];
  isLoading: boolean;
  onViewDetails?: (saleId: number) => void;
}

const SaleList: React.FC<SaleListProps> = ({ sales, isLoading, onViewDetails }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteSaleMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/sales/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-adjustments"] });
      
      toast({
        title: "Sale deleted",
        description: "The sale has been removed from the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete sale",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this sale? This action cannot be undone.")) {
      deleteSaleMutation.mutate(id);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-6">Recent Sales</h2>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">Date</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">Customer</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">Contact</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">Amount</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Loading sales...</TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">No sales found</TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">
                      {format(new Date(sale.saleDate), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">{sale.customerName}</TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">{sale.customerContact}</TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-800">
                      ${sale.saleAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800">
                      {onViewDetails && (
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-primary hover:text-primary/90 hover:bg-primary/10"
                          onClick={() => onViewDetails(sale.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDelete(sale.id)}
                        disabled={deleteSaleMutation.isPending}
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

export default SaleList;
