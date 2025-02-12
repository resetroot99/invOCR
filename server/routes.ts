import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertInvoiceSchema } from "@shared/schema";
import path from "path";
import { processOCR } from "./services/ocr";

// Configure multer for file upload with storage configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
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

// Check if message contains invoice markers
function hasInvoiceMarkers(message: string): boolean {
  const markers = ['INV', 'RO'];
  return markers.some(marker => message.toUpperCase().includes(marker));
}

export function registerRoutes(app: Express): Server {
  // File upload endpoint
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
        status: "processing",
        source: "upload"
      }));

      // Start OCR processing in background
      processOCR(invoice, req.file.path).catch(console.error);

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

  // SMS processing endpoint
  app.post("/api/invoices/sms", async (req, res) => {
    try {
      const { message, mediaUrl } = req.body;

      // Check for invoice markers in message
      if (!hasInvoiceMarkers(message)) {
        return res.status(400).json({ message: "No invoice markers found in message" });
      }

      // Create invoice record for SMS
      const invoice = await storage.createInvoice(insertInvoiceSchema.parse({
        filename: `SMS-${Date.now()}`,
        fileType: 'jpg',
        status: "processing",
        source: "sms"
      }));

      // If there's a media URL, process it with OCR
      if (mediaUrl) {
        // In a real implementation, you would:
        // 1. Download the media from the URL
        // 2. Save it to the uploads directory
        // 3. Process with OCR
        processOCR(invoice, mediaUrl).catch(console.error);
      } else {
        // Handle text-only messages
        await storage.updateInvoice(invoice.id, {
          status: "failed",
          processingErrors: ["No image attachment found in SMS"]
        });
      }

      res.json({ 
        message: "Invoice received and processing started",
        invoice 
      });
    } catch (error) {
      console.error('SMS processing error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error processing SMS" });
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