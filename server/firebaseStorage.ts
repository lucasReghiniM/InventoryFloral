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
  setDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
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
  InsertSupplier,
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
    try {
      const productsRef = collection(db, "products");
      const snapshot = await getDocs(productsRef);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        // Use the document ID as the product ID
        return {
          id: doc.id,
          name: data.name,
          currentStock: data.currentStock || 0,
          suppliers: data.suppliers || [],
        };
      });
    } catch (error) {
      console.error("Error getting products:", error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    // Log the received ID for debugging
    console.log(
      "Firebase Storage - getProduct called with ID:",
      id,
      "Type:",
      typeof id,
    );

    try {
      const idToUse = id.toString();
      console.log("Using ID for Firebase query:", idToUse);

      // First try direct lookup, assuming 'id' might be a document ID in Firestore
      const productRef = doc(db, "products", idToUse);
      const productSnap = await getDoc(productRef);

      // If direct lookup succeeds, return the data
      if (productSnap.exists()) {
        console.log("Product found by direct ID lookup");
        return {
          id: idToUse,
          ...(productSnap.data() as Omit<Product, "id">),
        };
      }

      // If direct lookup fails, try to find by the 'id' field inside the documents
      console.log("Direct lookup failed, attempting to find by id field");
      const productsRef = collection(db, "products");
      const q = query(productsRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      // Check if any matching document was found
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data() as Omit<Product, "id">;
        console.log("Product found by id field query:", docData);
        return {
          id: id,
          ...docData,
        };
      }

      console.log("Product not found by any method");
      return undefined;
    } catch (error) {
      console.error("Error in getProduct:", error);
      return undefined;
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    console.log("Creating product with data:", product);

    // Use the provided ID or generate a new UUID if for some reason it's missing
    const productId = product.id || uuidv4();
    console.log("Using product ID:", productId);

    const newProduct = {
      ...product,
      id: productId,
      currentStock: product.currentStock || 0,
      suppliers: product.suppliers ?? [], // Use nullish coalescing to ensure empty array if undefined
    };

    console.log("Prepared product data:", newProduct);

    try {
      // Create document with provided ID
      const docRef = doc(db, "products", productId);
      await setDoc(docRef, newProduct);

      console.log("Product created successfully!");
      return newProduct as Product;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async updateProduct(
    id: string,
    product: Partial<InsertProduct>,
  ): Promise<Product | undefined> {
    console.log("updateProduct called with ID:", id, "Type:", typeof id);
    console.log("Update data:", product);

    try {
      // Try to find the product by internal ID field first
      const idToUse = id.toString();
      const productsRef = collection(db, "products");
      const q = query(productsRef, where("id", "==", idToUse));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Found by internal ID field
        const docRef = querySnapshot.docs[0].ref;
        const docData = querySnapshot.docs[0].data() as Omit<Product, "id">;

        console.log("Found product by id field query:", docData);

        // Update the document
        await updateDoc(docRef, product);

        // Return updated product
        return {
          id: idToUse,
          ...docData,
          ...product,
        };
      }

      // If not found by internal ID, try direct document ID lookup
      const productRef = doc(db, "products", idToUse);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const docData = productSnap.data() as Omit<Product, "id">;
        console.log("Found product by direct lookup:", docData);

        // Update the document
        await updateDoc(productRef, product);

        // Return updated product
        return {
          id: idToUse,
          ...docData,
          ...product,
        };
      }

      console.log("Product not found for update by any method");
      return undefined;
    } catch (error) {
      console.error("Error in updateProduct:", error);
      return undefined;
    }
  }

  async updateProductStock(
    id: string,
    quantity: number,
  ): Promise<Product | undefined> {
    console.log("updateProductStock called with ID:", id, "Type:", typeof id);
    console.log("Quantity:", quantity);

    try {
      const product = await this.getProduct(id);
      if (!product) {
        console.log("Product not found for stock update");
        return undefined;
      }

      const currentStock = product.currentStock || 0;
      const newStock = currentStock + quantity;
      console.log("Updating stock from", currentStock, "to", newStock);

      return this.updateProduct(id, { currentStock: newStock });
    } catch (error) {
      console.error("Error in updateProductStock:", error);
      return undefined;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      console.log("Deleting product with ID:", id);

      // First try to look up by document ID directly
      const productRef = doc(db, "products", id);
      let productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        console.log("Found product by document ID, deleting");
        await deleteDoc(productRef);
        return true;
      }

      // If not found directly, try querying by internal ID field
      console.log(
        "Product not found by document ID, trying by internal id field",
      );
      const productsRef = collection(db, "products");
      const q = query(productsRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("Found product by internal id field query, deleting");
        await deleteDoc(querySnapshot.docs[0].ref);
        return true;
      }

      console.log("Product not found for deletion");
      return false;
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
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
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
        name: supplierSnap.data().name,
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

      console.log(
        "Creating supplier with ID:",
        supplier.id,
        "and name:",
        supplier.name,
      );

      // Create document with the supplier's UUID as the ID
      await setDoc(doc(db, "suppliers", supplier.id), {
        name: supplier.name,
      });

      console.log("Supplier created successfully!");

      return {
        id: supplier.id,
        name: supplier.name,
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
    console.log("Getting all purchases from Firebase");
    const purchasesRef = collection(db, "purchases");
    const snapshot = await getDocs(purchasesRef);

    console.log(`Found ${snapshot.docs.length} purchase documents`);

    const purchases = snapshot.docs.map((doc) => {
      console.log(`Processing purchase document with ID: ${doc.id}`);
      const data = doc.data();
      console.log(`Purchase data:`, data);

      // Always use document ID as the source of truth for the ID
      return {
        id: doc.id,
        invoiceNumber: data.invoiceNumber,
        orderDate: convertTimestampToString(data.orderDate),
        supplier: data.supplier,
        deliveryCost: data.deliveryCost || 0,
        totalAmount: data.totalAmount,
      };
    });

    console.log(`Returning ${purchases.length} purchases`);
    return purchases;
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    console.log(`Getting purchase with ID: ${id}`);
    const purchaseRef = doc(db, "purchases", id);
    const purchaseSnap = await getDoc(purchaseRef);

    if (!purchaseSnap.exists()) {
      console.log(`Purchase with ID ${id} not found`);
      return undefined;
    }

    const data = purchaseSnap.data();
    console.log(`Found purchase data:`, data);
    
    return {
      id,
      invoiceNumber: data.invoiceNumber,
      orderDate: convertTimestampToString(data.orderDate),
      supplier: data.supplier,
      deliveryCost: data.deliveryCost,
      totalAmount: data.totalAmount,
    };
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    console.log("Creating purchase with data:", purchase);

    // Generate UUID for purchase
    const purchaseId = uuidv4();
    console.log("Generated purchase ID (UUID):", purchaseId);

    // Convert date string to Firestore timestamp
    const purchaseData = {
      ...purchase,
      id: purchaseId, // Store the UUID as the ID field
      orderDate: new Date(purchase.orderDate),
    };

    try {
      // Create document with UUID as document ID
      const docRef = doc(db, "purchases", purchaseId);
      await setDoc(docRef, purchaseData);

      console.log("Purchase created successfully with ID:", purchaseId);

      // Return the created purchase with proper date format
      return {
        id: purchaseId,
        invoiceNumber: purchase.invoiceNumber,
        orderDate: new Date(purchase.orderDate).toISOString(),
        supplier: purchase.supplier,
        deliveryCost: purchase.deliveryCost,
        totalAmount: purchase.totalAmount,
      };
    } catch (error) {
      console.error("Error creating purchase:", error);
      throw error;
    }
  }

  async deletePurchase(id: string): Promise<boolean> {
    console.log(`Deleting purchase with ID: ${id}`);
    
    try {
      // Delete purchase items first
      const purchaseItemsRef = collection(db, "purchaseItems");
      const q = query(purchaseItemsRef, where("purchaseId", "==", id));
      const snapshot = await getDocs(q);
      
      console.log(`Found ${snapshot.docs.length} purchase items to delete`);

      // Delete each item
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Then delete the purchase
      console.log(`Deleting purchase document with ID: ${id}`);
      await deleteDoc(doc(db, "purchases", id));
      
      console.log(`Successfully deleted purchase with ID: ${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting purchase:", error);
      return false;
    }
  }

  // Purchase items methods
  async getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]> {
    console.log(`Getting purchase items for purchase ID: ${purchaseId}`);
    
    const purchaseItemsRef = collection(db, "purchaseItems");
    const q = query(purchaseItemsRef, where("purchaseId", "==", purchaseId));
    const snapshot = await getDocs(q);

    console.log(`Found ${snapshot.docs.length} purchase items`);
    
    // Create PurchaseItems with string IDs
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, // Use the document ID directly (string)
        purchaseId: data.purchaseId,
        productId: data.productId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        finalValue: data.finalValue
      };
    });
  }

  async createPurchaseItem(
    purchaseItem: InsertPurchaseItem,
  ): Promise<PurchaseItem> {
    console.log("Creating purchase item with data:", purchaseItem);
    
    // Generate UUID for purchase item
    const purchaseItemId = uuidv4();
    console.log("Generated purchase item ID (UUID):", purchaseItemId);
    
    try {
      // Create document with UUID as document ID
      const docRef = doc(db, "purchaseItems", purchaseItemId);
      await setDoc(docRef, {
        ...purchaseItem,
        id: purchaseItemId // Store the UUID as the ID field
      });
      
      console.log("Purchase item created successfully with ID:", purchaseItemId);
      
      return { 
        id: purchaseItemId, 
        purchaseId: purchaseItem.purchaseId,
        productId: purchaseItem.productId,
        quantity: purchaseItem.quantity,
        unitPrice: purchaseItem.unitPrice,
        finalValue: purchaseItem.finalValue
      };
    } catch (error) {
      console.error("Error creating purchase item:", error);
      throw error;
    }
  }

  // Sales methods
  async getSales(): Promise<Sale[]> {
    const salesRef = collection(db, "sales");
    const snapshot = await getDocs(salesRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: Number(doc.id),
        customerName: data.customerName,
        customerContact: data.customerContact,
        saleDate: convertTimestampToString(data.saleDate),
        saleAmount: data.saleAmount,
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
      saleAmount: data.saleAmount,
    };
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    // Get next ID
    const salesRef = collection(db, "sales");
    const snapshot = await getDocs(salesRef);
    const nextId =
      snapshot.docs.length > 0
        ? Math.max(...snapshot.docs.map((doc) => Number(doc.id))) + 1
        : 1;

    // Convert date string to Firestore timestamp
    const saleData = {
      ...sale,
      saleDate: new Date(sale.saleDate),
    };

    // Create document with the calculated ID (as string)
    const docRef = doc(db, "sales", nextId.toString());
    await setDoc(docRef, {
      ...saleData,
      id: nextId,
    });

    console.log("Sale created with ID:", nextId);

    return {
      id: nextId,
      ...sale,
      saleDate: new Date(sale.saleDate).toISOString(),
    };
  }

  async deleteSale(id: number): Promise<boolean> {
    try {
      // Delete sale items first
      const saleItemsRef = collection(db, "saleItems");
      const q = query(saleItemsRef, where("saleId", "==", id));
      const snapshot = await getDocs(q);

      // Delete each item
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
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

    return snapshot.docs.map((doc) => ({
      id: Number(doc.id),
      ...(doc.data() as Omit<SaleItem, "id">),
    }));
  }

  async createSaleItem(saleItem: InsertSaleItem): Promise<SaleItem> {
    // Get next ID
    const saleItemsRef = collection(db, "saleItems");
    const snapshot = await getDocs(saleItemsRef);
    const nextId =
      snapshot.docs.length > 0
        ? Math.max(...snapshot.docs.map((doc) => Number(doc.id))) + 1
        : 1;

    // Create document with the calculated ID (as string)
    const docRef = doc(db, "saleItems", nextId.toString());
    await setDoc(docRef, {
      ...saleItem,
      id: nextId,
    });

    console.log("Sale item created with ID:", nextId);

    return { id: nextId, ...saleItem };
  }

  // Inventory adjustment methods
  async getInventoryAdjustments(): Promise<InventoryAdjustment[]> {
    const adjustmentsRef = collection(db, "inventoryAdjustments");
    const snapshot = await getDocs(adjustmentsRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: Number(doc.id),
        productId: data.productId,
        quantity: data.quantity,
        reason: data.reason,
        notes: data.notes || null,
        adjustmentDate: convertTimestampToString(data.adjustmentDate),
        adjustmentType: data.adjustmentType,
      };
    });
  }

  async getInventoryAdjustmentsForProduct(
    productId: string,
  ): Promise<InventoryAdjustment[]> {
    console.log("Getting inventory adjustments for product ID:", productId);

    try {
      const adjustmentsRef = collection(db, "inventoryAdjustments");
      const q = query(adjustmentsRef, where("productId", "==", productId));
      const snapshot = await getDocs(q);

      const adjustments = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: Number(doc.id),
          productId: data.productId,
          quantity: data.quantity,
          reason: data.reason,
          notes: data.notes || null,
          adjustmentDate: convertTimestampToString(data.adjustmentDate),
          adjustmentType: data.adjustmentType,
        };
      });

      console.log(
        `Found ${adjustments.length} adjustments for product ${productId}`,
      );
      return adjustments;
    } catch (error) {
      console.error("Error getting inventory adjustments for product:", error);
      return [];
    }
  }

  async createInventoryAdjustment(
    adjustment: InsertInventoryAdjustment,
  ): Promise<InventoryAdjustment> {
    // Get next ID
    const adjustmentsRef = collection(db, "inventoryAdjustments");
    const snapshot = await getDocs(adjustmentsRef);
    const nextId =
      snapshot.docs.length > 0
        ? Math.max(...snapshot.docs.map((doc) => Number(doc.id))) + 1
        : 1;

    // Convert date string to Firestore timestamp
    const adjustmentData = {
      ...adjustment,
      adjustmentDate: new Date(adjustment.adjustmentDate),
      notes: adjustment.notes || null,
    };

    // Create document with the calculated ID (as string)
    const docRef = doc(db, "inventoryAdjustments", nextId.toString());
    await setDoc(docRef, {
      ...adjustmentData,
      id: nextId,
    });

    console.log("Inventory adjustment created with ID:", nextId);

    return {
      id: nextId,
      ...adjustment,
      notes: adjustment.notes || null,
      adjustmentDate: new Date(adjustment.adjustmentDate).toISOString(),
    };
  }
}

export const storage = new FirebaseStorage();
