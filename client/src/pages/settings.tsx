
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";
import { Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [smsMessage, setSmsMessage] = useState("");
  const { toast } = useToast();

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how InvOCR looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Dark Mode</h3>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMS Testing</CardTitle>
          <CardDescription>
            Test SMS invoice processing functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter message (include INV or RO)"
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
            />
            <Button
              onClick={() => sendSmsMutation.mutate(smsMessage)}
              disabled={sendSmsMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
          <CardDescription>
            Project resources and documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => window.open('https://github.com/resetroot99/invOCR', '_blank')}>
              View on GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
