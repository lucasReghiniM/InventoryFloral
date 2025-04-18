import {
  type Product as ProductType,
  type InsertProduct as InsertProductType,
  type Supplier,
  type InsertSupplier,
  type Purchase as PurchaseType,
  type InsertPurchase as InsertPurchaseType,
  type PurchaseItem as PurchaseItemType,
  type InsertPurchaseItem as InsertPurchaseItemType,
  type Sale as SaleType,
  type InsertSale as InsertSaleType,
  type SaleItem as SaleItemType,
  type InsertSaleItem as InsertSaleItemType,
  type InventoryAdjustment as InventoryAdjustmentType,
  type InsertInventoryAdjustment as InsertInventoryAdjustmentType
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

// Export types for use in firebaseStorage
export type Product = ProductType;
export type InsertProduct = InsertProductType;
// Export Supplier types directly
export { Supplier, InsertSupplier };
export type Purchase = PurchaseType;
export type InsertPurchase = InsertPurchaseType;
export type PurchaseItem = PurchaseItemType;
export type InsertPurchaseItem = InsertPurchaseItemType;
export type Sale = SaleType;
export type InsertSale = InsertSaleType;
export type SaleItem = SaleItemType;
export type InsertSaleItem = InsertSaleItemType;
export type InventoryAdjustment = InventoryAdjustmentType;
export type InsertInventoryAdjustment = InsertInventoryAdjustmentType;

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: string | number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string | number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  updateProductStock(id: string | number, quantity: number): Promise<Product | undefined>;
  deleteProduct(id: string | number): Promise<boolean>;
  
  // Supplier methods
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  deleteSupplier(id: string): Promise<boolean>;
  
  // Purchase methods
  getPurchases(): Promise<Purchase[]>;
  getPurchase(id: string): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  deletePurchase(id: string): Promise<boolean>;
  
  // Purchase items methods
  getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]>;
  createPurchaseItem(purchaseItem: InsertPurchaseItem): Promise<PurchaseItem>;
  
  // Sales methods
  getSales(): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  deleteSale(id: number): Promise<boolean>;
  
  // Sale items methods
  getSaleItems(saleId: number): Promise<SaleItem[]>;
  createSaleItem(saleItem: InsertSaleItem): Promise<SaleItem>;
  
  // Inventory adjustment methods
  getInventoryAdjustments(): Promise<InventoryAdjustment[]>;
  getInventoryAdjustmentsForProduct(productId: string | number): Promise<InventoryAdjustment[]>;
  createInventoryAdjustment(adjustment: InsertInventoryAdjustment): Promise<InventoryAdjustment>;
}

export class MemStorage implements IStorage {
  private productsMap: Map<string, Product>;
  private suppliersMap: Map<string, Supplier>;
  private purchasesMap: Map<string, Purchase>; // Changed to string keys for UUIDs
  private purchaseItemsMap: Map<string, PurchaseItem>; // Changed to string keys for UUIDs
  private salesMap: Map<number, Sale>;
  private saleItemsMap: Map<number, SaleItem>;
  private inventoryAdjustmentsMap: Map<number, InventoryAdjustment>;
  private currentSaleId: number;
  private currentSaleItemId: number;
  private currentInventoryAdjustmentId: number;
  
  // Firebase integration could be added here in the future

  constructor() {
    this.productsMap = new Map();
    this.suppliersMap = new Map();
    this.purchasesMap = new Map();
    this.purchaseItemsMap = new Map();
    this.salesMap = new Map();
    this.saleItemsMap = new Map();
    this.inventoryAdjustmentsMap = new Map();
    this.currentSaleId = 1;
    this.currentSaleItemId = 1;
    this.currentInventoryAdjustmentId = 1;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values());
  }

  async getProduct(id: string | number): Promise<Product | undefined> {
    // Convert id to string if it's a number
    const stringId = id.toString();
    return this.productsMap.get(stringId);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Make sure product has an ID and suppliers array
    if (!product.id) {
      throw new Error("Product must have an ID");
    }
    
    const newProduct: Product = {
      id: product.id,
      name: product.name,
      currentStock: product.currentStock,
      suppliers: product.suppliers ?? [] // Use nullish coalescing to ensure empty array if undefined
    };
    this.productsMap.set(newProduct.id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string | number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    // Convert id to string if it's a number
    const stringId = id.toString();
    const existingProduct = this.productsMap.get(stringId);
    if (!existingProduct) return undefined;

    const updatedProduct: Product = { ...existingProduct, ...product };
    this.productsMap.set(stringId, updatedProduct);
    return updatedProduct;
  }

  async updateProductStock(id: string | number, quantity: number): Promise<Product | undefined> {
    // Convert id to string if it's a number
    const stringId = id.toString();
    const product = this.productsMap.get(stringId);
    if (!product) return undefined;

    const updatedProduct: Product = { 
      ...product, 
      currentStock: product.currentStock + quantity 
    };
    this.productsMap.set(stringId, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string | number): Promise<boolean> {
    // Convert id to string if it's a number
    const stringId = id.toString();
    return this.productsMap.delete(stringId);
  }

  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliersMap.values());
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliersMap.get(id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const newSupplier: Supplier = {
      id: supplier.id,
      name: supplier.name
    };
    this.suppliersMap.set(newSupplier.id, newSupplier);
    return newSupplier;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    return this.suppliersMap.delete(id);
  }

  // Purchase methods
  async getPurchases(): Promise<Purchase[]> {
    return Array.from(this.purchasesMap.values());
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    return this.purchasesMap.get(id);
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    // Generate a UUID for the purchase
    const id = uuidv4();
    const newPurchase: Purchase = { id, ...purchase };
    this.purchasesMap.set(id, newPurchase);
    return newPurchase;
  }

  async deletePurchase(id: string): Promise<boolean> {
    // Also delete associated purchase items
    const purchaseItems = await this.getPurchaseItems(id);
    for (const item of purchaseItems) {
      this.purchaseItemsMap.delete(item.id);
    }
    return this.purchasesMap.delete(id);
  }

  // Purchase items methods
  async getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]> {
    return Array.from(this.purchaseItemsMap.values()).filter(
      item => item.purchaseId === purchaseId
    );
  }

  async createPurchaseItem(purchaseItem: InsertPurchaseItem): Promise<PurchaseItem> {
    // Generate a UUID for the purchase item
    const id = uuidv4();
    const newPurchaseItem: PurchaseItem = { id, ...purchaseItem };
    this.purchaseItemsMap.set(id, newPurchaseItem);
    return newPurchaseItem;
  }

  // Sales methods
  async getSales(): Promise<Sale[]> {
    return Array.from(this.salesMap.values());
  }

  async getSale(id: number): Promise<Sale | undefined> {
    return this.salesMap.get(id);
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const id = this.currentSaleId++;
    const newSale: Sale = { id, ...sale };
    this.salesMap.set(id, newSale);
    return newSale;
  }

  async deleteSale(id: number): Promise<boolean> {
    return this.salesMap.delete(id);
  }

  // Sale items methods
  async getSaleItems(saleId: number): Promise<SaleItem[]> {
    return Array.from(this.saleItemsMap.values()).filter(
      item => item.saleId === saleId
    );
  }

  async createSaleItem(saleItem: InsertSaleItem): Promise<SaleItem> {
    const id = this.currentSaleItemId++;
    const newSaleItem: SaleItem = { id, ...saleItem };
    this.saleItemsMap.set(id, newSaleItem);
    return newSaleItem;
  }

  // Inventory adjustment methods
  async getInventoryAdjustments(): Promise<InventoryAdjustment[]> {
    return Array.from(this.inventoryAdjustmentsMap.values());
  }

  async getInventoryAdjustmentsForProduct(productId: string | number): Promise<InventoryAdjustment[]> {
    const productIdStr = productId.toString();
    return Array.from(this.inventoryAdjustmentsMap.values()).filter(
      adjustment => adjustment.productId.toString() === productIdStr
    );
  }

  async createInventoryAdjustment(adjustment: InsertInventoryAdjustment): Promise<InventoryAdjustment> {
    const id = this.currentInventoryAdjustmentId++;
    // Handle potential undefined notes field by setting to null
    const newAdjustment: InventoryAdjustment = { 
      id, 
      ...adjustment,
      notes: adjustment.notes || null, // Ensure notes is never undefined
    };
    this.inventoryAdjustmentsMap.set(id, newAdjustment);
    return newAdjustment;
  }
}

export const storage = new MemStorage();
