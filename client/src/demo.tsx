import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock data for suppliers
const suppliers = [
  { id: "1", name: "Fornecedor 1" },
  { id: "2", name: "Fornecedor 2" },
  { id: "3", name: "Fornecedor 3" },
];

// Mock data for products
const products = [
  { id: 1, name: "Rosas", unitPrice: 5.00 },
  { id: 2, name: "Tulipas", unitPrice: 3.50 },
  { id: 3, name: "Girassóis", unitPrice: 4.25 },
];

function Demo() {
  const [open, setOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [supplierPrice, setSupplierPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [suppliersList, setSuppliersList] = useState<Array<{ id?: string; name: string; price: number }>>([]);

  // Adicionar fornecedor do dropdown
  const addSelectedSupplier = () => {
    if (selectedSupplierId && parseFloat(supplierPrice) > 0) {
      const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
      if (selectedSupplier) {
        setSuppliersList([
          ...suppliersList,
          { 
            id: selectedSupplier.id, 
            name: selectedSupplier.name, 
            price: parseFloat(supplierPrice) 
          },
        ]);
        setSelectedSupplierId("");
        setSupplierPrice("");
        setOpen(false);
      }
    }
  };

  // Remover fornecedor da lista
  const removeSupplier = (index: number) => {
    setSuppliersList(suppliersList.filter((_, i) => i !== index));
  };

  // Selecionar produto
  const handleProductSelect = (productId: string) => {
    const id = parseInt(productId);
    setSelectedProductId(id);
    setProductOpen(false);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Demonstração de Dropdowns Pesquisáveis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Suppliers Section */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar produto com fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Nome do produto</Label>
                <Input placeholder="Digite o nome do produto" />
              </div>
              
              <div>
                <Label className="mb-2 block">Fornecedores (Opcional)</Label>
                <div className="mt-2 space-y-4">
                  {suppliersList.map((supplier, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <span className="font-medium">{supplier.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          R${supplier.price.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSupplier(index)}
                      >
                        <span className="text-sm">Remover</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label>Selecionar fornecedor existente</Label>
                  <div className="flex gap-2">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="flex-1 justify-between"
                        >
                          {selectedSupplierId
                            ? suppliers.find((supplier) => supplier.id === selectedSupplierId)?.name
                            : "Buscar fornecedores..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar fornecedores..." />
                          <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                          <CommandGroup>
                            {suppliers.map((supplier) => (
                              <CommandItem
                                key={supplier.id}
                                value={supplier.id}
                                onSelect={() => {
                                  setSelectedSupplierId(supplier.id === selectedSupplierId ? "" : supplier.id);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedSupplierId === supplier.id ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                {supplier.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="w-24">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Preço"
                        value={supplierPrice}
                        onChange={(e) => setSupplierPrice(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSelectedSupplier}
                      disabled={!selectedSupplierId || !supplierPrice}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4">Criar produto</Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Section */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar item à compra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Produto</Label>
                <Popover open={productOpen} onOpenChange={setProductOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={productOpen}
                      className="w-full justify-between"
                    >
                      {selectedProductId > 0
                        ? products.find((p) => p.id === selectedProductId)?.name
                        : "Buscar produtos..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar produtos..." />
                      <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                      <CommandGroup>
                        {products.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.id.toString()}
                            onSelect={() => handleProductSelect(p.id.toString())}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedProductId === p.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {p.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Preço unitário</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">R$</span>
                    </div>
                    <Input 
                      type="text" 
                      className="pl-8" 
                      value={selectedProductId ? products.find(p => p.id === selectedProductId)?.unitPrice.toFixed(2) || "" : ""} 
                      readOnly 
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Quantidade</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Valor final</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">R$</span>
                  </div>
                  <Input 
                    type="text" 
                    className="pl-8 bg-gray-100" 
                    value={selectedProductId && quantity ? 
                      (products.find(p => p.id === selectedProductId)?.unitPrice || 0 * parseInt(quantity)).toFixed(2) 
                      : "0.00"
                    } 
                    readOnly 
                  />
                </div>
              </div>
              
              <Button className="w-full mt-4">Adicionar ao pedido</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Render demo
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<Demo />);
}