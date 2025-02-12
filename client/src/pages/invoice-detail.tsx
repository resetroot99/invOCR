import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { type Invoice } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const partSchema = z.object({
  partNumber: z.string().min(1, "Part number is required"),
  description: z.string(),
  price: z.number().min(0, "Price must be positive"),
  verified: z.boolean(),
  oem: z.boolean().optional()
});

const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  roNumber: z.string().min(1, "RO number is required"),
  date: z.string().min(1, "Date is required"),
  totalAmount: z.number().min(0, "Total amount must be positive"),
  parts: z.array(partSchema)
});

export default function InvoiceDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: invoice, isLoading } = useQuery<Invoice>({
    queryKey: [`/api/invoices/${id}`],
  });

  const form = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: invoice?.data?.invoiceNumber || "",
      roNumber: invoice?.data?.roNumber || "",
      date: invoice?.data?.date || "",
      totalAmount: invoice?.data?.totalAmount || 0,
      parts: invoice?.data?.parts || []
    }
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/invoices/${id}/post`, form.getValues());
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice posted to CCC and QuickBooks",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error posting invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoice Details</h1>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel Edit" : "Edit"}
          </Button>
          <Button
            onClick={() => postMutation.mutate()}
            disabled={postMutation.isPending}
          >
            Post
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Image */}
        <Card>
          <CardHeader>
            <CardTitle>Original Invoice</CardTitle>
            <CardDescription>
              {invoice.filename}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src={`/api/invoices/${id}/image`} 
              alt="Invoice" 
              className="w-full h-auto"
            />
          </CardContent>
        </Card>

        {/* Parsed Data */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Data</CardTitle>
            <CardDescription>
              OCR Confidence: {Math.round((invoice.data?.ocrConfidence || 0) * 100)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RO Number</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01"
                          disabled={!isEditing} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parts List */}
                <div className="space-y-4">
                  <Label>Parts</Label>
                  {form.watch("parts")?.map((part, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="grid gap-4">
                          <FormField
                            control={form.control}
                            name={`parts.${index}.partNumber`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Part Number</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={!isEditing} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`parts.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={!isEditing} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`parts.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    step="0.01"
                                    disabled={!isEditing} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
