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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { Supplier } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) {
      return;
    }

    try {
      await apiRequest(`/api/suppliers/${id}`, {
        method: "DELETE",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });

      toast({
        title: "Success",
        description: "Supplier has been deleted",
      });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error",
        description: "Failed to delete supplier. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
          <CardDescription>
            Loading suppliers...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suppliers</CardTitle>
        <CardDescription>
          Manage your flower suppliers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground pb-4">No suppliers found</p>
            <Button onClick={onAddNewClick} className="flex mx-auto items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Your First Supplier
            </Button>
          </div>
        ) : (
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
                      size="sm"
                      onClick={() => handleDelete(supplier.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SupplierList;