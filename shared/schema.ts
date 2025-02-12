import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  status: text("status", { 
    enum: ['processing', 'completed', 'failed', 'pending_verification'] 
  }).notNull().default("processing"),
  fileType: text("file_type", {
    enum: ['pdf', 'jpg', 'png']
  }).notNull().default('pdf'),
  data: jsonb("data").$type<{
    invoiceNumber?: string;
    roNumber?: string;
    date?: string;
    totalAmount?: number;
    parts?: Array<{
      partNumber: string;
      description: string;
      price: number;
      verified: boolean;
    }>;
    notes?: string;
    drpCompliant?: boolean;
    ocrConfidence?: number;
  }>(),
  processingErrors: text("processing_errors").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", {
    enum: ['admin', 'user', 'viewer']
  }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for invoice insertion
export const insertInvoiceSchema = createInsertSchema(invoices)
  .pick({
    filename: true,
    fileType: true,
  });

// Schema for user insertion
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
  });

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
