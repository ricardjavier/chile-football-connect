import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const cities = [
  "Todas",
  "Santiago",
  "Valparaíso",
  "Concepción",
  "La Serena",
  "Temuco",
  "Antofagasta",
  "Viña del Mar",
];

const timeSlots = ["Cualquier hora", "Mañana", "Tarde", "Noche"];

const levels = ["Todos", "Principiante", "Intermedio", "Avanzado"];

interface FiltersProps {
  onFilterChange?: (filters: { city: string; time: string; level: string }) => void;
}

const MatchFilters = ({ onFilterChange }: FiltersProps) => {
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [selectedTime, setSelectedTime] = useState("Cualquier hora");
  const [selectedLevel, setSelectedLevel] = useState("Todos");
  const [showAllCities, setShowAllCities] = useState(false);

  const displayedCities = showAllCities ? cities : cities.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl bg-card p-6 shadow-soft"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <Filter className="h-5 w-5 text-primary" />
          Filtrar partidos
        </h3>
      </div>

      {/* Cities */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MapPin className="h-4 w-4" />
          Ubicación
        </div>
        <div className="flex flex-wrap gap-2">
          {displayedCities.map((city) => (
            <Button
              key={city}
              variant="pill"
              size="sm"
              onClick={() => setSelectedCity(city)}
              className={
                selectedCity === city
                  ? "bg-primary text-primary-foreground"
                  : ""
              }
            >
              {city}
            </Button>
          ))}
          {!showAllCities && cities.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllCities(true)}
              className="text-primary"
            >
              +{cities.length - 5} más
            </Button>
          )}
        </div>
      </div>

      {/* Time */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          Horario
        </div>
        <div className="flex flex-wrap gap-2">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant="pill"
              size="sm"
              onClick={() => setSelectedTime(time)}
              className={
                selectedTime === time
                  ? "bg-primary text-primary-foreground"
                  : ""
              }
            >
              {time}
            </Button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <div className="mb-3 text-sm font-medium text-muted-foreground">
          Nivel
        </div>
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => (
            <Button
              key={level}
              variant="pill"
              size="sm"
              onClick={() => setSelectedLevel(level)}
              className={
                selectedLevel === level
                  ? "bg-primary text-primary-foreground"
                  : ""
              }
            >
              {level}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MatchFilters;
