import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { type Invoice } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Send
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [_, navigate] = useLocation();
  const [smsMessage, setSmsMessage] = useState("");
  const { toast } = useToast();
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const sendSmsMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/invoices/sms", { message });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "SMS Processed",
        description: "Your message is being processed",
      });
      setSmsMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendSms = () => {
    if (!smsMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }
    sendSmsMutation.mutate(smsMessage);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[125px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time processed
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processing
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices?.filter((i) => i.status === "processing").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in OCR
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices?.filter((i) => i.status === "completed").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              DRP Compliance
            </CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices?.filter((i) => i.data?.drpCompliant).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Meeting DRP rules
            </p>
          </CardContent>
        </Card>
      </div>

      

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            Track processing status and validation results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>OCR Confidence</TableHead>
                <TableHead>DRP Compliant</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id} className="cursor-pointer hover:bg-accent/50" onClick={() => navigate(`/invoice/${invoice.id}`)}>
                  <TableCell className="font-medium">{invoice.filename}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {invoice.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invoice.status)}
                      <Badge
                        variant={invoice.status === "completed" ? "default" : "secondary"}
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {invoice.data?.ocrConfidence !== undefined ?
                      `${Math.round(invoice.data.ocrConfidence * 100)}%` :
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    {invoice.data?.drpCompliant ?
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    }
                  </TableCell>
                  <TableCell>
                    {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}