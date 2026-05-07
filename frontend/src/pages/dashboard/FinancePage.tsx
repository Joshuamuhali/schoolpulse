import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const FinancePage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="font-display text-2xl font-bold">Finance</h1>
      <p className="text-muted-foreground">Fee management, payments, and billing</p>
    </div>
    <Card className="shadow-card">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CreditCard className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold">Coming in Phase 2</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Fee structures, payment tracking, arrears management, and the billing engine will be available soon.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default FinancePage;
