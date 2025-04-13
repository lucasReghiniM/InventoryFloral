import {
  type Product as ProductType,
  type InsertProduct as InsertProductType,
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

// Export types for use in firebaseStorage
export type Product = ProductType;
export type InsertProduct = InsertProductType;
export type Supplier = SupplierType;
export type InsertSupplier = InsertSupplierType;
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
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  updateProductStock(id: string, quantity: number): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Supplier methods
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  deleteSupplier(id: string): Promise<boolean>;
  
  // Purchase methods
  getPurchases(): Promise<Purchase[]>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  deletePurchase(id: number): Promise<boolean>;
  
  // Purchase items methods
  getPurchaseItems(purchaseId: number): Promise<PurchaseItem[]>;
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
  getInventoryAdjustmentsForProduct(productId: string): Promise<InventoryAdjustment[]>;
  createInventoryAdjustment(adjustment: InsertInventoryAdjustment): Promise<InventoryAdjustment>;
}

export class MemStorage implements IStorage {
  private productsMap: Map<string, Product>;
  private suppliersMap: Map<string, Supplier>;
  private purchasesMap: Map<number, Purchase>;
  private purchaseItemsMap: Map<number, PurchaseItem>;
  private salesMap: Map<number, Sale>;
  private saleItemsMap: Map<number, SaleItem>;
  private inventoryAdjustmentsMap: Map<number, InventoryAdjustment>;
  private currentPurchaseId: number;
  private currentPurchaseItemId: number;
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
    this.currentPurchaseId = 1;
    this.currentPurchaseItemId = 1;
    this.currentSaleId = 1;
    this.currentSaleItemId = 1;
    this.currentInventoryAdjustmentId = 1;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.productsMap.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: product.id,
      name: product.name,
      currentStock: product.currentStock,
      suppliers: product.suppliers || []
    };
    this.productsMap.set(newProduct.id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.productsMap.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct: Product = { ...existingProduct, ...product };
    this.productsMap.set(id, updatedProduct);
    return updatedProduct;
  }

  async updateProductStock(id: string, quantity: number): Promise<Product | undefined> {
    const product = this.productsMap.get(id);
    if (!product) return undefined;

    const updatedProduct: Product = { 
      ...product, 
      currentStock: product.currentStock + quantity 
    };
    this.productsMap.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.productsMap.delete(id);
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

  async getPurchase(id: number): Promise<Purchase | undefined> {
    return this.purchasesMap.get(id);
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const id = this.currentPurchaseId++;
    const newPurchase: Purchase = { id, ...purchase };
    this.purchasesMap.set(id, newPurchase);
    return newPurchase;
  }

  async deletePurchase(id: number): Promise<boolean> {
    return this.purchasesMap.delete(id);
  }

  // Purchase items methods
  async getPurchaseItems(purchaseId: number): Promise<PurchaseItem[]> {
    return Array.from(this.purchaseItemsMap.values()).filter(
      item => item.purchaseId === purchaseId
    );
  }

  async createPurchaseItem(purchaseItem: InsertPurchaseItem): Promise<PurchaseItem> {
    const id = this.currentPurchaseItemId++;
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

  async getInventoryAdjustmentsForProduct(productId: number): Promise<InventoryAdjustment[]> {
    return Array.from(this.inventoryAdjustmentsMap.values()).filter(
      adjustment => adjustment.productId === productId
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
