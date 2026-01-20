// src/types/database.ts
// Types que coinciden con tu base de datos de Supabase

export type UserLevel = 'principiante' | 'intermedio' | 'avanzado';
export type MatchStatus = 'abierto' | 'completo' | 'cancelado' | 'finalizado';
export type MatchLevelRequired = 'todos' | 'principiante' | 'intermedio' | 'avanzado';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  level: UserLevel | null;
  preferred_position: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Field {
  fecha: any;
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface Match {
  id: string;
  created_by: string;
  field_id: string | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  duration_minutes: number;
  max_players: number;
  current_players: number;
  price_per_player: number | null;
  level_required: MatchLevelRequired;
  description: string | null;
  status: MatchStatus;
  created_at: string;
}

export interface MatchPlayer {
  id: string;
  match_id: string;
  user_id: string;
  joined_at: string;
}

// Types expandidos con joins para facilitar el uso en componentes
export interface MatchWithDetails extends Match {
  field: Field | null;
  creator: Profile | null;
  players: Profile[];
}

export interface MatchPlayerWithProfile extends MatchPlayer {
  profile: Profile;
}

// Type para crear un nuevo partido (lo que enviamos al backend)
export interface CreateMatchInput {
  field_id: string | null;
  date: string;
  time: string;
  duration_minutes?: number;
  max_players?: number;
  price_per_player?: number;
  level_required: MatchLevelRequired;
  description?: string;
}

// Type para actualizar perfil
export interface UpdateProfileInput {
  full_name?: string;
  phone?: string;
  level?: UserLevel;
  preferred_position?: string;
  avatar_url?: string;
}