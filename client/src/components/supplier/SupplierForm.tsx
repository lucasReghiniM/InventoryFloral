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

interface SupplierFormProps {
  onComplete?: () => void;
}

const supplierFormSchema = z.object({
  name: z.string().min(1, { message: "Supplier name is required" }),
});

const SupplierForm: React.FC<SupplierFormProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/suppliers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      
      toast({
        title: "Supplier created",
        description: "The supplier has been successfully added.",
      });
      
      reset();
      
      // Call onComplete if provided
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to create supplier",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof supplierFormSchema>) => {
    // Generate a UUID for the new supplier
    const newSupplierId = uuidv4();
    
    // Prepare supplier data
    const supplierData = {
      id: newSupplierId,
      name: data.name,
    };

    createSupplierMutation.mutate(supplierData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-6">New Supplier</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <Label htmlFor="name" className="mb-1">Supplier Name</Label>
            <Input
              id="name"
              placeholder="Flower Wholesaler Inc."
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={createSupplierMutation.isPending}
            >
              {createSupplierMutation.isPending ? "Saving..." : "Save Supplier"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupplierForm;