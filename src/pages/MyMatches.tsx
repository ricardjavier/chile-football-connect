// src/pages/MyMatches.tsx
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  TrendingUp, 
  Trash2, 
  UserX,
  Edit,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  field: Field | null;
}

interface MatchPlayer {
  id: string;
  user_id: string;
  profiles: Profile;
}

export default function MyMatches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [players, setPlayers] = useState<Record<string, MatchPlayer[]>>({});
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);

  const loadMatchPlayers = useCallback(async (matchId: string) => {
    try {
      const { data, error } = await supabase
        .from('match_players')
        .select(`
          id,
          user_id,
          profiles(id, full_name, level)
        `)
        .eq('match_id', matchId);

      if (error) throw error;

      setPlayers(prev => ({
        ...prev,
        [matchId]: data as any
      }));
    } catch (error) {
      console.error('Error loading players:', error);
    }
  }, []);

  const loadMyMatches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          field:fields(id, name, address, city)
        `)
        .eq('created_by', user?.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;

      setMatches(data as any);

      // Cargar jugadores para cada partido
      if (data && data.length > 0) {
        data.forEach(match => loadMatchPlayers(match.id));
      }
    } catch (error: any) {
      console.error('Error loading matches:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar tus partidos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadMatchPlayers, toast, user?.id]);

  useEffect(() => {
    if (user) {
      loadMyMatches();
    } else {
      navigate('/login');
    }
  }, [user, navigate, loadMyMatches]);

  const handleRemovePlayer = async (matchId: string, playerId: string, playerName: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('match_players')
        .delete()
        .eq('id', playerId);

      if (deleteError) throw deleteError;

      const match = matches.find(m => m.id === matchId);
      if (match) {
        const { error: updateError } = await supabase
          .from('matches')
          .update({ current_players: Math.max(0, match.current_players - 1) })
          .eq('id', matchId);

        if (updateError) throw updateError;
      }

      toast({
        title: 'Jugador eliminado',
        description: `${playerName} fue removido del partido`,
      });

      loadMyMatches();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMatch = async () => {
    if (!matchToDelete) return;

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchToDelete)
        .eq('created_by', user?.id);

      if (error) throw error;

      toast({
        title: 'Partido eliminado',
        description: 'El partido fue eliminado correctamente',
      });

      setMatches(matches.filter(m => m.id !== matchToDelete));
      setDeleteDialogOpen(false);
      setMatchToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCancelMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'cancelado' })
        .eq('id', matchId)
        .eq('created_by', user?.id);

      if (error) throw error;

      toast({
        title: 'Partido cancelado',
        description: 'El partido fue marcado como cancelado',
      });

      loadMyMatches();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      abierto: 'bg-green-100 text-green-800',
      completo: 'bg-blue-100 text-blue-800',
      cancelado: 'bg-red-100 text-red-800',
      finalizado: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.abierto;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Partidos</h1>
            <p className="text-gray-600 mt-2">Gestiona los partidos que has creado</p>
          </div>
          <Button onClick={() => navigate('/crear-partido')} size="lg">
            + Crear Partido
          </Button>
        </div>

        {matches.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No has creado ningún partido aún</p>
              <Button onClick={() => navigate('/crear-partido')}>
                Crear mi primer partido
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <Card key={match.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {match.field?.name || 'Cancha por definir'}
                        </CardTitle>
                        <Badge className={getStatusBadge(match.status)}>
                          {match.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {match.field?.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(match.date), "d 'de' MMMM", { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {match.time.slice(0, 5)}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {match.status === 'abierto' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelMatch(match.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setMatchToDelete(match.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>
                          {match.current_players}/{match.max_players} jugadores
                        </span>
                      </div>

                      {match.price_per_player && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold text-green-600">
                            ${match.price_per_player.toLocaleString()} por persona
                          </span>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-500 mb-1">Nivel</p>
                        <Badge variant="outline">{match.level_required}</Badge>
                      </div>

                      {match.description && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Descripción</p>
                          <p className="text-sm text-gray-700">{match.description}</p>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <h3 className="font-semibold mb-4 text-gray-900">
                        Jugadores Inscritos ({players[match.id]?.length || 0})
                      </h3>
                      {players[match.id] && players[match.id].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {players[match.id].map((player) => (
                            <div
                              key={player.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>
                                    {player.profiles.full_name?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">
                                    {player.profiles.full_name || 'Usuario'}
                                  </p>
                                  {player.profiles.level && (
                                    <p className="text-xs text-gray-500">
                                      {player.profiles.level}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {match.status === 'abierto' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemovePlayer(
                                      match.id,
                                      player.id,
                                      player.profiles.full_name || 'Usuario'
                                    )
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                          Aún no hay jugadores inscritos en este partido
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El partido será eliminado permanentemente
              y todos los jugadores inscritos serán removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMatch}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar Partido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}