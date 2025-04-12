import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ProductUsedItem from "./ProductUsedItem";

const saleFormSchema = z.object({
  customerName: z.string().min(1, { message: "Customer name is required" }),
  customerContact: z.string().min(1, { message: "Customer contact is required" }),
  saleDate: z.string().min(1, { message: "Sale date is required" }),
  saleAmount: z.number().min(0.01, { message: "Sale amount must be greater than 0" }),
});

interface ProductUsedData {
  id: string;
  productId: number;
  quantity: number;
}

const SaleForm: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productsUsed, setProductsUsed] = useState<ProductUsedData[]>([{ 
    id: Date.now().toString(), 
    productId: 0, 
    quantity: 0 
  }]);

  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof saleFormSchema>>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customerName: "",
      customerContact: "",
      saleDate: new Date().toISOString().split('T')[0],
      saleAmount: 0,
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/sales", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-adjustments"] });
      
      toast({
        title: "Sale added successfully",
        description: "The sale has been recorded.",
      });
      
      reset();
      setProductsUsed([{ 
        id: Date.now().toString(), 
        productId: 0, 
        quantity: 0 
      }]);
    },
    onError: (error) => {
      toast({
        title: "Failed to add sale",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const addProductUsed = () => {
    setProductsUsed([
      ...productsUsed,
      { id: Date.now().toString(), productId: 0, quantity: 0 },
    ]);
  };

  const removeProductUsed = (id: string) => {
    if (productsUsed.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one product is required",
        variant: "destructive",
      });
      return;
    }
    
    setProductsUsed(productsUsed.filter((product) => product.id !== id));
  };

  const updateProductUsed = (id: string, data: Partial<ProductUsedData>) => {
    setProductsUsed(
      productsUsed.map((product) =>
        product.id === id ? { ...product, ...data } : product
      )
    );
  };

  const onSubmit = (data: z.infer<typeof saleFormSchema>) => {
    // Validate products used
    const validProducts = productsUsed.filter(
      (product) => product.productId > 0 && product.quantity > 0
    );

    if (validProducts.length === 0) {
      toast({
        title: "Invalid products",
        description: "Please add at least one valid product",
        variant: "destructive",
      });
      return;
    }

    // Prepare sale data
    const saleData = {
      sale: {
        customerName: data.customerName,
        customerContact: data.customerContact,
        saleDate: new Date(data.saleDate).toISOString(),
        saleAmount: data.saleAmount,
      },
      items: productsUsed.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
      })),
    };

    createSaleMutation.mutate(saleData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-6">New Sale</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="customerName" className="mb-1">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="John Doe"
                {...register("customerName")}
                className={errors.customerName ? "border-red-500" : ""}
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="customerContact" className="mb-1">Customer Contact</Label>
              <Input
                id="customerContact"
                placeholder="Phone or Email"
                {...register("customerContact")}
                className={errors.customerContact ? "border-red-500" : ""}
              />
              {errors.customerContact && (
                <p className="text-red-500 text-sm mt-1">{errors.customerContact.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="saleDate" className="mb-1">Sale Date</Label>
              <Input
                id="saleDate"
                type="date"
                {...register("saleDate")}
                className={errors.saleDate ? "border-red-500" : ""}
              />
              {errors.saleDate && (
                <p className="text-red-500 text-sm mt-1">{errors.saleDate.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="saleAmount" className="mb-1">Sale Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-neutral-800 sm:text-sm">$</span>
                </div>
                <Input
                  id="saleAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`pl-7 ${errors.saleAmount ? "border-red-500" : ""}`}
                  {...register("saleAmount", { valueAsNumber: true })}
                />
              </div>
              {errors.saleAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.saleAmount.message}</p>
              )}
            </div>
          </div>
          
          <h3 className="font-semibold mb-3 text-neutral-800">Products Used</h3>
          
          <div className="mb-6 space-y-4">
            {productsUsed.map((product) => (
              <ProductUsedItem
                key={product.id}
                product={product}
                products={products || []}
                onRemove={() => removeProductUsed(product.id)}
                onChange={(data) => updateProductUsed(product.id, data)}
              />
            ))}
          </div>
          
          <Button
            type="button"
            variant="ghost"
            onClick={addProductUsed}
            className="mb-6 text-primary hover:text-primary/90 hover:bg-primary/10"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={createSaleMutation.isPending}
            >
              {createSaleMutation.isPending ? "Saving..." : "Complete Sale"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SaleForm;
