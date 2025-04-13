import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { v4 as uuidv4 } from 'uuid';

interface ProductFormProps {
  onComplete?: () => void;
}

const productFormSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  currentStock: z.number().min(0, { message: "Current stock must be a positive number" }),
});

const ProductForm: React.FC<ProductFormProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      currentStock: 0,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      toast({
        title: "Product created",
        description: "The product has been successfully created.",
      });
      
      reset();
      
      // Call onComplete if provided
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to create product",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof productFormSchema>) => {
    // Generate a UUID for the new product
    const newProductId = uuidv4();
    
    // Prepare product data
    const productData = {
      id: newProductId,
      name: data.name,
      currentStock: data.currentStock,
      suppliers: [],
    };

    createProductMutation.mutate(productData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-6">New Product</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="name" className="mb-1">Product Name</Label>
              <Input
                id="name"
                placeholder="Roses"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="currentStock" className="mb-1">Initial Stock</Label>
              <Input
                id="currentStock"
                type="number"
                min="0"
                {...register("currentStock", { valueAsNumber: true })}
                className={errors.currentStock ? "border-red-500" : ""}
              />
              {errors.currentStock && (
                <p className="text-red-500 text-sm mt-1">{errors.currentStock.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;