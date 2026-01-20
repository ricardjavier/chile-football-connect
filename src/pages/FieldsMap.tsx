// src/pages/FieldsMap.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';

// Fix para los iconos de Leaflet en Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Icono personalizado para la ubicación del usuario
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Field {
  id: string;
  name: string;
  address: string;
  city: string | null;
  latitude: number;
  longitude: number;
}

interface FieldWithDistance extends Field {
  distance?: number;
}

export default function FieldsMap() {
  const { toast } = useToast();
  const [fields, setFields] = useState<FieldWithDistance[]>([]);
  const [filteredFields, setFilteredFields] = useState<FieldWithDistance[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxDistance, setMaxDistance] = useState<number>(10); // km
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0); // Para forzar re-render del mapa

  // Centro por defecto: Santiago centro
  const defaultCenter: [number, number] = [-33.4489, -70.6693];

  useEffect(() => {
    loadFields();
    getUserLocation();
  }, []);

  useEffect(() => {
    filterFields();
  }, [searchTerm, maxDistance, fields, userLocation]);

  useEffect(() => {
    // Re-renderizar mapa cuando cambie la ubicación del usuario
    if (userLocation) {
      setMapKey(prev => prev + 1);
    }
  }, [userLocation]);

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          setUserLocation(location);
          toast({
            title: 'Ubicación detectada',
            description: 'Mostrando canchas cercanas a ti',
          });
        },
        (error) => {
          console.log('Error getting location:', error);
          toast({
            title: 'No se pudo obtener tu ubicación',
            description: 'Mostrando todas las canchas en Santiago',
            variant: 'destructive',
          });
        }
      );
    }
  };

  const loadFields = async () => {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('name');

      if (error) throw error;

      setFields(data as Field[]);
    } catch (error: any) {
      console.error('Error loading fields:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las canchas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterFields = () => {
    let filtered = [...fields];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(field =>
        field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Calcular distancia y filtrar por cercanía
    if (userLocation) {
      filtered = filtered.map(field => ({
        ...field,
        distance: calculateDistance(
          userLocation[0],
          userLocation[1],
          field.latitude,
          field.longitude
        )
      }));

      // Filtrar por distancia máxima
      filtered = filtered.filter(field => (field.distance || 0) <= maxDistance);

      // Ordenar por cercanía
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredFields(filtered);
  };

  const mapCenter = userLocation || defaultCenter;

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mapa de Canchas</h1>
          <p className="text-gray-600 mt-2">Encuentra canchas cercanas a tu ubicación</p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, dirección o ciudad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">km de distancia máxima</span>
                </div>
              </div>
            </div>
            {userLocation && (
              <p className="text-xs text-green-600 mt-3">
                ✓ Tu ubicación detectada - Mostrando canchas cercanas
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de canchas */}
          <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 sticky top-0 bg-gray-50 py-2 z-10">
              Canchas Encontradas ({filteredFields.length})
            </h2>
            {filteredFields.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  No se encontraron canchas con los filtros aplicados
                </CardContent>
              </Card>
            ) : (
              filteredFields.map((field) => (
                <Card key={field.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{field.name}</CardTitle>
                      {field.distance && (
                        <Badge variant="outline" className="ml-2">
                          {field.distance.toFixed(1)} km
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3" />
                      {field.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {field.city && (
                      <Badge variant="secondary" className="text-xs">
                        {field.city}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Mapa */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div style={{ height: '600px', width: '100%' }}>
                <MapContainer
                  key={mapKey}
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Marcador de ubicación del usuario */}
                  {userLocation && (
                    <Marker position={userLocation} icon={userIcon}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-semibold text-blue-600">📍 Tu ubicación</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Marcadores de canchas */}
                  {filteredFields.map((field) => (
                    <Marker
                      key={field.id}
                      position={[field.latitude, field.longitude]}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <h3 className="font-semibold text-sm mb-1">⚽ {field.name}</h3>
                          <p className="text-xs text-gray-600 mb-2">{field.address}</p>
                          {field.city && (
                            <Badge variant="secondary" className="text-xs mb-2">
                              {field.city}
                            </Badge>
                          )}
                          {field.distance && (
                            <p className="text-xs text-green-600 font-medium">
                              📍 {field.distance.toFixed(1)} km de distancia
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </Card>
            
            {!userLocation && (
              <Card className="mt-4 border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Activa tu ubicación para ver las canchas más cercanas
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={getUserLocation}
                    className="mt-3"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Activar mi ubicación
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}