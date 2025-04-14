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
  id: string | number; // Support both string and number IDs
  name: string;
  unitPrice: number;
}

interface ProductItemData {
  id: string;
  productId: string | number; // Support both string and number IDs
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

const ProductItem: React.FC<ProductItemProps> = ({
  product,
  products,
  onRemove,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Calculate final value whenever unit price or quantity changes
    const finalValue = product.unitPrice * product.quantity;
    if (finalValue !== product.finalValue) {
      onChange({ finalValue });
    }
  }, [product.unitPrice, product.quantity]);

  const handleExistingProductSelect = (productId: string) => {
    console.log("Selected product ID:", productId);
    console.log("Products available:", products);

    // Handle when product ID is a string or number
    const selectedProduct = products.find((p) => {
      console.log("Comparing product:", p);
      console.log("Product ID type:", typeof p.id, "Value:", p.id);
      console.log("Selected ID type:", typeof productId, "Value:", productId);

      if (typeof p.id === "string") {
        return p.id === productId;
      } else if (typeof p.id === "number") {
        return p.id === parseInt(productId);
      } else {
        // Handle as string as fallback
        return String(p.id) === productId;
      }
    });

    console.log("Selected product:", selectedProduct);

    if (selectedProduct) {
      const updatedData = {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        unitPrice: selectedProduct.unitPrice,
      };
      console.log("Updating product with:", updatedData);
      onChange(updatedData);
      setOpen(false);
    } else {
      console.error("Product not found in product list");
    }
  };

  return (
    <div className="bg-neutral-100 p-4 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label className="mb-1">Nome do Produto</Label>
          {products.length > 0 ? (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {product.productId
                    ? products.find((p) => {
                        // Handle either string or number IDs
                        if (typeof product.productId === "string") {
                          return p.id === product.productId;
                        } else if (
                          typeof product.productId === "number" &&
                          product.productId > 0
                        ) {
                          return typeof p.id === "number"
                            ? p.id === product.productId
                            : p.id === product.productId.toString();
                        }
                        return false;
                      })?.name || product.name
                    : "Search products..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search products..." />
                  <CommandEmpty>Produto não encontrado</CommandEmpty>
                  <CommandGroup>
                    {products.map((p) => (
                      <CommandItem
                        key={p.id}
                        value={p.id.toString()}
                        onSelect={() =>
                          handleExistingProductSelect(p.id.toString())
                        }
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            (typeof p.id === "string" &&
                              p.id === product.productId.toString()) ||
                            (typeof p.id === "number" &&
                              p.id === product.productId)
                              ? "opacity-100"
                              : "opacity-0"
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
          <Label className="mb-1">Preço unitario</Label>
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
              onChange={(e) =>
                onChange({ unitPrice: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        </div>

        <div>
          <Label className="mb-1">quantidade</Label>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={product.quantity}
            onChange={(e) =>
              onChange({ quantity: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div>
          <Label className="mb-1">Valor final</Label>
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
        <span className="text-sm">Remover</span>
      </Button>
    </div>
  );
};

export default ProductItem;
