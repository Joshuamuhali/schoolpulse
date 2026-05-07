import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const ExamsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="font-display text-2xl font-bold">Exams</h1>
      <p className="text-muted-foreground">Manage examinations and results</p>
    </div>
    <Card className="shadow-card">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold">Coming in Phase 2</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Exam management with result entry, auto-grading, and report card generation will be available soon.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default ExamsPage;
