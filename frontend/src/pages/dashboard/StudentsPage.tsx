import { useState, useEffect } from "react";
import { Search, Plus, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pupilsApi, type Pupil } from "@/api";
import { useErrorHandler } from "@/lib/api/error-handler";
import { Skeleton } from "@/components/ui/skeleton";
import { FeatureGate } from "@/components/feature/FeatureGate";

// Map Pupil API type to component's Student interface
type Student = Pupil & { name: string };

const formatPupilName = (pupil: Pupil): string => {
  return `${pupil.first_name} ${pupil.last_name}`;
};

const StudentsPage = () => {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const result = await pupilsApi.getPupils();
      
      if (result.success && result.data) {
        // Transform Pupil[] to Student[] with name property
        const studentsWithName: Student[] = result.data.map(pupil => ({
          ...pupil,
          name: formatPupilName(pupil),
        }));
        setStudents(studentsWithName);
      } else if (result.error) {
        handleError(result.error);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <FeatureGate 
      feature="students"
      fallback={
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground">Students Module Not Available</h3>
            <p className="text-sm text-muted-foreground">This feature is not enabled for your school or you don't have permission to access it.</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Students</h1>
            <p className="text-muted-foreground">Manage enrolled students</p>
          </div>
          <Button variant="hero" size="lg">
            <Plus className="h-4 w-4" /> Add Student
          </Button>
        </div>

      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="default">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Name</th>
                    <th className="pb-3 font-medium text-muted-foreground">Class</th>
                    <th className="pb-3 font-medium text-muted-foreground">Gender</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        {search ? 'No students found matching your search' : 'No students enrolled yet'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 font-medium">{s.name}</td>
                        <td className="py-3 text-muted-foreground">{s.classes?.name || 'N/A'}</td>
                        <td className="py-3 text-muted-foreground">{s.gender === 'M' ? 'Male' : 'Female'}</td>
                        <td className="py-3">
                          <Badge variant={s.status === "active" ? "default" : "secondary"}>
                            {s.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">K {s.balance.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </FeatureGate>
  );
};

export default StudentsPage;
