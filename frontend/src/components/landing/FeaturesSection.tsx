import { motion } from "framer-motion";
import { BookOpen, Users, CreditCard, Bell, ClipboardCheck, BarChart3, Shield, Palette } from "lucide-react";

const features = [
  { icon: ClipboardCheck, title: "Attendance", description: "Digital attendance with parent notifications and analytics" },
  { icon: BookOpen, title: "Exams & Grading", description: "Result entry, auto-grading, and report card generation" },
  { icon: CreditCard, title: "Finance", description: "Fee structures, payments, arrears tracking, and billing" },
  { icon: Users, title: "User Management", description: "Teachers, students, parents, and bursars with role-based access" },
  { icon: Bell, title: "Communication", description: "SMS and email notifications for parents and staff" },
  { icon: BarChart3, title: "Analytics", description: "Real-time dashboards and performance insights" },
  { icon: Shield, title: "Data Security", description: "Tenant isolation with row-level security policies" },
  { icon: Palette, title: "Custom Branding", description: "Logo, colors, and themes per school" },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Modular Features</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Pick Only What You Need
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Every school is different. Select the modules that fit your needs and pay only for what you use.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl border bg-card p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
