import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id: number;
  name: string;
}

interface ProductUsedData {
  id: string;
  productId: number;
  quantity: number;
}

interface ProductUsedItemProps {
  product: ProductUsedData;
  products: Product[];
  onRemove: () => void;
  onChange: (data: Partial<ProductUsedData>) => void;
}

const ProductUsedItem: React.FC<ProductUsedItemProps> = ({ product, products, onRemove, onChange }) => {
  return (
    <div className="bg-neutral-100 p-4 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label className="mb-1">Nome do produto</Label>
          <Select
            value={product.productId > 0 ? product.productId.toString() : "0"}
            onValueChange={(value) => onChange({ productId: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Selecionar produto</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="mb-1">Quantidade</Label>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={product.quantity || ""}
            onChange={(e) => onChange({ quantity: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={onRemove}
        className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-100 p-0 h-8"
      >
        <Trash className="h-4 w-4 mr-1" />
        <span className="text-sm">Remover</span>
      </Button>
    </div>
  );
};

export default ProductUsedItem;
