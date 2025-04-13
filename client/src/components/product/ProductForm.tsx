import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertProductSchema } from "@shared/schema";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { z } from "zod";
import { useToast } from "../../hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X, Plus } from "lucide-react";

interface ProductFormProps {
  onComplete?: () => void;
}

const validationSchema = insertProductSchema.extend({
  name: z.string().min(1, "Product name is required"),
  currentStock: z.number().min(0, "Stock must be 0 or greater"),
});

type FormValues = z.infer<typeof validationSchema>;

const ProductForm: React.FC<ProductFormProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Array<{ name: string; price: number }>>([]);
  const [supplierName, setSupplierName] = useState("");
  const [supplierPrice, setSupplierPrice] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: "",
      currentStock: 0,
      suppliers: [],
    },
  });

  const addSupplier = () => {
    if (supplierName.trim() && parseFloat(supplierPrice) > 0) {
      setSuppliers([
        ...suppliers,
        { name: supplierName.trim(), price: parseFloat(supplierPrice) },
      ]);
      setSupplierName("");
      setSupplierPrice("");
    }
  };

  const removeSupplier = (index: number) => {
    setSuppliers(suppliers.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Transform suppliers to the format required by the API
      const formattedSuppliers = suppliers.map((s) => ({
        name: s.name,
        priceHistory: [
          {
            date: new Date().toISOString(),
            price: s.price,
          },
        ],
      }));

      const productData = {
        ...data,
        id: uuidv4(), // Generate UUID for product
        suppliers: formattedSuppliers,
      };

      await apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      });

      // Invalidate the products query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });

      toast({
        title: "Success",
        description: "Product has been created successfully",
      });

      onComplete?.();
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Stock</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div>
                <FormLabel>Product Suppliers</FormLabel>
                <div className="mt-2 space-y-4">
                  {suppliers.map((supplier, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <span className="font-medium">{supplier.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ${supplier.price.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSupplier(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Supplier name"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={supplierPrice}
                    onChange={(e) => setSupplierPrice(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addSupplier}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onComplete?.()}
              >
                Cancel
              </Button>
              <Button type="submit">Create Product</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;