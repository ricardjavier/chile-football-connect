import { motion } from "framer-motion";
import { Search, Calendar, Users, Trophy } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Busca partidos",
    description: "Encuentra partidos cerca de ti filtrando por ubicación, horario y nivel de juego.",
  },
  {
    icon: Calendar,
    title: "Únete o crea",
    description: "Únete a un partido existente o crea uno nuevo e invita a otros jugadores.",
  },
  {
    icon: Users,
    title: "Forma tu equipo",
    description: "Conoce nuevos jugadores, forma equipos y construye tu red de contactos.",
  },
  {
    icon: Trophy,
    title: "¡A jugar!",
    description: "Disfruta del partido, mejora tu nivel y repite. El fútbol te espera.",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="bg-secondary/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            ¿Cómo funciona?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            En solo 4 pasos estarás jugando con nuevos compañeros
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-border lg:block" />
              )}

              <div className="relative flex flex-col items-center text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-hero shadow-card"
                >
                  <step.icon className="h-10 w-10 text-primary-foreground" />
                </motion.div>
                <div className="absolute -top-2 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-accent-foreground">
                  {index + 1}
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
