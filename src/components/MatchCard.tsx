import { motion } from "framer-motion";
import { MapPin, Clock, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchCardProps {
  title: string;
  location: string;
  city: string;
  date: string;
  time: string;
  playersNeeded: number;
  totalPlayers: number;
  level: "Principiante" | "Intermedio" | "Avanzado";
  isHighlighted?: boolean;
}

const levelColors = {
  Principiante: "bg-emerald-100 text-emerald-700",
  Intermedio: "bg-amber-100 text-amber-700",
  Avanzado: "bg-rose-100 text-rose-700",
};

const MatchCard = ({
  title,
  location,
  city,
  date,
  time,
  playersNeeded,
  totalPlayers,
  level,
  isHighlighted = false,
}: MatchCardProps) => {
  const spotsLeft = totalPlayers - (totalPlayers - playersNeeded);
  const progressPercent = ((totalPlayers - playersNeeded) / totalPlayers) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl bg-card p-6 shadow-card transition-shadow hover:shadow-elevated ${
        isHighlighted ? "ring-2 ring-accent" : ""
      }`}
    >
      {isHighlighted && (
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-gradient-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Popular
          </span>
        </div>
      )}

      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
          <div className="mt-1 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{location}, {city}</span>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${levelColors[level]}`}>
          {level}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{date} • {time}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-foreground">
            <Users className="h-4 w-4" />
            <span className="font-medium">{playersNeeded} lugares disponibles</span>
          </div>
          <span className="text-muted-foreground">{totalPlayers - playersNeeded}/{totalPlayers}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${progressPercent}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full bg-gradient-accent"
          />
        </div>
      </div>

      <Button variant="default" className="w-full group">
        Unirse al partido
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </motion.div>
  );
};

export default MatchCard;
