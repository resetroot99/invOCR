
# InvOCR Integration Documentation

## System Architecture

InvOCR is a full-stack application that processes auto repair invoices through multiple channels:
- Direct file upload (PDF/JPG/PNG)
- SMS/MMS attachments
- Email attachments (coming soon)

## Required API Integrations

### 1. CCC ONE Integration
Current implementation: Mock API simulation
Required endpoints:
- `POST /estimating/v1/parts/verify` - Verify part numbers and prices
- `PUT /estimating/v1/estimates/{id}` - Update estimate with invoice data
- `POST /estimating/v1/attachments` - Upload invoice as attachment

### 2. Mitchell Integration
Current implementation: Simulated endpoints
Required endpoints:
- `POST /api/v6/estimates/{id}/parts` - Update parts in estimate
- `POST /api/v6/documents` - Upload invoice document
- `GET /api/v6/parts/verify` - Verify part compatibility

### 3. Audatex Integration
Current implementation: Mock interface
Required endpoints:
- `POST /estimate-services/v1/estimates/{id}/parts` 
- `POST /estimate-services/v1/attachments`
- `GET /estimate-services/v1/parts/validation`

### 4. QuickBooks Integration
Current implementation: Basic simulation
Required endpoints:
- `POST /v3/company/{realmId}/invoice`
- `POST /v3/company/{realmId}/upload`

## Testing Environment

Current test setup uses mock implementations that simulate the behavior of:

1. CCC ONE Test Environment
- Mock responses match CCC ONE's XML format
- Part verification simulates standard CCC validation rules
- Attachment upload mimics CCC's document management

2. Mitchell Test System
- Simulated estimate updates follow Mitchell's JSON schema
- Part verification uses sample Mitchell part database

3. Audatex Sandbox
- Mock integration follows Audatex's SOAP-based protocol
- Test data structured to match Audatex's requirements

## Implementation Notes

### OCR Processing
- Uses Tesseract OCR with custom training for auto parts
- Confidence scoring system for validation
- Pattern matching for common invoice formats

### DRP Compliance
- Rules engine checks against major carrier requirements
- Price validation against approved ranges
- Part type verification (OEM/Aftermarket/Used)

### Integration Mapping

Current mappings in mock implementations:

```typescript
// CCC ONE Format
interface CCCPart {
  partNumber: string;
  price: number;
  type: 'OEM' | 'AFT' | 'USED';
  laborHours?: number;
}

// Mitchell Format
interface MitchellPart {
  partId: string;
  listPrice: number;
  category: string;
  laborTime: number;
}

// Audatex Format
interface AudatexPart {
  oem_number: string;
  price_details: {
    amount: number;
    currency: string;
  };
  part_type: string;
}
```

### Testing Process

1. Upload test invoices through UI
2. Verify OCR accuracy against known values
3. Confirm integration endpoints receive correctly formatted data
4. Validate DRP compliance checks
5. Verify QuickBooks posting accuracy

## Production Deployment

The application is currently deployed on Replit with the following configuration:
- Backend: Node.js Express server (Port 5000)
- Frontend: React/Vite application
- Database: PostgreSQL with Drizzle ORM
- File Storage: Local storage in `/uploads`
