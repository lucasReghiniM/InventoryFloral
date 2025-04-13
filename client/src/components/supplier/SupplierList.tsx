import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Supplier } from "../../../shared/schema";

interface SupplierListProps {
  suppliers: Supplier[];
  isLoading: boolean;
  onAddNewClick: () => void;
}

const SupplierList: React.FC<SupplierListProps> = ({
  suppliers,
  isLoading,
  onAddNewClick,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteSupplierMutation = useMutation({
    mutationFn: (supplierId: string) => apiRequest("DELETE", `/api/suppliers/${supplierId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Supplier deleted",
        description: "The supplier has been successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete supplier. It may be associated with products.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (supplierId: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      deleteSupplierMutation.mutate(supplierId);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Suppliers Directory</h2>
          <Button onClick={onAddNewClick} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add New Supplier
          </Button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center">Loading suppliers...</div>
        ) : suppliers.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-neutral-500 mb-4">No suppliers found</p>
            <Button onClick={onAddNewClick} variant="outline">
              Add your first supplier
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(supplier.id)}
                        title="Delete Supplier"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupplierList;