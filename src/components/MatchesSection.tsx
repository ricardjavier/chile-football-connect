import { motion } from "framer-motion";
import MatchCard from "@/components/MatchCard";
import MatchFilters from "@/components/MatchFilters";

const matches = [
  {
    title: "Pichanga domingo mañana",
    location: "Cancha El Pinar",
    city: "Santiago",
    date: "Dom 19 Ene",
    time: "10:00",
    playersNeeded: 4,
    totalPlayers: 14,
    level: "Intermedio" as const,
    isHighlighted: true,
  },
  {
    title: "Fútbol 7 después del trabajo",
    location: "Complejo El Tranque",
    city: "Valparaíso",
    date: "Mié 15 Ene",
    time: "19:30",
    playersNeeded: 3,
    totalPlayers: 14,
    level: "Principiante" as const,
  },
  {
    title: "Partido competitivo",
    location: "Estadio Municipal",
    city: "Concepción",
    date: "Sáb 18 Ene",
    time: "16:00",
    playersNeeded: 6,
    totalPlayers: 22,
    level: "Avanzado" as const,
  },
  {
    title: "Fútbol mixto familiar",
    location: "Parque O'Higgins",
    city: "Santiago",
    date: "Dom 19 Ene",
    time: "11:00",
    playersNeeded: 8,
    totalPlayers: 16,
    level: "Principiante" as const,
  },
  {
    title: "Liga amateur - Jornada 5",
    location: "Complejo Deportivo UC",
    city: "Santiago",
    date: "Sáb 18 Ene",
    time: "15:00",
    playersNeeded: 2,
    totalPlayers: 22,
    level: "Avanzado" as const,
    isHighlighted: true,
  },
  {
    title: "Pichanga nocturna",
    location: "Canchas La Reina",
    city: "Santiago",
    date: "Vie 17 Ene",
    time: "21:00",
    playersNeeded: 5,
    totalPlayers: 12,
    level: "Intermedio" as const,
  },
];

const MatchesSection = () => {
  return (
    <section id="partidos" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Partidos disponibles
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Encuentra el partido perfecto para ti en tu ciudad
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <MatchFilters />
            </div>
          </div>

          {/* Match cards grid */}
          <div className="lg:col-span-3">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {matches.map((match, index) => (
                <MatchCard key={index} {...match} />
              ))}
            </div>

            {/* Load more */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <button className="rounded-full border-2 border-primary px-8 py-3 font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground">
                Ver más partidos
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MatchesSection;
