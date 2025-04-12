import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  currentStock: integer("current_stock").notNull().default(0),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

// Purchases table
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  orderDate: timestamp("order_date").notNull(),
  supplier: text("supplier").notNull(),
  deliveryCost: doublePrecision("delivery_cost").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
});

// Create custom insert schema with string date handling
export const insertPurchaseSchema = z.object({
  invoiceNumber: z.string().min(1),
  orderDate: z.string().min(1), // Accept string dates
  supplier: z.string().min(1),
  deliveryCost: z.number().min(0),
  totalAmount: z.number().min(0),
});

// Purchase items table
export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  finalValue: doublePrecision("final_value").notNull(),
});

export const insertPurchaseItemSchema = createInsertSchema(purchaseItems).omit({
  id: true,
});

// Sales table
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerContact: text("customer_contact").notNull(),
  saleDate: timestamp("sale_date").notNull(),
  saleAmount: doublePrecision("sale_amount").notNull(),
});

// Create custom insert schema with string date handling
export const insertSaleSchema = z.object({
  customerName: z.string().min(1),
  customerContact: z.string().min(1),
  saleDate: z.string().min(1), // Accept string dates
  saleAmount: z.number().min(0),
});

// Sale items table
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
});

export const insertSaleItemSchema = createInsertSchema(saleItems).omit({
  id: true,
});

// Inventory adjustments table
export const inventoryAdjustments = pgTable("inventory_adjustments", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  adjustmentDate: timestamp("adjustment_date").notNull(),
  adjustmentType: text("adjustment_type").notNull(), // Incoming, Outgoing
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
});

// Create custom insert schema with string date handling
export const insertInventoryAdjustmentSchema = z.object({
  productId: z.number().int().positive(),
  adjustmentDate: z.string().min(1), // Accept string dates
  adjustmentType: z.string().min(1),
  quantity: z.number().int().positive(),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type InsertPurchaseItem = z.infer<typeof insertPurchaseItemSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;

export type InventoryAdjustment = typeof inventoryAdjustments.$inferSelect;
export type InsertInventoryAdjustment = z.infer<typeof insertInventoryAdjustmentSchema>;
