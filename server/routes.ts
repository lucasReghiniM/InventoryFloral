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
      const id = parseInt(req.params.id);
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
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
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
      const id = parseInt(req.params.id);
      const purchase = await storage.getPurchase(id);
      
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      
      res.json(purchase);
    } catch (error) {
      res.status(500).json({ message: "Failed to get purchase" });
    }
  });
  
  app.get("/api/purchases/:id/items", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const purchaseItems = await storage.getPurchaseItems(id);
      res.json(purchaseItems);
    } catch (error) {
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
          notes: ""
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
      const id = parseInt(req.params.id);
      const success = await storage.deletePurchase(id);
      
      if (!success) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      
      res.status(204).end();
    } catch (error) {
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
          notes: ""
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
      const productId = parseInt(req.params.productId);
      const adjustments = await storage.getInventoryAdjustmentsForProduct(productId);
      res.json(adjustments);
    } catch (error) {
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
        
      await storage.updateProductStock(adjustmentData.productId, quantityChange);
      
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
