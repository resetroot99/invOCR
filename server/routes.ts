import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertInvoiceSchema } from "@shared/schema";

const upload = multer({ dest: "uploads/" });

export function registerRoutes(app: Express): Server {
  app.post("/api/invoices/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filename = req.file.originalname;
      const invoice = await storage.createInvoice({ filename });

      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Error processing upload" });
    }
  });

  app.get("/api/invoices", async (_req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Error fetching invoices" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
