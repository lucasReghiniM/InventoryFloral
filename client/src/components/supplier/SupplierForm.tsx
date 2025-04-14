import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertSupplierSchema } from "@shared/schema";
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

interface SupplierFormProps {
  onComplete?: () => void;
}

const validationSchema = insertSupplierSchema.extend({
  name: z.string().min(1, "Supplier name is required"),
});

type FormValues = z.infer<typeof validationSchema>;

const SupplierForm: React.FC<SupplierFormProps> = ({ onComplete }) => {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const supplierData = {
        ...data,
        id: uuidv4(), // Generate UUID for supplier
      };

      await apiRequest("/api/suppliers", {
        method: "POST",
        body: JSON.stringify(supplierData),
      });

      // Invalidate the suppliers query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });

      toast({
        title: "Success",
        description: "Supplier has been created successfully",
      });

      onComplete?.();
    } catch (error) {
      console.error("Error creating supplier:", error);
      toast({
        title: "Error",
        description: "Failed to create supplier. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar novo Fornecedor</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Fornecedor</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do Fornecedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onComplete?.()}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar fornecedor</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SupplierForm;