import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertInvoiceSchema } from "@shared/schema";
import path from "path";

// Configure multer for file upload
const upload = multer({
  dest: "uploads/",
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG and PDF files are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to get file type from mimetype
function getFileType(mimetype: string): 'pdf' | 'jpg' | 'png' {
  switch (mimetype) {
    case 'application/pdf':
      return 'pdf';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    default:
      throw new Error('Unsupported file type');
  }
}

export function registerRoutes(app: Express): Server {
  app.post("/api/invoices/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filename = req.file.originalname;
      const fileType = getFileType(req.file.mimetype);

      // Create invoice record
      const invoice = await storage.createInvoice(insertInvoiceSchema.parse({ 
        filename,
        fileType,
        status: "processing"
      }));

      // In a real application, you would:
      // 1. Send the file for OCR processing
      // 2. Update the invoice record with extracted data
      // 3. Validate against DRP rules
      // 4. Verify part numbers and prices

      res.json(invoice);
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error processing upload" });
      }
    }
  });

  app.get("/api/invoices", async (_req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ message: "Error fetching invoices" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}