-- Create enum for skill levels
CREATE TYPE public.skill_level AS ENUM ('principiante', 'intermedio', 'avanzado', 'mixto');

-- Create enum for match status
CREATE TYPE public.match_status AS ENUM ('abierto', 'lleno', 'en_curso', 'finalizado', 'cancelado');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  nickname TEXT,
  avatar_url TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Santiago',
  bio TEXT,
  matches_played INTEGER DEFAULT 0,
  matches_created INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT NOT NULL,
  location_address TEXT,
  city TEXT NOT NULL DEFAULT 'Santiago',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  skill_level skill_level NOT NULL DEFAULT 'mixto',
  max_players INTEGER NOT NULL DEFAULT 10,
  current_players INTEGER DEFAULT 0,
  price_per_player DECIMAL(10, 2) DEFAULT 0,
  status match_status DEFAULT 'abierto',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create match_players junction table
CREATE TABLE public.match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'confirmado',
  UNIQUE(match_id, player_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Matches policies
CREATE POLICY "Public matches are viewable by everyone" 
  ON public.matches FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Authenticated users can create matches" 
  ON public.matches FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own matches" 
  ON public.matches FOR UPDATE 
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own matches" 
  ON public.matches FOR DELETE 
  USING (auth.uid() = creator_id);

-- Match players policies
CREATE POLICY "Match players are viewable by everyone" 
  ON public.match_players FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can join matches" 
  ON public.match_players FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can leave matches" 
  ON public.match_players FOR DELETE 
  USING (auth.uid() = player_id);

-- Function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update current_players count
CREATE OR REPLACE FUNCTION public.update_match_player_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.matches 
    SET current_players = current_players + 1,
        status = CASE 
          WHEN current_players + 1 >= max_players THEN 'lleno'::match_status 
          ELSE status 
        END
    WHERE id = NEW.match_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.matches 
    SET current_players = GREATEST(current_players - 1, 0),
        status = CASE 
          WHEN status = 'lleno' THEN 'abierto'::match_status 
          ELSE status 
        END
    WHERE id = OLD.match_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to update player count
CREATE TRIGGER on_match_player_change
  AFTER INSERT OR DELETE ON public.match_players
  FOR EACH ROW EXECUTE FUNCTION public.update_match_player_count();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for matches
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_players;