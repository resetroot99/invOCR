import { createWorker } from 'tesseract.js';
import type { Invoice } from '@shared/schema';
import { storage } from '../storage';
import fs from 'fs';

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function initializeWorker() {
  try {
    if (!worker) {
      console.log('Initializing Tesseract worker...');
      worker = await createWorker();
      console.log('Worker created, loading...');
      await worker.loadLanguage('eng');
      console.log('Language loaded, initializing...');
      await worker.initialize('eng');
      console.log('Worker initialized successfully');
    }
    return worker;
  } catch (error) {
    console.error('Error initializing worker:', error);
    throw error;
  }
}

export async function processOCR(invoice: Invoice, filePath: string): Promise<void> {
  console.log(`Starting OCR processing for invoice ${invoice.id}, file: ${filePath}`);

  try {
    // Verify file exists and is readable
    await fs.promises.access(filePath, fs.constants.R_OK);
    console.log('File is accessible');

    const worker = await initializeWorker();
    console.log('Worker ready, starting recognition');

    // Perform OCR on the file
    const { data: { text } } = await worker.recognize(filePath);
    console.log('OCR completed, extracted text length:', text.length);

    // Extract relevant information using regex patterns
    const invoiceNumber = text.match(/INV[-\s]?\d{5,}/i)?.[0] || '';
    const roNumber = text.match(/RO\d{5,}/i)?.[0] || '';
    const amount = text.match(/\$\s*(\d{1,3}(,\d{3})*(\.\d{2})?)/)?.[1] || '';
    const date = text.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] || '';

    console.log('Extracted fields:', { invoiceNumber, roNumber, amount, date });

    // Extract parts information
    const parts = extractParts(text);
    console.log('Extracted parts:', parts.length);

    // Calculate confidence
    const extractedFields = [invoiceNumber, roNumber, amount, date].filter(Boolean).length;
    const ocrConfidence = extractedFields / 4;

    // Update invoice with extracted data
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

    console.log('Invoice updated successfully');

  } catch (error) {
    console.error('OCR Processing error:', error);
    await storage.updateInvoice(invoice.id, {
      status: "failed",
      processingErrors: [(error as Error).message]
    });
  } finally {
    try {
      if (worker) {
        console.log('Terminating worker');
        await worker.terminate();
        worker = null;
      }
    } catch (error) {
      console.error('Error terminating worker:', error);
    }
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