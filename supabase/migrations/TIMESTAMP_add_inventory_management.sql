-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  asset_number TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  maintenance_status TEXT DEFAULT 'ok',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_history table
CREATE TABLE public.stock_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  change INTEGER NOT NULL,
  reason TEXT,
  responsible_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add 'can_manage_inventory' permission to profiles table
ALTER TABLE public.profiles
ADD COLUMN can_manage_inventory BOOLEAN NOT NULL DEFAULT FALSE;

-- Enable Row Level Security on new tables
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_history ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory_items table
CREATE POLICY "Inventory items are viewable by everyone with can_view permission" 
ON public.inventory_items 
FOR SELECT 
USING ( (SELECT permissions->>'can_view' FROM profiles WHERE id = auth.uid())::BOOLEAN );

CREATE POLICY "Inventory items can be created by users with can_manage_inventory permission" 
ON public.inventory_items 
FOR INSERT 
WITH CHECK ( (SELECT permissions->>'can_manage_inventory' FROM profiles WHERE id = auth.uid())::BOOLEAN );

CREATE POLICY "Inventory items can be updated by users with can_manage_inventory permission" 
ON public.inventory_items 
FOR UPDATE 
USING ( (SELECT permissions->>'can_manage_inventory' FROM profiles WHERE id = auth.uid())::BOOLEAN );

CREATE POLICY "Inventory items can be deleted by users with can_manage_inventory permission" 
ON public.inventory_items 
FOR DELETE 
USING ( (SELECT permissions->>'can_manage_inventory' FROM profiles WHERE id = auth.uid())::BOOLEAN );

-- Create policies for stock_history table
CREATE POLICY "Stock history is viewable by everyone with can_view permission" 
ON public.stock_history 
FOR SELECT 
USING ( (SELECT permissions->>'can_view' FROM profiles WHERE id = auth.uid())::BOOLEAN );

CREATE POLICY "Stock history can be created by users with can_manage_inventory permission" 
ON public.stock_history 
FOR INSERT 
WITH CHECK ( (SELECT permissions->>'can_manage_inventory' FROM profiles WHERE id = auth.uid())::BOOLEAN );


-- Create trigger for automatic timestamp updates on inventory_items
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for inventory
INSERT INTO public.inventory_items (name, category, asset_number, quantity, min_stock, location, maintenance_status) VALUES
  ('Mouse Optico', 'Periféricos', 'PAT-12345', 15, 5, 'Armário 1', 'ok'),
  ('Cabo de Rede (1m)', 'Cabos', NULL, 50, 10, 'Gaveta 2', 'ok'),
  ('Toner Impressora X', 'Toners', 'PAT-54321', 3, 2, 'Prateleira 3', 'ok'),
  ('Balança de Etiqueta', 'Balanças', 'PAT-98765', 2, 1, 'Manutenção', 'in_maintenance'),
  ('Teclado USB', 'Periféricos', NULL, 10, 5, 'Armário 1', 'ok'),
  ('Balança de Etiqueta', 'Balanças', 'PAT-11223', 5, 1, 'Balcão de Atendimento', 'ok');