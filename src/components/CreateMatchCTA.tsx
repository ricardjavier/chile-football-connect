// src/components/CreateMatchCTA.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus, Users, MapPin, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const CreateMatchCTA = () => {
  const features = [
    { icon: MapPin, text: "Elige tu cancha favorita" },
    { icon: Clock, text: "Define fecha y hora" },
    { icon: Users, text: "Invita a jugadores" },
    { icon: Trophy, text: "Organiza torneos" },
  ];

  return (
    <section className="overflow-hidden bg-gradient-hero py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
              ¿No encuentras el partido ideal?
            </h2>
            <p className="mt-6 text-lg text-primary-foreground/80">
              Crea tu propio partido, define las reglas y encuentra a los jugadores perfectos para tu estilo de juego.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-primary-foreground/90"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-10"
            >
              <Link to="/crear-partido">
                <Button
                  variant="hero"
                  size="xl"
                  className="group bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  <Plus className="h-5 w-5" />
                  Crear mi partido
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative hidden lg:block"
          >
            {/* Decorative cards */}
            <div className="relative">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -right-4 -top-4 rounded-2xl bg-primary-foreground/10 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-accent" />
                  <div>
                    <div className="font-semibold text-primary-foreground">+3 jugadores</div>
                    <div className="text-sm text-primary-foreground/60">se unieron hoy</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 rounded-2xl bg-primary-foreground/10 p-6 backdrop-blur-sm"
              >
                <div className="text-center">
                  <div className="font-display text-4xl font-bold text-primary-foreground">12</div>
                  <div className="text-sm text-primary-foreground/60">partidos esta semana</div>
                </div>
              </motion.div>

              <div className="aspect-square rounded-3xl bg-primary-foreground/5 p-8">
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary-foreground/30 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/20">
                    <Plus className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <p className="font-display text-xl font-bold text-primary-foreground">Tu partido aquí</p>
                  <p className="mt-2 text-primary-foreground/60">Solo toma 2 minutos</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CreateMatchCTA;