import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileSearch, 
  MessageSquare, 
  Upload, 
  Cog, 
  Database, 
  Shield,
  FileText,
  Check,
  AlertTriangle
} from "lucide-react";

export default function Features() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <FileSearch className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>Smart OCR Processing</CardTitle>
        </CardHeader>
        <CardContent>
          Advanced OCR with multi-language support and real-time text extraction for PDFs and images.
        </CardContent>
      </Card>
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <FileText className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>Invoice Processing</CardTitle>
        </CardHeader>
        <CardContent>
          Automated data extraction with pattern matching for invoice numbers, dates, and amounts.
        </CardContent>
      </Card>
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <Check className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>Validation & Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          Real-time part verification, price validation, and DRP compliance checking.
        </CardContent>
      </Card>
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <Database className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>System Integration</CardTitle>
        </CardHeader>
        <CardContent>
          Seamless integration with CCC ONE, Mitchell, Audatex, and QuickBooks.
        </CardContent>
      </Card>
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <MessageSquare className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>Smart Messaging</CardTitle>
        </CardHeader>
        <CardContent>
          Email and SMS processing with automated status updates and notifications.
        </CardContent>
      </Card>
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <AlertTriangle className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>Error Prevention</CardTitle>
        </CardHeader>
        <CardContent>
          95% reduction in manual entry errors with automated validation and checks.
        </CardContent>
      </Card>
    </div>
  );
}