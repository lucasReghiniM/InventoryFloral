import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PurchaseDetailsProps {
  purchaseId: number;
  onClose: () => void;
}

const PurchaseDetails: React.FC<PurchaseDetailsProps> = ({ purchaseId, onClose }) => {
  const { data: purchase, isLoading: isPurchaseLoading } = useQuery({
    queryKey: [`/api/purchases/${purchaseId}`],
  });

  const { data: purchaseItems, isLoading: isPurchaseItemsLoading } = useQuery({
    queryKey: [`/api/purchases/${purchaseId}/items`],
  });

  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  if (isPurchaseLoading || isPurchaseItemsLoading || isProductsLoading) {
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

  if (!purchase) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p>Purchase not found</p>
            <Button onClick={onClose} className="mt-4">Back to Purchases</Button>
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
        <CardTitle>Purchase Details</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Invoice Number</h3>
            <p className="text-lg font-semibold">{purchase.invoiceNumber}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Order Date</h3>
            <p className="text-lg font-semibold">{format(new Date(purchase.orderDate), 'MMMM d, yyyy')}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>
            <p className="text-lg font-semibold">{purchase.supplier}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Delivery Cost</h3>
            <p className="text-lg font-semibold">${purchase.deliveryCost.toFixed(2)}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Products</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseItems && purchaseItems.length > 0 ? (
                purchaseItems.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{getProductName(item.productId)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>${item.finalValue.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No items found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
          <p className="text-xl font-bold">${purchase.totalAmount.toFixed(2)}</p>
        </div>
        <Button onClick={onClose} variant="outline">Back</Button>
      </CardFooter>
    </Card>
  );
};

export default PurchaseDetails;