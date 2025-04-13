import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash, Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Product {
  id: number;
  name: string;
  unitPrice: number;
}

interface ProductItemData {
  id: string;
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  finalValue: number;
}

interface ProductItemProps {
  product: ProductItemData;
  products: Product[];
  onRemove: () => void;
  onChange: (data: Partial<ProductItemData>) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, products, onRemove, onChange }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Calculate final value whenever unit price or quantity changes
    const finalValue = product.unitPrice * product.quantity;
    if (finalValue !== product.finalValue) {
      onChange({ finalValue });
    }
  }, [product.unitPrice, product.quantity]);

  const handleExistingProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === parseInt(productId));
    if (selectedProduct) {
      onChange({
        productId: selectedProduct.id,
        name: selectedProduct.name,
        unitPrice: selectedProduct.unitPrice
      });
      setOpen(false);
    }
  };

  return (
    <div className="bg-neutral-100 p-4 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label className="mb-1">Product Name</Label>
          {products.length > 0 ? (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {product.productId > 0
                    ? products.find((p) => p.id === product.productId)?.name
                    : "Search products..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search products..." />
                  <CommandEmpty>No product found.</CommandEmpty>
                  <CommandGroup>
                    {products.map((p) => (
                      <CommandItem
                        key={p.id}
                        value={p.id.toString()}
                        onSelect={() => handleExistingProductSelect(p.id.toString())}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            product.productId === p.id ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {p.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <Input
              value={product.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Product name"
            />
          )}
        </div>
        
        <div>
          <Label className="mb-1">Unit Price</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-neutral-800 sm:text-sm">$</span>
            </div>
            <Input
              type="number"
              step="0.01"
              min="0"
              className="pl-7"
              placeholder="0.00"
              value={product.unitPrice}
              onChange={(e) => onChange({ unitPrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
        
        <div>
          <Label className="mb-1">Quantity</Label>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={product.quantity}
            onChange={(e) => onChange({ quantity: parseInt(e.target.value) || 0 })}
          />
        </div>
        
        <div>
          <Label className="mb-1">Final Value</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-neutral-800 sm:text-sm">$</span>
            </div>
            <Input
              type="text"
              className="pl-7 bg-neutral-100"
              placeholder="0.00"
              value={product.finalValue.toFixed(2)}
              readOnly
            />
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={onRemove}
        className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-100 p-0 h-8"
      >
        <Trash className="h-4 w-4 mr-1" />
        <span className="text-sm">Remove</span>
      </Button>
    </div>
  );
};

export default ProductItem;
