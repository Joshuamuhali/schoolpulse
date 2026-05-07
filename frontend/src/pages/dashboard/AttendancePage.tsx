import { useState, useEffect } from "react";
import { Check, X, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pupilsApi, classesApi, attendanceApi, type Pupil, type Class } from "@/api";
import { useErrorHandler } from "@/lib/api/error-handler";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FeatureGate } from "@/components/feature/FeatureGate";

// Map Pupil to Student interface for component
interface Student {
  id: string;
  name: string;
  class_id: string;
  classes?: { name: string };
}

const formatPupilName = (pupil: Pupil): string => {
  return `${pupil.first_name} ${pupil.last_name}`;
};

type Status = "present" | "absent" | "late" | null;

const AttendancePage = () => {
  const [attendance, setAttendance] = useState<Record<string, Status>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleError } = useErrorHandler();
  
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [pupilsResult, classesResult] = await Promise.all([
        pupilsApi.getPupils(),
        classesApi.getClasses()
      ]);
      
      if (pupilsResult.success && pupilsResult.data) {
        // Transform Pupil[] to Student[]
        const studentData: Student[] = pupilsResult.data.map(pupil => ({
          id: pupil.id,
          name: formatPupilName(pupil),
          class_id: pupil.class_id,
          classes: pupil.classes,
        }));
        setStudents(studentData);
      }
      
      if (classesResult.success && classesResult.data) {
        const classData = classesResult.data;
        setClasses(classData);
        if (classData.length > 0) {
          setSelectedClass(classData[0].id);
        }
      }
      
      if (pupilsResult.error) handleError(pupilsResult.error);
      if (classesResult.error) handleError(classesResult.error);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const setStatus = (id: string, status: Status) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const filteredStudents = selectedClass 
    ? students.filter(s => s.class_id === selectedClass)
    : students;

  const submitAttendance = async () => {
    try {
      setIsSubmitting(true);
      
      const attendanceRecords = Object.entries(attendance)
        .filter(([_, status]) => status !== null)
        .map(([studentId, status]) => ({
          student_id: studentId,
          class_id: selectedClass,
          date: todayStr,
          status: status!,
        }));
      
      if (attendanceRecords.length === 0) {
        toast.error('Please mark attendance for at least one student');
        return;
      }
      
      // Submit each attendance record
      const promises = attendanceRecords.map(record => attendanceApi.markAttendance(record));
      const results = await Promise.all(promises);
      
      const failed = results.filter(r => !r.success);
      if (failed.length === 0) {
        toast.success(`Attendance submitted for ${attendanceRecords.length} students`);
        setAttendance({});
      } else {
        toast.error(`Failed to submit attendance for ${failed.length} students`);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
  const lateCount = Object.values(attendance).filter((s) => s === "late").length;

  return (
    <FeatureGate 
      feature="attendance"
      fallback={
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground">Attendance Module Not Available</h3>
            <p className="text-sm text-muted-foreground">This feature is not enabled for your school or you don't have permission to access it.</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{presentCount}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{absentCount}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lateCount}</p>
              <p className="text-xs text-muted-foreground">Late</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-lg">Mark Attendance</CardTitle>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {selectedClass ? 'No students in this class' : 'Please select a class'}
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="font-medium text-sm">{student.name}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={attendance[student.id] === "present" ? "default" : "outline"}
                          className={attendance[student.id] === "present" ? "bg-success hover:bg-success/90 text-success-foreground" : ""}
                          onClick={() => setStatus(student.id, "present")}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[student.id] === "late" ? "default" : "outline"}
                          className={attendance[student.id] === "late" ? "bg-warning hover:bg-warning/90 text-warning-foreground" : ""}
                          onClick={() => setStatus(student.id, "late")}
                        >
                          <Clock className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[student.id] === "absent" ? "default" : "outline"}
                          className={attendance[student.id] === "absent" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}
                          onClick={() => setStatus(student.id, "absent")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button 
                variant="hero" 
                size="lg" 
                className="mt-6 w-full"
                onClick={submitAttendance}
                disabled={isSubmitting || filteredStudents.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Attendance'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </FeatureGate>
  );
};

export default AttendancePage;
