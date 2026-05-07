import { motion } from "framer-motion";
import { Users, GraduationCap, ClipboardCheck, CreditCard, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Total Students", value: "1,247", change: "+12%", up: true, icon: GraduationCap },
  { label: "Teachers", value: "68", change: "+3", up: true, icon: Users },
  { label: "Attendance Today", value: "94.2%", change: "-0.8%", up: false, icon: ClipboardCheck },
  { label: "Revenue (MTD)", value: "K 485,200", change: "+18%", up: true, icon: CreditCard },
];

const recentActivity = [
  { action: "Payment received", detail: "Chipo Mwanza — Grade 7 — K2,500", time: "5 min ago" },
  { action: "Attendance marked", detail: "Grade 10A — 38/40 present", time: "12 min ago" },
  { action: "New student enrolled", detail: "Bwalya Mutale — Grade 4", time: "1 hr ago" },
  { action: "Exam results published", detail: "Mid-term — Grade 9", time: "2 hrs ago" },
  { action: "Fee reminder sent", detail: "42 parents notified", time: "3 hrs ago" },
];

const DashboardOverview = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${stat.up ? "text-success" : "text-destructive"}`}>
                    {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start justify-between border-b last:border-0 pb-3 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
