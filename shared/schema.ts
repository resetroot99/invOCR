import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  status: text("status", { 
    enum: ['processing', 'completed', 'failed', 'pending_verification', 'posted'] 
  }).notNull().default("processing"),
  fileType: text("file_type", {
    enum: ['pdf', 'jpg', 'png']
  }).notNull().default('pdf'),
  source: text("source", {
    enum: ['upload', 'email', 'sms']
  }).notNull().default('upload'),
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
      oem?: boolean;
    }>;
    notes?: string;
    drpCompliant?: boolean;
    ocrConfidence?: number;
    carrierInfo?: {
      name?: string;
      policyNumber?: string;
      claimNumber?: string;
    };
    integrationStatus?: {
      cccOne?: boolean;
      mitchell?: boolean;
      audatex?: boolean;
      quickbooks?: boolean;
    };
    validationResults?: {
      priceVerified: boolean;
      partNumbersVerified: boolean;
      drpRulesChecked: boolean;
      errors?: string[];
    };
  }>(),
  processingErrors: text("processing_errors").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const integrationSettings = pgTable("integration_settings", {
  id: serial("id").primaryKey(),
  provider: text("provider", {
    enum: ['ccc_one', 'mitchell', 'audatex', 'quickbooks']
  }).notNull(),
  apiKey: text("api_key").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  settings: jsonb("settings").$type<{
    endpoint?: string;
    credentials?: {
      username?: string;
      accountId?: string;
    };
    options?: Record<string, unknown>;
  }>(),
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
  apiKey: text("api_key"),
  settings: jsonb("settings").$type<{
    defaultIntegrations?: string[];
    notifications?: {
      email?: boolean;
      sms?: boolean;
    };
    drpRules?: Record<string, unknown>;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for invoice insertion
export const insertInvoiceSchema = createInsertSchema(invoices)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    processingErrors: true,
  });

// Schema for integration settings insertion
export const insertIntegrationSettingSchema = createInsertSchema(integrationSettings)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Schema for user insertion
export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
    apiKey: true,
  });

// Export types
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertIntegrationSetting = z.infer<typeof insertIntegrationSettingSchema>;
export type IntegrationSetting = typeof integrationSettings.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;