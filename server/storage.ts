import { db } from "./db";
import { invoices, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { Invoice, InsertInvoice, User, InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(invoices.createdAt);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(insertInvoice).returning();
    return invoice;
  }

  async updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }
}

export const storage = new DatabaseStorage();