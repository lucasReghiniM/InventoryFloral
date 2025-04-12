import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: number;
  name: string;
}

interface RemoveProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number | null;
  products: Product[];
}

const RemoveProductModal: React.FC<RemoveProductModalProps> = ({ 
  isOpen, 
  onClose, 
  productId,
  products
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");

  // Update selected product when productId prop changes
  useEffect(() => {
    if (productId) {
      setSelectedProductId(productId.toString());
    }
  }, [productId]);

  const resetForm = () => {
    setSelectedProductId("");
    setReason("");
    setQuantity(1);
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const createAdjustmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/inventory-adjustments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-adjustments"] });
      
      toast({
        title: "Inventory adjusted",
        description: "The inventory has been updated successfully.",
      });
      
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to adjust inventory",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedProductId) {
      toast({
        title: "Product required",
        description: "Please select a product.",
        variant: "destructive",
      });
      return;
    }

    if (!reason) {
      toast({
        title: "Reason required",
        description: "Please select a reason for the adjustment.",
        variant: "destructive",
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Quantity must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    const adjustmentData = {
      productId: parseInt(selectedProductId),
      adjustmentDate: new Date().toISOString(),
      adjustmentType: "Outgoing",
      quantity,
      reason: reason === "other" ? (notes || "Other") : reason,
      notes: notes || null,
    };

    createAdjustmentMutation.mutate(adjustmentData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Product</DialogTitle>
          <DialogDescription>
            Remove items from inventory with a reason.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="product">Product</Label>
            <Select value={selectedProductId || "0"} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Select product</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason || "default"} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Select reason</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={createAdjustmentMutation.isPending}
          >
            {createAdjustmentMutation.isPending ? "Removing..." : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveProductModal;
