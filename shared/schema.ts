import { z } from "zod";

// Product schemas
export const insertProductSchema = z.object({
  name: z.string().min(1),
  unitPrice: z.number().min(0),
  currentStock: z.number().int().default(0),
});

export type Product = {
  id: number;
  name: string;
  unitPrice: number;
  currentStock: number;
};

export type InsertProduct = z.infer<typeof insertProductSchema>;

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
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0),
  finalValue: z.number().min(0),
});

export type PurchaseItem = {
  id: number;
  purchaseId: number;
  productId: number;
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
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export type SaleItem = {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
};

export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;

// Inventory adjustments schemas
export const insertInventoryAdjustmentSchema = z.object({
  productId: z.number().int().positive(),
  adjustmentDate: z.string().min(1), // Accept string dates
  adjustmentType: z.string().min(1),
  quantity: z.number().int().positive(),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

export type InventoryAdjustment = {
  id: number;
  productId: number;
  adjustmentDate: string;
  adjustmentType: string;
  quantity: number;
  reason: string;
  notes: string | null;
};

export type InsertInventoryAdjustment = z.infer<typeof insertInventoryAdjustmentSchema>;
