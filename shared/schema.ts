import { z } from "zod";

// Price history schema
export const priceHistorySchema = z.object({
  date: z.string().min(1), // ISO string date
  price: z.number().min(0),
});

export type PriceHistory = z.infer<typeof priceHistorySchema>;

// Supplier schema for individual product suppliers
export const productSupplierSchema = z.object({
  name: z.string().min(1),
  priceHistory: z.array(priceHistorySchema).default([]),
});

export type ProductSupplier = z.infer<typeof productSupplierSchema>;

// Updated Product schemas
export const insertProductSchema = z.object({
  id: z.string().uuid().optional(), // UUID will be generated if not provided
  name: z.string().min(1),
  currentStock: z.number().int().default(0),
  suppliers: z.array(productSupplierSchema).default([]),
});

export type Product = {
  id: string; // Using UUID instead of number
  name: string;
  currentStock: number;
  suppliers: ProductSupplier[];
};

export type InsertProduct = z.infer<typeof insertProductSchema>;

// Generic Supplier schema (for management purposes)
export const insertSupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

export type Supplier = {
  id: string; // UUID
  name: string;
};

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

// Purchase schemas
export const insertPurchaseSchema = z.object({
  invoiceNumber: z.string().min(1),
  orderDate: z.string().min(1), // Accept string dates
  supplier: z.string().min(1),
  deliveryCost: z.number().min(0),
  totalAmount: z.number().min(0),
});

export type Purchase = {
  id: number;
  invoiceNumber: string;
  orderDate: string;
  supplier: string;
  deliveryCost: number;
  totalAmount: number;
};

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

// Purchase items schemas
export const insertPurchaseItemSchema = z.object({
  purchaseId: z.number().int().positive(),
  productId: z.string().uuid(), // Changed to UUID string
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0),
  finalValue: z.number().min(0),
});

export type PurchaseItem = {
  id: number;
  purchaseId: number;
  productId: string; // Changed to UUID string
  quantity: number;
  unitPrice: number;
  finalValue: number;
};

export type InsertPurchaseItem = z.infer<typeof insertPurchaseItemSchema>;

// Sales schemas
export const insertSaleSchema = z.object({
  customerName: z.string().min(1),
  customerContact: z.string().min(1),
  saleDate: z.string().min(1), // Accept string dates
  saleAmount: z.number().min(0),
});

export type Sale = {
  id: number;
  customerName: string;
  customerContact: string;
  saleDate: string;
  saleAmount: number;
};

export type InsertSale = z.infer<typeof insertSaleSchema>;

// Sale items schemas
export const insertSaleItemSchema = z.object({
  saleId: z.number().int().positive(),
  productId: z.string().uuid(), // Changed to UUID string
  quantity: z.number().int().positive(),
});

export type SaleItem = {
  id: number;
  saleId: number;
  productId: string; // Changed to UUID string
  quantity: number;
};

export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;

// Inventory adjustments schemas
export const insertInventoryAdjustmentSchema = z.object({
  productId: z.string().uuid(), // Changed to UUID string
  adjustmentDate: z.string().min(1), // Accept string dates
  adjustmentType: z.string().min(1),
  quantity: z.number().int().positive(),
  reason: z.string().min(1),
  notes: z.string().nullable().optional(), // Make notes explicitly nullable
});

export type InventoryAdjustment = {
  id: number;
  productId: string; // Changed to UUID string
  adjustmentDate: string;
  adjustmentType: string;
  quantity: number;
  reason: string;
  notes: string | null;
};

export type InsertInventoryAdjustment = z.infer<typeof insertInventoryAdjustmentSchema>;
