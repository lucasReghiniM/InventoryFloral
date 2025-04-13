import { db } from "./firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  Timestamp,
  setDoc
} from "firebase/firestore";
import type { 
  IStorage, 
  Product, 
  InsertProduct, 
  Purchase, 
  InsertPurchase,
  PurchaseItem, 
  InsertPurchaseItem,
  Sale, 
  InsertSale,
  SaleItem, 
  InsertSaleItem,
  InventoryAdjustment,
  InsertInventoryAdjustment,
  Supplier,
  InsertSupplier
} from "./storage";

// Convert Firestore timestamp to string
const convertTimestampToString = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return new Date(timestamp).toISOString();
};

export class FirebaseStorage implements IStorage {
  // Product methods
  async getProducts(): Promise<Product[]> {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() as Omit<Product, 'id'> }));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const productRef = doc(db, "products", id.toString());
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) return undefined;
    return { id, ...productSnap.data() as Omit<Product, 'id'> };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Get next ID
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    const nextId = snapshot.docs.length > 0 
      ? Math.max(...snapshot.docs.map(doc => Number(doc.id))) + 1 
      : 1;
    
    const newProduct = {
      ...product,
      currentStock: product.currentStock || 0
    };

    // Use document with ID as string
    await addDoc(collection(db, "products"), {
      ...newProduct,
      id: nextId
    });
    
    return { id: nextId, ...newProduct };
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const productRef = doc(db, "products", id.toString());
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) return undefined;
    
    const existingProduct = { id, ...productSnap.data() as Omit<Product, 'id'> };
    const updatedProduct = { ...existingProduct, ...product };
    
    await updateDoc(productRef, product);
    
    return updatedProduct;
  }

  async updateProductStock(id: number, quantity: number): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const currentStock = product.currentStock || 0;
    const newStock = currentStock + quantity;
    
    return this.updateProduct(id, { currentStock: newStock });
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      // Convert id to number for Firestore
      const numId = parseInt(id);
      if (isNaN(numId)) {
        return false;
      }

      const productRef = doc(db, "products", numId.toString());
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        return false;
      }
      
      await deleteDoc(productRef);
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  }
  
  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const suppliersRef = collection(db, "suppliers");
      const snapshot = await getDocs(suppliersRef);
      
      // For suppliers, use the string ID directly from Firestore
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
    } catch (error) {
      console.error("Error getting suppliers:", error);
      return [];
    }
  }
  
  async getSupplier(id: string): Promise<Supplier | undefined> {
    try {
      const supplierRef = doc(db, "suppliers", id);
      const supplierSnap = await getDoc(supplierRef);
      
      if (!supplierSnap.exists()) {
        return undefined;
      }
      
      return {
        id,
        name: supplierSnap.data().name
      };
    } catch (error) {
      console.error("Error getting supplier:", error);
      return undefined;
    }
  }
  
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    try {
      // For suppliers, we're using the UUID directly as the document ID
      if (!supplier.id) {
        console.error("Supplier ID is missing in createSupplier");
        throw new Error("Supplier ID is required");
      }
      
      console.log("Creating supplier with ID:", supplier.id, "and name:", supplier.name);
      
      // Create document with the supplier's UUID as the ID
      await setDoc(doc(db, "suppliers", supplier.id), {
        name: supplier.name
      });
      
      console.log("Supplier created successfully!");
      
      return {
        id: supplier.id,
        name: supplier.name
      };
    } catch (error) {
      console.error("Detailed error creating supplier:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      throw error;
    }
  }
  
  async deleteSupplier(id: string): Promise<boolean> {
    try {
      const supplierRef = doc(db, "suppliers", id);
      const supplierSnap = await getDoc(supplierRef);
      
      if (!supplierSnap.exists()) {
        return false;
      }
      
      await deleteDoc(supplierRef);
      return true;
    } catch (error) {
      console.error("Error deleting supplier:", error);
      return false;
    }
  }

  // Purchase methods
  async getPurchases(): Promise<Purchase[]> {
    const purchasesRef = collection(db, "purchases");
    const snapshot = await getDocs(purchasesRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: Number(doc.id),
        invoiceNumber: data.invoiceNumber,
        orderDate: convertTimestampToString(data.orderDate),
        supplier: data.supplier,
        deliveryCost: data.deliveryCost,
        totalAmount: data.totalAmount
      };
    });
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const purchaseRef = doc(db, "purchases", id.toString());
    const purchaseSnap = await getDoc(purchaseRef);
    
    if (!purchaseSnap.exists()) return undefined;
    
    const data = purchaseSnap.data();
    return {
      id,
      invoiceNumber: data.invoiceNumber,
      orderDate: convertTimestampToString(data.orderDate),
      supplier: data.supplier,
      deliveryCost: data.deliveryCost,
      totalAmount: data.totalAmount
    };
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    // Get next ID
    const purchasesRef = collection(db, "purchases");
    const snapshot = await getDocs(purchasesRef);
    const nextId = snapshot.docs.length > 0 
      ? Math.max(...snapshot.docs.map(doc => Number(doc.id))) + 1 
      : 1;
    
    // Convert date string to Firestore timestamp
    const purchaseData = {
      ...purchase,
      orderDate: new Date(purchase.orderDate)
    };
    
    // Use document with ID as string
    await addDoc(collection(db, "purchases"), {
      ...purchaseData,
      id: nextId
    });
    
    return { 
      id: nextId, 
      ...purchase,
      orderDate: new Date(purchase.orderDate).toISOString()
    };
  }

  async deletePurchase(id: number): Promise<boolean> {
    try {
      // Delete purchase items first
      const purchaseItemsRef = collection(db, "purchaseItems");
      const q = query(purchaseItemsRef, where("purchaseId", "==", id));
      const snapshot = await getDocs(q);
      
      // Delete each item
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Then delete the purchase
      await deleteDoc(doc(db, "purchases", id.toString()));
      return true;
    } catch (error) {
      console.error("Error deleting purchase:", error);
      return false;
    }
  }

  // Purchase items methods
  async getPurchaseItems(purchaseId: number): Promise<PurchaseItem[]> {
    const purchaseItemsRef = collection(db, "purchaseItems");
    const q = query(purchaseItemsRef, where("purchaseId", "==", purchaseId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: Number(doc.id),
      ...doc.data() as Omit<PurchaseItem, 'id'>
    }));
  }

  async createPurchaseItem(purchaseItem: InsertPurchaseItem): Promise<PurchaseItem> {
    // Get next ID
    const purchaseItemsRef = collection(db, "purchaseItems");
    const snapshot = await getDocs(purchaseItemsRef);
    const nextId = snapshot.docs.length > 0 
      ? Math.max(...snapshot.docs.map(doc => Number(doc.id))) + 1 
      : 1;
    
    // Use document with ID as string
    await addDoc(collection(db, "purchaseItems"), {
      ...purchaseItem,
      id: nextId
    });
    
    return { id: nextId, ...purchaseItem };
  }

  // Sales methods
  async getSales(): Promise<Sale[]> {
    const salesRef = collection(db, "sales");
    const snapshot = await getDocs(salesRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: Number(doc.id),
        customerName: data.customerName,
        customerContact: data.customerContact,
        saleDate: convertTimestampToString(data.saleDate),
        saleAmount: data.saleAmount
      };
    });
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const saleRef = doc(db, "sales", id.toString());
    const saleSnap = await getDoc(saleRef);
    
    if (!saleSnap.exists()) return undefined;
    
    const data = saleSnap.data();
    return {
      id,
      customerName: data.customerName,
      customerContact: data.customerContact,
      saleDate: convertTimestampToString(data.saleDate),
      saleAmount: data.saleAmount
    };
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    // Get next ID
    const salesRef = collection(db, "sales");
    const snapshot = await getDocs(salesRef);
    const nextId = snapshot.docs.length > 0 
      ? Math.max(...snapshot.docs.map(doc => Number(doc.id))) + 1 
      : 1;
    
    // Convert date string to Firestore timestamp
    const saleData = {
      ...sale,
      saleDate: new Date(sale.saleDate)
    };
    
    // Use document with ID as string
    await addDoc(collection(db, "sales"), {
      ...saleData,
      id: nextId
    });
    
    return { 
      id: nextId, 
      ...sale,
      saleDate: new Date(sale.saleDate).toISOString()
    };
  }

  async deleteSale(id: number): Promise<boolean> {
    try {
      // Delete sale items first
      const saleItemsRef = collection(db, "saleItems");
      const q = query(saleItemsRef, where("saleId", "==", id));
      const snapshot = await getDocs(q);
      
      // Delete each item
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Then delete the sale
      await deleteDoc(doc(db, "sales", id.toString()));
      return true;
    } catch (error) {
      console.error("Error deleting sale:", error);
      return false;
    }
  }

  // Sale items methods
  async getSaleItems(saleId: number): Promise<SaleItem[]> {
    const saleItemsRef = collection(db, "saleItems");
    const q = query(saleItemsRef, where("saleId", "==", saleId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: Number(doc.id),
      ...doc.data() as Omit<SaleItem, 'id'>
    }));
  }

  async createSaleItem(saleItem: InsertSaleItem): Promise<SaleItem> {
    // Get next ID
    const saleItemsRef = collection(db, "saleItems");
    const snapshot = await getDocs(saleItemsRef);
    const nextId = snapshot.docs.length > 0 
      ? Math.max(...snapshot.docs.map(doc => Number(doc.id))) + 1 
      : 1;
    
    // Use document with ID as string
    await addDoc(collection(db, "saleItems"), {
      ...saleItem,
      id: nextId
    });
    
    return { id: nextId, ...saleItem };
  }

  // Inventory adjustment methods
  async getInventoryAdjustments(): Promise<InventoryAdjustment[]> {
    const adjustmentsRef = collection(db, "inventoryAdjustments");
    const snapshot = await getDocs(adjustmentsRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: Number(doc.id),
        productId: data.productId,
        quantity: data.quantity,
        reason: data.reason,
        notes: data.notes || null,
        adjustmentDate: convertTimestampToString(data.adjustmentDate),
        adjustmentType: data.adjustmentType
      };
    });
  }

  async getInventoryAdjustmentsForProduct(productId: number): Promise<InventoryAdjustment[]> {
    const adjustmentsRef = collection(db, "inventoryAdjustments");
    const q = query(adjustmentsRef, where("productId", "==", productId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: Number(doc.id),
        productId: data.productId,
        quantity: data.quantity,
        reason: data.reason,
        notes: data.notes || null,
        adjustmentDate: convertTimestampToString(data.adjustmentDate),
        adjustmentType: data.adjustmentType
      };
    });
  }

  async createInventoryAdjustment(adjustment: InsertInventoryAdjustment): Promise<InventoryAdjustment> {
    // Get next ID
    const adjustmentsRef = collection(db, "inventoryAdjustments");
    const snapshot = await getDocs(adjustmentsRef);
    const nextId = snapshot.docs.length > 0 
      ? Math.max(...snapshot.docs.map(doc => Number(doc.id))) + 1 
      : 1;
    
    // Convert date string to Firestore timestamp
    const adjustmentData = {
      ...adjustment,
      adjustmentDate: new Date(adjustment.adjustmentDate),
      notes: adjustment.notes || null
    };
    
    // Use document with ID as string
    await addDoc(collection(db, "inventoryAdjustments"), {
      ...adjustmentData,
      id: nextId
    });
    
    return { 
      id: nextId, 
      ...adjustment,
      notes: adjustment.notes || null,
      adjustmentDate: new Date(adjustment.adjustmentDate).toISOString()
    };
  }
}

export const storage = new FirebaseStorage();