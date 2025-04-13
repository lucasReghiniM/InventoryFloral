import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, ChevronLeft, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface ProductDetailsProps {
  productId: string;
  onClose: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ productId, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPrice, setNewSupplierPrice] = useState("");
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/products/${productId}`);
      return response;
    },
  });

  const { data: adjustments, isLoading: isLoadingAdjustments } = useQuery({
    queryKey: ["/api/inventory-adjustments/product", productId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/inventory-adjustments/product/${productId}`);
      return response;
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/products/${productId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
      toast({
        title: "Product updated",
        description: "The product has been successfully updated.",
      });
      setShowAddSupplier(false);
      setNewSupplierName("");
      setNewSupplierPrice("");
    },
    onError: (error) => {
      toast({
        title: "Failed to update product",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const handleAddSupplier = () => {
    if (!newSupplierName.trim()) {
      toast({
        title: "Supplier name required",
        description: "Please enter a supplier name.",
        variant: "destructive",
      });
      return;
    }

    if (!newSupplierPrice || isNaN(parseFloat(newSupplierPrice)) || parseFloat(newSupplierPrice) <= 0) {
      toast({
        title: "Valid price required",
        description: "Please enter a valid price greater than zero.",
        variant: "destructive",
      });
      return;
    }

    // Check if supplier already exists
    const existingSupplierIndex = product.suppliers.findIndex(
      (s) => s.name.toLowerCase() === newSupplierName.toLowerCase()
    );

    const today = new Date().toISOString();
    const price = parseFloat(newSupplierPrice);

    let updatedSuppliers = [...product.suppliers];

    if (existingSupplierIndex >= 0) {
      // Add new price to existing supplier
      updatedSuppliers[existingSupplierIndex] = {
        ...updatedSuppliers[existingSupplierIndex],
        priceHistory: [
          ...updatedSuppliers[existingSupplierIndex].priceHistory,
          { date: today, price }
        ]
      };
    } else {
      // Add new supplier
      updatedSuppliers.push({
        name: newSupplierName,
        priceHistory: [{ date: today, price }]
      });
    }

    updateProductMutation.mutate({
      suppliers: updatedSuppliers
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="py-10 text-center">Loading product details...</div>
        </CardContent>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="py-10 text-center">
            <p className="text-red-500">Product not found</p>
            <Button onClick={onClose} variant="outline" className="mt-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onClose} className="p-2 mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">{product.name}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <Label className="text-sm font-medium text-neutral-500">Product ID</Label>
            <p className="text-neutral-800">{product.id}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-neutral-500">Current Stock</Label>
            <p className="text-neutral-800">{product.currentStock}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Suppliers & Pricing</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddSupplier(!showAddSupplier)}
              className="text-primary border-primary hover:bg-primary/10"
            >
              {showAddSupplier ? (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Supplier
                </>
              )}
            </Button>
          </div>

          {showAddSupplier && (
            <div className="p-4 bg-neutral-50 rounded-md mb-4 border border-neutral-200">
              <h4 className="font-medium mb-3">Add New Supplier</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="col-span-2">
                  <Label htmlFor="supplierName" className="mb-1 block">Supplier Name</Label>
                  <Input
                    id="supplierName"
                    placeholder="Enter supplier name"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supplierPrice" className="mb-1 block">Price</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-neutral-800 sm:text-sm">$</span>
                    </div>
                    <Input
                      id="supplierPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-7"
                      value={newSupplierPrice}
                      onChange={(e) => setNewSupplierPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleAddSupplier}
                  disabled={updateProductMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {updateProductMutation.isPending ? "Adding..." : "Add Supplier"}
                </Button>
              </div>
            </div>
          )}

          {product.suppliers.length === 0 ? (
            <div className="py-4 text-center border border-dashed border-neutral-200 rounded-md">
              <p className="text-neutral-500 mb-2">No suppliers added yet</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddSupplier(true)}
                className="text-primary hover:bg-primary/10"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Supplier
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Latest Price</TableHead>
                    <TableHead>Price History</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.suppliers.map((supplier, index) => {
                    const latestPrice = supplier.priceHistory.length > 0
                      ? supplier.priceHistory[supplier.priceHistory.length - 1]
                      : null;
                      
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>
                          {latestPrice ? (
                            <span className="font-semibold">${latestPrice.price.toFixed(2)}</span>
                          ) : (
                            <span className="text-neutral-400">No price</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-h-20 overflow-y-auto text-sm">
                            {supplier.priceHistory.map((priceRecord, idx) => (
                              <div key={idx} className="mb-1 last:mb-0">
                                <span className="text-neutral-500">
                                  {format(new Date(priceRecord.date), 'MMM d, yyyy')}:
                                </span>{" "}
                                <span className="font-medium">${priceRecord.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-4">Inventory History</h3>
          {isLoadingAdjustments ? (
            <div className="py-4 text-center">Loading inventory history...</div>
          ) : !adjustments || adjustments.length === 0 ? (
            <div className="py-4 text-center border border-dashed border-neutral-200 rounded-md">
              <p className="text-neutral-500">No inventory adjustments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      <TableCell>
                        {format(new Date(adjustment.adjustmentDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            adjustment.adjustmentType === "Incoming"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {adjustment.adjustmentType}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {adjustment.quantity}
                      </TableCell>
                      <TableCell>{adjustment.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDetails;