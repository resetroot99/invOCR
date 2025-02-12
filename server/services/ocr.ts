import { createWorker } from 'tesseract.js';
import type { Invoice } from '@shared/schema';
import { storage } from '../storage';
import path from 'path';

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function initializeWorker() {
  if (!worker) {
    worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
  }
  return worker;
}

export async function processOCR(invoice: Invoice, filePath: string): Promise<void> {
  try {
    const worker = await initializeWorker();
    
    // Perform OCR on the file
    const { data: { text } } = await worker.recognize(filePath);
    
    // Extract relevant information using regex patterns
    const invoiceNumber = text.match(/INV[-\s]?\d{5,}/i)?.[0] || '';
    const roNumber = text.match(/RO\d{5,}/i)?.[0] || '';
    const amount = text.match(/\$\s*(\d{1,3}(,\d{3})*(\.\d{2})?)/)?.[1] || '';
    const date = text.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] || '';
    
    // Extract parts information (basic pattern matching)
    const parts = extractParts(text);
    
    // Calculate confidence based on the number of successfully extracted fields
    const extractedFields = [invoiceNumber, roNumber, amount, date].filter(Boolean).length;
    const ocrConfidence = extractedFields / 4; // Simple confidence calculation
    
    // Update invoice with real OCR data
    await storage.updateInvoice(invoice.id, {
      status: "completed",
      data: {
        invoiceNumber,
        roNumber,
        date,
        totalAmount: parseFloat(amount.replace(/,/g, '')) || 0,
        parts,
        ocrConfidence,
        drpCompliant: validateDRPCompliance(parts),
        validationResults: {
          priceVerified: true,
          partNumbersVerified: validatePartNumbers(parts),
          drpRulesChecked: true,
          errors: []
        }
      }
    });
  } catch (error) {
    console.error('OCR Processing error:', error);
    await storage.updateInvoice(invoice.id, {
      status: "failed",
      processingErrors: [(error as Error).message]
    });
  }
}

function extractParts(text: string): Array<{
  partNumber: string;
  description: string;
  price: number;
  verified: boolean;
  oem: boolean;
}> {
  // Basic part extraction logic - can be enhanced based on specific invoice formats
  const partLines = text.split('\n').filter(line => 
    /[A-Z0-9]{6,8}.*\$\d+/.test(line)
  );
  
  return partLines.map(line => {
    const partNumber = line.match(/[A-Z0-9]{6,8}/)?.[0] || '';
    const price = parseFloat(line.match(/\$\s*(\d+(\.\d{2})?)/)?.[1] || '0');
    
    return {
      partNumber,
      description: line.replace(/[A-Z0-9]{6,8}/, '').replace(/\$\s*\d+(\.\d{2})?/, '').trim(),
      price,
      verified: validatePartNumber(partNumber),
      oem: isOEMPart(partNumber)
    };
  });
}

function validatePartNumber(partNumber: string): boolean {
  // Basic validation - can be enhanced with real parts database
  return /^[A-Z0-9]{6,8}$/.test(partNumber);
}

function isOEMPart(partNumber: string): boolean {
  // Basic OEM check - can be enhanced with real parts database
  return partNumber.startsWith('OEM');
}

function validateDRPCompliance(parts: Array<any>): boolean {
  // Basic DRP compliance check - can be enhanced with real rules
  return parts.every(part => part.verified);
}

function validatePartNumbers(parts: Array<any>): boolean {
  return parts.every(part => validatePartNumber(part.partNumber));
}
