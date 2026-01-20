// src/components/MatchFilters.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const cities = [
  "Todas",
  "Santiago",
  "La Florida",
  "La Pintana",
  "Maipú",
  "Departamental",
  "Ñuñoa",
  "Macul",
  "Las Condes",
  "Vitacura",
  "Providencia",
  "Independencia",
  "Recoleta",
  "Quinta Normal",
  "Cerrillos",
  "Lo Espejo",
];

const timeSlots = [
  { label: "Cualquier hora", value: "all" },
  { label: "Mañana (06:00-12:00)", value: "morning" },
  { label: "Tarde (12:00-18:00)", value: "afternoon" },
  { label: "Noche (18:00-23:00)", value: "evening" },
];

const levels = [
  { label: "Todos", value: "all" },
  { label: "Todos los niveles", value: "todos" },
  { label: "Principiante", value: "principiante" },
  { label: "Intermedio", value: "intermedio" },
  { label: "Avanzado", value: "avanzado" },

  


];

interface FiltersProps {
  onFilterChange?: (filters: { city: string; time: string; level: string; }) => void;
}

const MatchFilters = ({ onFilterChange }: FiltersProps) => {
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [selectedTime, setSelectedTime] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const [showAllCities, setShowAllCities] = useState(false);

  const displayedCities = showAllCities ? cities : cities.slice(0, 5);

  // Notificar cambios al padre
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        city: selectedCity,
        time: selectedTime,
        level: selectedLevel,
        
      });
    }
  }, [selectedCity, selectedTime, selectedLevel, onFilterChange]);

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
          {timeSlots.map((slot) => (
            <Button
              key={slot.value}
              variant="pill"
              size="sm"
              onClick={() => setSelectedTime(slot.value)}
              className={
                selectedTime === slot.value
                  ? "bg-primary text-primary-foreground"
                  : ""
              }
            >
              {slot.label}
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
              key={level.value}
              variant="pill"
              size="sm"
              onClick={() => setSelectedLevel(level.value)}
              className={
                selectedLevel === level.value
                  ? "bg-primary text-primary-foreground"
                  : ""
              }
            >
              {level.label}
            </Button>
          ))}
        </div>
      </div>



    </motion.div>
  );
};

export default MatchFilters;