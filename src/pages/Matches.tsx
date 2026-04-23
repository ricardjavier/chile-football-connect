// src/pages/Matches.tsx - VERSIÓN FINAL CORREGIDA
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Field {
  id: string;
  name: string;
  address: string;
  city?: string;
}

interface Profile {
  id: string;
  full_name?: string;
  level?: string;
}

interface Match {
  id: string;
  date: string;
  time: string;
  max_players: number;
  current_players: number;
  price_per_player?: number;
  level_required: string;
  description?: string;
  status: string;
  field_id?: string;
  created_by?: string;
}

interface MatchWithDetails extends Match {
  field: Field | null;
  creator: Profile | null;
}

export default function Matches() {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isUpcomingMatch = (date: string, time: string) => {
    const scheduledAt = new Date(`${date}T${time}`);
    return Number.isNaN(scheduledAt.getTime()) ? false : scheduledAt >= new Date();
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      console.log('🔍 Buscando partidos...');
      
      // Consulta simplificada con nombres explícitos de foreign keys
      const { data, error: fetchError } = await supabase
        .from('matches')
        .select(`
          *,
          field:fields(id, name, address, city),
          creator:profiles(id, full_name, level)
        `)
        .eq('status', 'abierto')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      console.log('📊 Partidos encontrados:', data);
      console.log('❌ Error (si hay):', fetchError);

      if (fetchError) {
        setError(fetchError.message);
        console.error('Error completo:', fetchError);
        throw fetchError;
      }

      const rawMatches = (data as MatchWithDetails[]) ?? [];
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

    } catch (error: any) {
      console.error('💥 Error loading matches:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      todos: 'bg-gray-100 text-gray-800',
      principiante: 'bg-green-100 text-green-800',
      intermedio: 'bg-yellow-100 text-yellow-800',
      avanzado: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || colors.todos;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partidos Disponibles</h1>
            <p className="text-gray-600 mt-2">Encuentra un partido y únete a la cancha</p>
          </div>
          <Link to="/crear-partido">
            <Button size="lg">
              + Crear Partido
            </Button>
          </Link>
        </div>

        {/* Mostrar error si hay */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 font-semibold mb-2">Error al cargar partidos:</p>
              <p className="text-red-700 text-sm">{error}</p>
              <p className="text-xs text-red-500 mt-3">
                Posibles causas:
              </p>
              <ul className="text-xs text-red-600 mt-1 ml-4 list-disc">
                <li>Las tablas no están configuradas correctamente en Supabase</li>
                <li>Faltan las foreign keys entre tablas</li>
                <li>Las políticas RLS no permiten leer los datos</li>
              </ul>
              <p className="text-sm text-red-600 mt-3">
                Ejecuta el script SQL que te proporcioné en Supabase
              </p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : matches.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 mb-4">No hay partidos disponibles por el momento</p>
              <Link to="/crear-partido">
                <Button>Crear el primer partido</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {match.field?.name || 'Cancha por definir'}
                    </CardTitle>
                    <Badge className={getLevelBadge(match.level_required)}>
                      {match.level_required}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-2">
                    <MapPin className="h-4 w-4" />
                    {match.field?.address || 'Dirección no disponible'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {format(new Date(match.date), "EEEE d 'de' MMMM", { locale: es })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{match.time.slice(0, 5)} hrs</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>
                      {match.current_players}/{match.max_players} jugadores
                    </span>
                  </div>

                  {match.price_per_player && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>${match.price_per_player.toLocaleString()} por persona</span>
                    </div>
                  )}

                  {match.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {match.description}
                    </p>
                  )}
                </CardContent>

                <CardFooter>
                  <Link to={`/partidos/${match.id}`} className="w-full">
                    <Button className="w-full">
                      Ver Detalles
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Info de debug */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              <strong>Debug Info:</strong> {matches.length} partidos cargados
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Abre la consola del navegador (F12) para ver más detalles
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}