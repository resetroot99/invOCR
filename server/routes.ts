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

// Check if message contains invoice markers
function hasInvoiceMarkers(message: string): boolean {
  const markers = ['INV', 'RO'];
  return markers.some(marker => message.toUpperCase().includes(marker));
}

// Simulated OCR processing
async function simulateOCRProcessing(invoice: { id: number; filename: string }) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Generate simulated OCR data
  const ocrData = {
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
    roNumber: `RO${Math.floor(Math.random() * 100000)}`,
    date: new Date().toISOString().split('T')[0],
    totalAmount: Math.floor(Math.random() * 1000000) / 100,
    parts: [
      {
        partNumber: `PART-${Math.floor(Math.random() * 1000)}`,
        description: "Front Bumper Assembly",
        price: Math.floor(Math.random() * 50000) / 100,
        verified: Math.random() > 0.2,
        oem: Math.random() > 0.3,
      },
      {
        partNumber: `PART-${Math.floor(Math.random() * 1000)}`,
        description: "Headlight Assembly",
        price: Math.floor(Math.random() * 30000) / 100,
        verified: Math.random() > 0.2,
        oem: Math.random() > 0.3,
      }
    ],
    ocrConfidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
    drpCompliant: Math.random() > 0.2, // 80% chance of compliance
    validationResults: {
      priceVerified: true,
      partNumbersVerified: true,
      drpRulesChecked: true,
      errors: []
    }
  };

  // Update invoice with OCR results
  await storage.updateInvoice(invoice.id, {
    status: "completed",
    data: ocrData
  });
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
      simulateOCRProcessing(invoice).catch(console.error);

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
        fileType: 'jpg', // Assuming MMS attachments are images
        status: "processing",
        source: "sms"
      }));

      // Start OCR processing in background
      simulateOCRProcessing(invoice).catch(console.error);

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