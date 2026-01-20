// src/pages/CreateMatch.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Field, MatchLevelRequired } from '@/types/database';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function CreateMatch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    field_id: '',
    date: '',
    time: '',
    duration_minutes: 90,
    max_players: 14,
    price_per_player: '',
    level_required: 'todos' as MatchLevelRequired,
    description: '',
  });

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    const { data } = await supabase.from('fields').select('*').order('name');
    if (data) setFields(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('matches').insert([
        {
          created_by: user?.id,
          field_id: formData.field_id || null,
          date: formData.date,
          time: formData.time,
          duration_minutes: formData.duration_minutes,
          max_players: formData.max_players,
          price_per_player: formData.price_per_player ? parseFloat(formData.price_per_player) : null,
          level_required: formData.level_required,
          description: formData.description || null,
          current_players: 1, // El creador se une automáticamente
        },
      ]);

      if (error) throw error;

      toast({
        title: '¡Partido creado!',
        description: 'Tu partido ha sido publicado exitosamente',
      });

      navigate('/partidos');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fecha mínima: hoy
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Crear Nuevo Partido</CardTitle>
            <CardDescription>Completa los detalles y encuentra jugadores</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cancha */}
              <div>
                <Label htmlFor="field">Cancha</Label>
                <Select
                  value={formData.field_id}
                  onValueChange={(value) => setFormData({ ...formData, field_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cancha" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.name} - {field.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    min={today}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              {/* Duración y Jugadores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={30}
                    max={180}
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="maxPlayers">Máx. Jugadores</Label>
                  <Input
                    id="maxPlayers"
                    type="number"
                    min={6}
                    max={22}
                    required
                    value={formData.max_players}
                    onChange={(e) =>
                      setFormData({ ...formData, max_players: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Nivel y Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Nivel Requerido</Label>
                  <Select
                    value={formData.level_required}
                    onValueChange={(value: MatchLevelRequired) =>
                      setFormData({ ...formData, level_required: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los niveles</SelectItem>
                      <SelectItem value="principiante">Principiante</SelectItem>
                      <SelectItem value="intermedio">Intermedio</SelectItem>
                      <SelectItem value="avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Precio por Jugador ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    placeholder="Opcional"
                    value={formData.price_per_player}
                    onChange={(e) =>
                      setFormData({ ...formData, price_per_player: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Ej: Buscamos defensa central y mediocampista..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Partido'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/partidos')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}