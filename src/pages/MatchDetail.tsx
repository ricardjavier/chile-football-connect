// src/pages/MatchDetail.tsx - VERSIÓN FINAL CORREGIDA
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, Users, TrendingUp, UserPlus, UserMinus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

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
}

interface MatchWithDetails extends Match {
  field: Field | null;
  creator: Profile | null;
}

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [match, setMatch] = useState<MatchWithDetails | null>(null);
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    console.log('🎯 MatchDetail montado con ID:', id);
    console.log('👤 Usuario:', user);
    
    if (id) {
      loadMatch();
      loadPlayers();
    }
  }, [id, user]);

  const loadMatch = async () => {
    try {
      console.log('🔍 Cargando partido con ID:', id);
      
      // Consulta simplificada
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          field:fields(*),
          creator:profiles(*)
        `)
        .eq('id', id)
        .single();

      console.log('📊 Datos del partido:', data);
      console.log('❌ Error (si hay):', error);

      if (error) {
        console.error('Error completo:', error);
        throw error;
      }
      
      setMatch(data as any);
    } catch (error: any) {
      console.error('💥 Error loading match:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cargar el partido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPlayers = async () => {
    try {
      console.log('👥 Cargando jugadores del partido:', id);
      
      const { data, error } = await supabase
        .from('match_players')
        .select(`
          user_id,
          profiles(*)
        `)
        .eq('match_id', id);

      console.log('📊 Jugadores:', data);
      console.log('❌ Error (si hay):', error);

      if (error) {
        console.error('Error completo:', error);
        throw error;
      }

      const playersList = data.map((item: any) => item.profiles).filter(Boolean);
      setPlayers(playersList);

      // Verificar si el usuario actual ya está unido
      if (user) {
        setIsJoined(data.some((item: any) => item.user_id === user.id));
      }
    } catch (error: any) {
      console.error('💥 Error loading players:', error);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      toast({
        title: 'Debes iniciar sesión',
        description: 'Inicia sesión para unirte al partido',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setActionLoading(true);

    try {
      // Insertar en match_players
      const { error: joinError } = await supabase
        .from('match_players')
        .insert([{ match_id: id, user_id: user.id }]);

      if (joinError) throw joinError;

      // Actualizar contador de jugadores
      const { error: updateError } = await supabase
        .from('matches')
        .update({ current_players: (match?.current_players || 0) + 1 })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: '¡Te uniste al partido!',
        description: 'Nos vemos en la cancha',
      });

      loadMatch();
      loadPlayers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);

    try {
      // Eliminar de match_players
      const { error: leaveError } = await supabase
        .from('match_players')
        .delete()
        .eq('match_id', id)
        .eq('user_id', user?.id);

      if (leaveError) throw leaveError;

      // Actualizar contador
      const { error: updateError } = await supabase
        .from('matches')
        .update({ current_players: Math.max(0, (match?.current_players || 1) - 1) })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Saliste del partido',
        description: 'Puedes volver a unirte cuando quieras',
      });

      loadMatch();
      loadPlayers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
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

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 mb-4">Partido no encontrado</p>
          <p className="text-sm text-gray-400 mb-6">
            Es posible que el partido haya sido eliminado o que haya un error en la configuración de la base de datos
          </p>
          <Button onClick={() => navigate('/partidos')}>
            Volver a partidos
          </Button>
        </div>
      </div>
    );
  }

  const isFull = match.current_players >= match.max_players;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate('/partidos')} className="mb-4">
          ← Volver a partidos
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del partido */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{match.field?.name || 'Cancha por definir'}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-2">
                    <MapPin className="h-4 w-4" />
                    {match.field?.address || 'Dirección no disponible'}
                  </CardDescription>
                </div>
                <Badge className={isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {isFull ? 'Completo' : 'Abierto'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">
                      {format(new Date(match.date), "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Hora</p>
                    <p className="font-medium">{match.time.slice(0, 5)} hrs</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Jugadores</p>
                    <p className="font-medium">
                      {match.current_players}/{match.max_players}
                    </p>
                  </div>
                </div>

                {match.price_per_player && (
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Precio</p>
                      <p className="font-medium text-green-600">
                        ${match.price_per_player.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Nivel requerido</p>
                <Badge>{match.level_required}</Badge>
              </div>

              {match.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Descripción</p>
                  <p className="text-gray-700">{match.description}</p>
                </div>
              )}

              <div className="pt-4">
                {isJoined ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLeave}
                    disabled={actionLoading}
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Saliendo...' : 'Salir del Partido'}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleJoin}
                    disabled={actionLoading || isFull}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Uniéndote...' : isFull ? 'Partido Completo' : 'Unirme al Partido'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lista de jugadores */}
          <Card>
            <CardHeader>
              <CardTitle>Jugadores ({players.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {players.length > 0 ? (
                <div className="space-y-3">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {player.full_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{player.full_name || 'Usuario'}</p>
                        {player.level && (
                          <p className="text-xs text-gray-500">{player.level}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aún no hay jugadores inscritos
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}