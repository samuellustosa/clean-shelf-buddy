-- Create equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  responsible TEXT NOT NULL,
  periodicity INTEGER NOT NULL, -- days between cleanings
  last_cleaning DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cleaning history table
CREATE TABLE public.cleaning_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  cleaning_date DATE NOT NULL,
  responsible_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_history ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for now)
CREATE POLICY "Equipment are viewable by everyone" 
ON public.equipment 
FOR SELECT 
USING (true);

CREATE POLICY "Equipment can be created by everyone" 
ON public.equipment 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Equipment can be updated by everyone" 
ON public.equipment 
FOR UPDATE 
USING (true);

CREATE POLICY "Equipment can be deleted by everyone" 
ON public.equipment 
FOR DELETE 
USING (true);

CREATE POLICY "Cleaning history are viewable by everyone" 
ON public.cleaning_history 
FOR SELECT 
USING (true);

CREATE POLICY "Cleaning history can be created by everyone" 
ON public.cleaning_history 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_equipment_sector ON public.equipment(sector);
CREATE INDEX idx_equipment_responsible ON public.equipment(responsible);
CREATE INDEX idx_equipment_last_cleaning ON public.equipment(last_cleaning);
CREATE INDEX idx_cleaning_history_equipment_id ON public.cleaning_history(equipment_id);
CREATE INDEX idx_cleaning_history_cleaning_date ON public.cleaning_history(cleaning_date);

-- Insert sample data
INSERT INTO public.equipment (name, sector, responsible, periodicity, last_cleaning) VALUES
  ('Autoclave A1', 'Laboratório', 'João Silva', 7, '2024-01-20'),
  ('Centrífuga B2', 'Hematologia', 'Maria Santos', 14, '2024-01-15'),
  ('Microscópio C3', 'Microbiologia', 'Pedro Costa', 30, '2024-01-10'),
  ('Analisador D4', 'Bioquímica', 'Ana Lima', 21, '2024-01-25'),
  ('Banho-maria E5', 'Imunologia', 'Carlos Souza', 7, '2024-01-12');

-- Insert sample cleaning history
INSERT INTO public.cleaning_history (equipment_id, cleaning_date, responsible_by)
SELECT 
  e.id,
  e.last_cleaning,
  e.responsible
FROM public.equipment e;