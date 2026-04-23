// src/components/MatchesSection.tsx
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Match, Field } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import MatchFilters from "./MatchFilters.tsx";

interface MatchWithField extends Match {
  field: Field | null;
}

const MatchesSection = () => {
  const [matches, setMatches] = useState<MatchWithField[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchWithField[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: 'Todas', time: 'all', level: 'all' });

  const isUpcomingMatch = (date: string, time: string) => {
    const scheduledAt = new Date(`${date}T${time}`);
    return Number.isNaN(scheduledAt.getTime()) ? false : scheduledAt >= new Date();
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { data } = await supabase
        .from('matches')
        .select(`
          *,
          field:field_id(*)
        `)
        .eq('status', 'abierto')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(20);

      if (data) {
        const rawMatches = data as MatchWithField[];
        const upcomingMatches = rawMatches.filter((match) => isUpcomingMatch(match.date, match.time));
        const matchIds = upcomingMatches.map((match) => match.id);

        let playerRows: { match_id: string }[] = [];
        if (matchIds.length > 0) {
          const { data: playersData } = await supabase
            .from('match_players')
            .select('match_id')
            .in('match_id', matchIds);
          playerRows = (playersData as { match_id: string }[]) || [];
        }

        const playersByMatch = playerRows.reduce<Record<string, number>>((acc, row) => {
          acc[row.match_id] = (acc[row.match_id] || 0) + 1;
          return acc;
        }, {});

        const matchesWithLiveCounter = upcomingMatches.map((match) => ({
          ...match,
          current_players: playersByMatch[match.id] ?? match.current_players,
        }));

        setMatches(matchesWithLiveCounter);
        setFilteredMatches(matchesWithLiveCounter);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...matches];

    // Filtrar por ciudad
    if (filters.city !== 'Todas') {
      filtered = filtered.filter(m => m.field?.city === filters.city);
    }


    // Filtrar por nivel
    if (filters.level !== 'all') {
      filtered = filtered.filter(m => m.level_required === filters.level);
    }

    // Filtrar por horario
    if (filters.time !== 'all') {
      filtered = filtered.filter(m => {
        const hour = parseInt(m.time.split(':')[0]);
        if (filters.time === 'morning') return hour >= 6 && hour < 12;
        if (filters.time === 'afternoon') return hour >= 12 && hour < 18;
        if (filters.time === 'evening') return hour >= 18 && hour < 23;
        return true;
      });
    }

    setFilteredMatches(filtered);
  }, [filters, matches]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getLevelColor = (level: string) => {
    const colors = {
      todos: 'bg-gray-100 text-gray-800',
      principiante: 'bg-emerald-100 text-emerald-700',
      intermedio: 'bg-amber-100 text-amber-700',
      avanzado: 'bg-rose-100 text-rose-700',
    };
    return colors[level as keyof typeof colors] || colors.todos;
  };

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
              <MatchFilters onFilterChange={setFilters} />
            </div>
          </div>

          {/* Match cards grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {matches.length === 0 
                    ? "No hay partidos disponibles aún" 
                    : "No hay partidos con estos filtros"}
                </p>
                {matches.length === 0 && (
                  <Link to="/crear-partido">
                    <Button>Crear el primer partido</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
                {filteredMatches.slice(0, 6).map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg line-clamp-1">
                        {match.field?.name || 'Cancha Municipal'}
                      </CardTitle>
                      <Badge className={getLevelColor(match.level_required)}>
                        {match.level_required}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{match.field?.address}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(match.date), "d 'de' MMM", { locale: es })}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{match.time.slice(0, 5)} hrs</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {match.current_players}/{match.max_players} jugadores
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Link to={`/partidos/${match.id}`} className="w-full">
                      <Button variant="default" className="w-full">
                        Ver Detalles
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ver más */}
        {filteredMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link to="/partidos">
              <Button variant="outline" size="lg" className="rounded-full">
                Ver todos los partidos
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default MatchesSection;