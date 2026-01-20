// src/components/HeroSection.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-football.jpg";

const HeroSection = () => {
  const stats = [
    { icon: Users, value: "2,500+", label: "Jugadores activos" },
    { icon: Trophy, value: "500+", label: "Partidos semanales" },
    { icon: MapPin, value: "15", label: "Ciudades" },
  ];

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Fútbol en Chile"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 backdrop-blur-sm"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            <span className="text-sm font-medium text-primary-foreground/90">
              La comunidad de fútbol más grande de Chile
            </span>
          </motion.div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Encuentra tu{" "}
            <span className="relative">
              <span className="text-gradient-accent">partido</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -bottom-2 left-0 h-1 w-full origin-left bg-gradient-accent"
              />
            </span>{" "}
            perfecto
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 text-lg text-primary-foreground/80 sm:text-xl"
          >
            Conecta con jugadores cerca de ti, únete a partidos o crea el tuyo.
            Desde Santiago hasta Punta Arenas, el fútbol nos une.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Link to="/partidos">
              <Button variant="hero" size="xl" className="group">
                <Calendar className="h-5 w-5" />
                Ver partidos disponibles
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/crear-partido">
              <Button variant="heroOutline" size="xl">
                Crear partido
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 grid max-w-xl grid-cols-3 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
              className="text-center"
            >
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-accent" />
              <div className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">
                {stat.value}
              </div>
              <div className="text-sm text-primary-foreground/60">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;