import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-school.jpg";

const benefits = [
  "All-in-one school management",
  "Pay only for what you use",
  "Setup in under 10 minutes",
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-hero" aria-label="School management software hero">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="African school campus"
          width={1920}
          height={1080}
          className="h-full w-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent" />
      </div>

      <div className="container relative z-10 flex min-h-[80vh] items-center">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-5xl leading-tight">
              Run Your School Smarter with{" "}
              <span className="text-primary">School Pulse</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground/90 max-w-xl">
              The complete school management platform for African institutions. 
              Streamline attendance, grades, fees, and communication in one place.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button 
                variant="accent" 
                size="lg" 
                onClick={() => navigate("/login")}
                className="text-base"
              >
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground/60">
              No credit card required. Free for up to 50 students.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="rounded-xl overflow-hidden shadow-2xl border border-primary-foreground/10">
              <img
                src={heroImage}
                alt="School Pulse dashboard showing student management interface"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
              Trusted by 500+ schools
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
