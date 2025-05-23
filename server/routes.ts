import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./firebaseStorage";
import {
  insertProductSchema,
  insertPurchaseSchema,
  insertPurchaseItemSchema,
  insertSaleSchema,
  insertSaleItemSchema,
  insertInventoryAdjustmentSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with /api prefix

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product" });
    }
  });
  
  app.post("/api/products", async (req, res) => {
    try {
      const productData = req.body;
      
      // Create product
      const createdProduct = await storage.createProduct(productData);
      
      res.status(201).json(createdProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const productData = req.body;
      
      console.log("PATCH /api/products/:id - Updating product with ID:", id);
      console.log("Update data:", productData);
      
      const updatedProduct = await storage.updateProduct(id, productData);
      
      if (!updatedProduct) {
        console.log("Product not found for update");
        return res.status(404).json({ message: "Product not found" });
      }
      
      console.log("Product updated successfully:", updatedProduct);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  // Supplier routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get suppliers" });
    }
  });
  
  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const supplier = await storage.getSupplier(id);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to get supplier" });
    }
  });
  
  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = req.body;
      
      // Create supplier
      const createdSupplier = await storage.createSupplier(supplierData);
      
      res.status(201).json(createdSupplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });
  
  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteSupplier(id);
      
      if (!success) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });



  // Purchase routes
  app.get("/api/purchases", async (req, res) => {
    try {
      const purchases = await storage.getPurchases();
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "Failed to get purchases" });
    }
  });

  app.get("/api/purchases/:id", async (req, res) => {
    try {
      // Using string ID directly instead of parsing to integer
      const id = req.params.id;
      console.log(`API - Getting purchase with ID: ${id}`);
      
      const purchase = await storage.getPurchase(id);
      
      if (!purchase) {
        console.log(`API - Purchase with ID ${id} not found`);
        return res.status(404).json({ message: "Purchase not found" });
      }
      
      console.log(`API - Found purchase:`, purchase);
      res.json(purchase);
    } catch (error) {
      console.error("API - Failed to get purchase:", error);
      res.status(500).json({ message: "Failed to get purchase" });
    }
  });
  
  app.get("/api/purchases/:id/items", async (req, res) => {
    try {
      // Using string ID directly
      const id = req.params.id;
      console.log(`API - Getting purchase items for purchase ID: ${id}`);
      
      const purchaseItems = await storage.getPurchaseItems(id);
      console.log(`API - Found ${purchaseItems.length} purchase items`);
      
      res.json(purchaseItems);
    } catch (error) {
      console.error("API - Failed to get purchase items:", error);
      res.status(500).json({ message: "Failed to get purchase items" });
    }
  });

  app.post("/api/purchases", async (req, res) => {
    try {
      const { purchase, items } = req.body;
      const purchaseData = insertPurchaseSchema.parse(purchase);
      
      // Create purchase
      const createdPurchase = await storage.createPurchase(purchaseData);
      
      // Process purchase items
      const createdItems = [];
      for (const item of items) {
        // Make sure productId is valid (handle both string and number IDs)
        let isValidId = false;
        if (typeof item.productId === 'string') {
          isValidId = Boolean(item.productId) && item.productId.length > 0;
        } else if (typeof item.productId === 'number') {
          isValidId = item.productId > 0;
        }
        
        if (!isValidId) {
          console.error("Invalid product ID:", item.productId, "Type:", typeof item.productId);
          return res.status(400).json({ 
            message: "Invalid product selection", 
            error: "Please select a valid product for all items" 
          });
        }
        
        const itemData = insertPurchaseItemSchema.parse({
          ...item,
          purchaseId: createdPurchase.id
        });
        
        const createdItem = await storage.createPurchaseItem(itemData);
        createdItems.push(createdItem);
        
        // Update product stock
        await storage.updateProductStock(item.productId, item.quantity);
        
        // Create inventory adjustment
        await storage.createInventoryAdjustment({
          productId: item.productId,
          adjustmentDate: purchaseData.orderDate,
          adjustmentType: "Incoming",
          quantity: item.quantity,
          reason: `Purchase: ${purchaseData.invoiceNumber}`,
          notes: null
        });
      }
      
      res.status(201).json({ purchase: createdPurchase, items: createdItems });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid purchase data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });

  app.delete("/api/purchases/:id", async (req, res) => {
    try {
      // Using string ID directly
      const id = req.params.id;
      console.log(`API - Deleting purchase with ID: ${id}`);
      
      const success = await storage.deletePurchase(id);
      
      if (!success) {
        console.log(`API - Purchase with ID ${id} not found for deletion`);
        return res.status(404).json({ message: "Purchase not found" });
      }
      
      console.log(`API - Successfully deleted purchase with ID: ${id}`);
      res.status(204).end();
    } catch (error) {
      console.error("API - Failed to delete purchase:", error);
      res.status(500).json({ message: "Failed to delete purchase" });
    }
  });

  // Sale routes
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sales" });
    }
  });

  app.get("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sale = await storage.getSale(id);
      
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sale" });
    }
  });
  
  app.get("/api/sales/:id/items", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const saleItems = await storage.getSaleItems(id);
      res.json(saleItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sale items" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const { sale, items } = req.body;
      const saleData = insertSaleSchema.parse(sale);
      
      // Create sale
      const createdSale = await storage.createSale(saleData);
      
      // Process sale items
      const createdItems = [];
      for (const item of items) {
        // Make sure productId is valid (handle both string and number IDs)
        let isValidId = false;
        if (typeof item.productId === 'string') {
          isValidId = Boolean(item.productId) && item.productId.length > 0;
        } else if (typeof item.productId === 'number') {
          isValidId = item.productId > 0;
        }
        
        if (!isValidId) {
          console.error("Invalid product ID:", item.productId, "Type:", typeof item.productId);
          return res.status(400).json({ 
            message: "Invalid product selection", 
            error: "Please select a valid product for all items" 
          });
        }
        
        const itemData = insertSaleItemSchema.parse({
          ...item,
          saleId: createdSale.id
        });
        
        const createdItem = await storage.createSaleItem(itemData);
        createdItems.push(createdItem);
        
        // Update product stock (decrease)
        await storage.updateProductStock(item.productId, -item.quantity);
        
        // Create inventory adjustment
        await storage.createInventoryAdjustment({
          productId: item.productId,
          adjustmentDate: saleData.saleDate,
          adjustmentType: "Outgoing",
          quantity: item.quantity,
          reason: `Sale: ${saleData.customerName}`,
          notes: null
        });
      }
      
      res.status(201).json({ sale: createdSale, items: createdItems });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sale data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSale(id);
      
      if (!success) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sale" });
    }
  });

  // Inventory adjustment routes
  app.get("/api/inventory-adjustments", async (req, res) => {
    try {
      const adjustments = await storage.getInventoryAdjustments();
      res.json(adjustments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get inventory adjustments" });
    }
  });

  app.get("/api/inventory-adjustments/product/:productId", async (req, res) => {
    try {
      const productId = req.params.productId;
      console.log("Getting inventory adjustments for product ID:", productId);
      const adjustments = await storage.getInventoryAdjustmentsForProduct(productId);
      res.json(adjustments);
    } catch (error) {
      console.error("Error getting inventory adjustments:", error);
      res.status(500).json({ message: "Failed to get inventory adjustments" });
    }
  });

  app.post("/api/inventory-adjustments", async (req, res) => {
    try {
      const adjustmentData = insertInventoryAdjustmentSchema.parse(req.body);
      
      // Create inventory adjustment
      const adjustment = await storage.createInventoryAdjustment(adjustmentData);
      
      // Update product stock
      const quantityChange = adjustmentData.adjustmentType === "Incoming" 
        ? adjustmentData.quantity 
        : -adjustmentData.quantity;
        
      // Convert productId to string if needed to ensure consistency
      const productId = adjustmentData.productId.toString();
      await storage.updateProductStock(productId, quantityChange);
      
      res.status(201).json(adjustment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid adjustment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inventory adjustment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
