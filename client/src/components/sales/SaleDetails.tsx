import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SaleDetailsProps {
  saleId: number;
  onClose: () => void;
}

const SaleDetails: React.FC<SaleDetailsProps> = ({ saleId, onClose }) => {
  const { data: sale, isLoading: isSaleLoading } = useQuery({
    queryKey: [`/api/sales/${saleId}`],
  });

  const { data: saleItems, isLoading: isSaleItemsLoading } = useQuery({
    queryKey: [`/api/sales/${saleId}/items`],
  });

  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  if (isSaleLoading || isSaleItemsLoading || isProductsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sale) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p>Sale not found</p>
            <Button onClick={onClose} className="mt-4">Back to Sales</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Function to get product name by ID
  const getProductName = (productId: number) => {
    const product = products?.find(p => p.id === productId);
    return product?.name || `Product ${productId}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <CardTitle>Sale Details</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Customer Name</h3>
            <p className="text-lg font-semibold">{sale.customerName}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Customer Contact</h3>
            <p className="text-lg font-semibold">{sale.customerContact}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Sale Date</h3>
            <p className="text-lg font-semibold">{format(new Date(sale.saleDate), 'MMMM d, yyyy')}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
            <p className="text-lg font-semibold">${sale.saleAmount.toFixed(2)}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Products Used</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saleItems && saleItems.length > 0 ? (
                saleItems.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{getProductName(item.productId)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No items found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
          <p className="text-xl font-bold">${sale.saleAmount.toFixed(2)}</p>
        </div>
        <Button onClick={onClose} variant="outline">Back</Button>
      </CardFooter>
    </Card>
  );
};

export default SaleDetails;