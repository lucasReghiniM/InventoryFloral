import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import ProductItem from "./ProductItem";
import type { Product, Supplier } from "@shared/schema";

interface PurchaseFormProps {
  onComplete?: () => void;
}

const purchaseFormSchema = z.object({
  invoiceNumber: z.string().min(1, { message: "Invoice number is required" }),
  orderDate: z.string().min(1, { message: "Order date is required" }),
  supplier: z.string().min(1, { message: "Supplier name is required" }),
  deliveryCost: z.number().min(0, { message: "Delivery cost must be a positive number" }),
});

interface ProductItemData {
  id: string;
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  finalValue: number;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<ProductItemData[]>([{ 
    id: Date.now().toString(), 
    productId: 0,
    name: "", 
    unitPrice: 0, 
    quantity: 0, 
    finalValue: 0 
  }]);

  const { data: productsData = [], isLoading: isProductsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Transform products to the format expected by ProductItem
  const allProducts = React.useMemo(() => {
    return productsData.map(product => ({
      id: product.id as unknown as number, // ProductItem expects number but our IDs are strings
      name: product.name,
      unitPrice: product.suppliers && product.suppliers.length > 0 
        ? product.suppliers[0].priceHistory && product.suppliers[0].priceHistory.length > 0 
          ? product.suppliers[0].priceHistory[0].price 
          : 0
        : 0
    }));
  }, [productsData]);
  
  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const [supplierPopoverOpen, setSupplierPopoverOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<z.infer<typeof purchaseFormSchema>>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      invoiceNumber: "",
      orderDate: new Date().toISOString().split('T')[0],
      supplier: "",
      deliveryCost: 0,
    },
  });

  const deliveryCost = watch("deliveryCost");

  const createPurchaseMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/purchases", data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-adjustments"] });
      
      toast({
        title: "Purchase added successfully",
        description: "The purchase has been recorded.",
      });
      
      reset();
      setProducts([{ 
        id: Date.now().toString(), 
        productId: 0,
        name: "", 
        unitPrice: 0, 
        quantity: 0, 
        finalValue: 0 
      }]);
      
      // Call onComplete if provided
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to add purchase",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const addProduct = () => {
    setProducts([
      ...products,
      { 
        id: Date.now().toString(), 
        productId: 0,
        name: "", 
        unitPrice: 0, 
        quantity: 0, 
        finalValue: 0 
      },
    ]);
  };

  const removeProduct = (id: string) => {
    if (products.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one product is required",
        variant: "destructive",
      });
      return;
    }
    
    setProducts(products.filter((product) => product.id !== id));
  };

  const updateProduct = (id: string, data: Partial<ProductItemData>) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, ...data } : product
      )
    );
  };

  const getSubtotal = () => {
    return products.reduce((total, product) => total + product.finalValue, 0);
  };

  const getTotal = () => {
    return getSubtotal() + (deliveryCost || 0);
  };

  const onSubmit = (data: z.infer<typeof purchaseFormSchema>) => {
    // Validate products
    const validProducts = products.filter(
      (product) => product.productId > 0 && product.name && product.unitPrice > 0 && product.quantity > 0
    );

    if (validProducts.length === 0) {
      toast({
        title: "Invalid products",
        description: "Please add at least one valid product with a selected product from the dropdown",
        variant: "destructive",
      });
      return;
    }
    
    // Check if any product is missing a selection
    const hasUnselectedProducts = products.some(product => !product.productId || product.productId <= 0);
    if (hasUnselectedProducts) {
      toast({
        title: "Product selection required",
        description: "Please select a product for each item from the dropdown",
        variant: "destructive",
      });
      return;
    }

    // Prepare purchase data
    const purchaseData = {
      purchase: {
        invoiceNumber: data.invoiceNumber,
        orderDate: new Date(data.orderDate).toISOString(),
        supplier: data.supplier,
        deliveryCost: data.deliveryCost,
        totalAmount: getTotal(),
      },
      items: products.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        finalValue: product.finalValue,
      })),
    };

    createPurchaseMutation.mutate(purchaseData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-6">New Purchase</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="invoiceNumber" className="mb-1">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                placeholder="INV-00001"
                {...register("invoiceNumber")}
                className={errors.invoiceNumber ? "border-red-500" : ""}
              />
              {errors.invoiceNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.invoiceNumber.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="orderDate" className="mb-1">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                {...register("orderDate")}
                className={errors.orderDate ? "border-red-500" : ""}
              />
              {errors.orderDate && (
                <p className="text-red-500 text-sm mt-1">{errors.orderDate.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="supplier" className="mb-1">Supplier Name</Label>
              <Popover open={supplierPopoverOpen} onOpenChange={setSupplierPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={supplierPopoverOpen}
                    className={`w-full justify-between ${errors.supplier ? "border-red-500" : ""}`}
                  >
                    {watch("supplier") || "Select a supplier..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search suppliers..." />
                    <CommandEmpty>No supplier found.</CommandEmpty>
                    <CommandGroup>
                      {suppliers.map((supplier) => (
                        <CommandItem
                          key={supplier.id}
                          value={supplier.id}
                          onSelect={() => {
                            setValue("supplier", supplier.name);
                            setSelectedSupplierId(supplier.id);
                            setSupplierPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              watch("supplier") === supplier.name ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {supplier.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <input type="hidden" {...register("supplier")} />
              {errors.supplier && (
                <p className="text-red-500 text-sm mt-1">{errors.supplier.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="deliveryCost" className="mb-1">Delivery Cost</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-neutral-800 sm:text-sm">$</span>
                </div>
                <Input
                  id="deliveryCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`pl-7 ${errors.deliveryCost ? "border-red-500" : ""}`}
                  {...register("deliveryCost", { valueAsNumber: true })}
                />
              </div>
              {errors.deliveryCost && (
                <p className="text-red-500 text-sm mt-1">{errors.deliveryCost.message}</p>
              )}
            </div>
          </div>
          
          <h3 className="font-semibold mb-3 text-neutral-800">Products</h3>
          
          <div className="mb-6 space-y-4">
            {products.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                products={allProducts || []}
                onRemove={() => removeProduct(product.id)}
                onChange={(data) => updateProduct(product.id, data)}
              />
            ))}
          </div>
          
          <Button
            type="button"
            variant="ghost"
            onClick={addProduct}
            className="mb-6 text-primary hover:text-primary/90 hover:bg-primary/10"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t pt-4 border-neutral-200">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center">
                <span className="font-semibold text-neutral-800">Subtotal:</span>
                <span className="ml-2">${getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex items-center mt-1">
                <span className="font-semibold text-neutral-800">Delivery:</span>
                <span className="ml-2">${(deliveryCost || 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center mt-1">
                <span className="font-semibold text-neutral-800">Total:</span>
                <span className="ml-2 text-lg font-semibold text-primary">${getTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              disabled={createPurchaseMutation.isPending}
            >
              {createPurchaseMutation.isPending ? "Saving..." : "Save Purchase"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PurchaseForm;
