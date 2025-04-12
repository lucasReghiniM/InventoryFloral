import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, MinusCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: number;
  name: string;
  unitPrice: number;
  currentStock: number;
}

interface InventoryListProps {
  products: Product[];
  isLoading: boolean;
  onRemoveClick: (productId: number) => void;
}

// Flower images from Unsplash
const flowerImages = [
  "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=450&q=80",
  "https://images.unsplash.com/photo-1589244159943-460088ed5c92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=450&q=80",
  "https://images.unsplash.com/photo-1585559604530-6ffe8973175d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=450&q=80",
  "https://images.unsplash.com/photo-1471696035578-3d8c78d99684?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=450&q=80"
];

const InventoryList: React.FC<InventoryListProps> = ({ products, isLoading, onRemoveClick }) => {
  // Get a flower image based on product id
  const getFlowerImage = (productId: number) => {
    return flowerImages[productId % flowerImages.length];
  };

  // Determine stock status
  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) {
      return { label: "Out of Stock", className: "bg-red-500 text-white" };
    } else if (quantity < 5) {
      return { label: "Low Stock", className: "bg-warning text-neutral-800" };
    } else {
      return { label: "In Stock", className: "bg-green-600 text-white" };
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-neutral-600">No inventory items found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {products.map((product) => {
        const stockStatus = getStockStatus(product.currentStock);
        const inventoryValue = product.unitPrice * product.currentStock;
        
        return (
          <Card key={product.id} className="overflow-hidden">
            <AspectRatio ratio={16/9} className="bg-accent">
              <img 
                src={getFlowerImage(product.id)} 
                alt={product.name} 
                className="object-cover w-full h-48" 
              />
            </AspectRatio>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-neutral-800">{product.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.className}`}>
                  {stockStatus.label}
                </span>
              </div>
              <div className="mt-2 text-sm text-neutral-800">
                <div className="flex justify-between mb-1">
                  <span>Current Stock:</span>
                  <span className="font-medium">{product.currentStock} units</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Unit Price:</span>
                  <span className="font-medium">${product.unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Inventory Value:</span>
                  <span className="font-medium">${inventoryValue.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/90 hover:bg-primary/10 p-0 h-8"
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-100 p-0 h-8"
                  onClick={() => onRemoveClick(product.id)}
                >
                  <MinusCircle className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InventoryList;
