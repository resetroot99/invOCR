import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Upload, Cog, Database, Shield } from "lucide-react";

export default function Features() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <Mail className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>Multi-Channel Input</CardTitle>
        </CardHeader>
        <CardContent>
          Support for email attachments, SMS/MMS, direct upload, and automated scanning.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Cog className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>Advanced Processing</CardTitle>
        </CardHeader>
        <CardContent>
          AI-powered OCR with real-time validation and DRP compliance checking.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Database className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>Enterprise Integration</CardTitle>
        </CardHeader>
        <CardContent>
          Seamless integration with CCC ONE, Mitchell, Audatex, and QuickBooks.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Shield className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>DRP Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          Automatic rule enforcement and part verification in real-time.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <MessageSquare className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>Smart Messaging</CardTitle>
        </CardHeader>
        <CardContent>
          Automated notifications and status updates for seamless communication.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Upload className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>Auto-Posting</CardTitle>
        </CardHeader>
        <CardContent>
          Direct system posting with complete audit trail and error handling.
        </CardContent>
      </Card>
    </div>
  );
}
