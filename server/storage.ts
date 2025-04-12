import { 
  products, 
  purchases, 
  purchaseItems, 
  sales, 
  saleItems, 
  inventoryAdjustments,
  type Product,
  type InsertProduct,
  type Purchase,
  type InsertPurchase,
  type PurchaseItem,
  type InsertPurchaseItem,
  type Sale,
  type InsertSale,
  type SaleItem,
  type InsertSaleItem,
  type InventoryAdjustment,
  type InsertInventoryAdjustment
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  updateProductStock(id: number, quantity: number): Promise<Product | undefined>;
  
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
  getInventoryAdjustmentsForProduct(productId: number): Promise<InventoryAdjustment[]>;
  createInventoryAdjustment(adjustment: InsertInventoryAdjustment): Promise<InventoryAdjustment>;
}

export class MemStorage implements IStorage {
  private productsMap: Map<number, Product>;
  private purchasesMap: Map<number, Purchase>;
  private purchaseItemsMap: Map<number, PurchaseItem>;
  private salesMap: Map<number, Sale>;
  private saleItemsMap: Map<number, SaleItem>;
  private inventoryAdjustmentsMap: Map<number, InventoryAdjustment>;
  private currentProductId: number;
  private currentPurchaseId: number;
  private currentPurchaseItemId: number;
  private currentSaleId: number;
  private currentSaleItemId: number;
  private currentInventoryAdjustmentId: number;

  constructor() {
    this.productsMap = new Map();
    this.purchasesMap = new Map();
    this.purchaseItemsMap = new Map();
    this.salesMap = new Map();
    this.saleItemsMap = new Map();
    this.inventoryAdjustmentsMap = new Map();
    this.currentProductId = 1;
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

  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsMap.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { id, ...product };
    this.productsMap.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.productsMap.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct: Product = { ...existingProduct, ...product };
    this.productsMap.set(id, updatedProduct);
    return updatedProduct;
  }

  async updateProductStock(id: number, quantity: number): Promise<Product | undefined> {
    const product = this.productsMap.get(id);
    if (!product) return undefined;

    const updatedProduct: Product = { 
      ...product, 
      currentStock: product.currentStock + quantity 
    };
    this.productsMap.set(id, updatedProduct);
    return updatedProduct;
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
    const newAdjustment: InventoryAdjustment = { id, ...adjustment };
    this.inventoryAdjustmentsMap.set(id, newAdjustment);
    return newAdjustment;
  }
}

export const storage = new MemStorage();
