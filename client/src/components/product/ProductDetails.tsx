import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "../../hooks/use-toast";
import { format } from "date-fns";
import { X, ChevronLeft, Plus } from "lucide-react";

interface ProductDetailsProps {
  productId: string;
  onClose: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ productId, onClose }) => {
  const { toast } = useToast();
  const [supplierName, setSupplierName] = useState("");
  const [supplierPrice, setSupplierPrice] = useState("");
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  
  // Fetch product details
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/products/${productId}`);
        return response;
      } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
  });

  // Fetch inventory adjustments
  const {
    data: adjustments = [],
    isLoading: isLoadingAdjustments,
  } = useQuery({
    queryKey: ["/api/inventory-adjustments", "product", productId],
    queryFn: async () => {
      const response = await apiRequest(`/api/inventory-adjustments/product/${productId}`);
      return response;
    },
    refetchOnWindowFocus: false,
  });

  const handleAddSupplier = async () => {
    if (!supplierName.trim() || !supplierPrice.trim() || parseFloat(supplierPrice) <= 0) {
      return;
    }

    try {
      // Get existing suppliers
      const existingSuppliers = product.suppliers || [];
      
      // Check if supplier already exists
      const supplierExists = existingSuppliers.some(s => 
        s.name.toLowerCase() === supplierName.toLowerCase()
      );
      
      if (supplierExists) {
        toast({
          title: "Supplier already exists",
          description: "This supplier is already added to this product.",
          variant: "destructive",
        });
        return;
      }
      
      // Create new supplier entry
      const newSupplier = {
        name: supplierName.trim(),
        priceHistory: [
          {
            date: new Date().toISOString(),
            price: parseFloat(supplierPrice),
          },
        ],
      };
      
      // Update product with new supplier
      await apiRequest(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({
          suppliers: [...existingSuppliers, newSupplier],
        }),
      });
      
      toast({
        title: "Success",
        description: "Supplier has been added to this product",
      });
      
      setSupplierName("");
      setSupplierPrice("");
      setShowAddSupplier(false);
      refetch();
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast({
        title: "Error",
        description: "Failed to add supplier. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePrice = async (supplierIndex: number, newPrice: string) => {
    try {
      const priceValue = parseFloat(newPrice);
      if (isNaN(priceValue) || priceValue <= 0) {
        toast({
          title: "Invalid price",
          description: "Please enter a valid price.",
          variant: "destructive",
        });
        return;
      }
      
      // Get existing suppliers
      const existingSuppliers = [...product.suppliers];
      const supplier = existingSuppliers[supplierIndex];
      
      // Add new price record
      supplier.priceHistory.push({
        date: new Date().toISOString(),
        price: priceValue,
      });
      
      // Update product with updated suppliers
      await apiRequest(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({
          suppliers: existingSuppliers,
        }),
      });
      
      toast({
        title: "Success",
        description: "Price has been updated",
      });
      
      refetch();
    } catch (error) {
      console.error("Error updating price:", error);
      toast({
        title: "Error",
        description: "Failed to update price. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Skeleton className="h-7 w-52 ml-2" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (isError || !product) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <CardTitle className="ml-2">Product Not Found</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The product could not be found or there was an error loading the product details.
            This might be because the product ID format has changed or the product has been deleted.
          </p>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="mt-4"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <CardTitle className="ml-2">{product.name}</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            ID: {product.id}
          </div>
        </div>
        <CardDescription>
          Current Stock: {product.currentStock} units
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suppliers">
          <TabsList className="mb-4">
            <TabsTrigger value="suppliers">Suppliers & Prices</TabsTrigger>
            <TabsTrigger value="history">Inventory History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Product Suppliers</h3>
              {!showAddSupplier && (
                <Button 
                  size="sm" 
                  onClick={() => setShowAddSupplier(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Supplier
                </Button>
              )}
            </div>
            
            {showAddSupplier && (
              <div className="p-4 border rounded-md space-y-3">
                <div>
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input
                    id="supplierName"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Enter supplier name"
                  />
                </div>
                <div>
                  <Label htmlFor="supplierPrice">Price</Label>
                  <Input
                    id="supplierPrice"
                    type="number"
                    step="0.01"
                    value={supplierPrice}
                    onChange={(e) => setSupplierPrice(e.target.value)}
                    placeholder="Enter price"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setShowAddSupplier(false);
                      setSupplierName("");
                      setSupplierPrice("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddSupplier}>
                    Add Supplier
                  </Button>
                </div>
              </div>
            )}
            
            {product.suppliers.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">No suppliers added yet</p>
                {!showAddSupplier && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowAddSupplier(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Your First Supplier
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {product.suppliers.map((supplier, index) => {
                  const currentPrice = supplier.priceHistory[supplier.priceHistory.length - 1].price;
                  // Each supplier needs its own state
                  const key = `${supplier.name}-${index}`;
                  // These states are managed at the component level
                  const [priceInputs, setPriceInputs] = useState<{[key: string]: string}>({});
                  const [showUpdatePrices, setShowUpdatePrices] = useState<{[key: string]: boolean}>({});
                  
                  const priceInput = priceInputs[key] || "";
                  const showUpdatePrice = showUpdatePrices[key] || false;
                  
                  const setPriceInput = (value: string) => {
                    setPriceInputs({...priceInputs, [key]: value});
                  };
                  
                  const setShowUpdatePrice = (value: boolean) => {
                    setShowUpdatePrices({...showUpdatePrices, [key]: value});
                  };
                  
                  return (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{supplier.name}</h4>
                        <div className="text-sm">
                          Current Price: ${currentPrice.toFixed(2)}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => setShowUpdatePrice(!showUpdatePrice)}
                          >
                            Update
                          </Button>
                        </div>
                      </div>
                      
                      {showUpdatePrice && (
                        <div className="mt-2 flex items-end gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`new-price-${index}`}>New Price</Label>
                            <Input
                              id={`new-price-${index}`}
                              type="number"
                              step="0.01"
                              placeholder="Enter new price"
                              value={priceInput}
                              onChange={(e) => setPriceInput(e.target.value)}
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              handleUpdatePrice(index, priceInput);
                              setShowUpdatePrice(false);
                              setPriceInput("");
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowUpdatePrice(false);
                              setPriceInput("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      {supplier.priceHistory.length > 1 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-2">Price History</h5>
                          <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
                            {supplier.priceHistory.slice().reverse().map((priceRecord, idx) => (
                              <div key={idx} className="flex justify-between text-muted-foreground">
                                <span>{format(new Date(priceRecord.date), "MMM d, yyyy")}</span>
                                <span>${priceRecord.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <h3 className="text-lg font-medium mb-4">Inventory Adjustments</h3>
            
            {isLoadingAdjustments ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : adjustments.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">No inventory adjustments recorded</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      <TableCell>
                        {format(new Date(adjustment.adjustmentDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <span className={adjustment.adjustmentType === "Incoming" ? "text-green-600" : "text-red-600"}>
                          {adjustment.adjustmentType}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {adjustment.quantity}
                      </TableCell>
                      <TableCell>{adjustment.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProductDetails;