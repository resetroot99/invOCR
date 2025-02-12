import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, DollarSign, Zap } from "lucide-react";

export default function Stats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Clock className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">30%</p>
            <p className="text-sm text-muted-foreground">Faster Processing</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <CheckCircle className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">95%</p>
            <p className="text-sm text-muted-foreground">Error Reduction</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">40%</p>
            <p className="text-sm text-muted-foreground">Cost Savings</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Zap className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">24/7</p>
            <p className="text-sm text-muted-foreground">Automated Processing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
