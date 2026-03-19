-- NEW: shops 資料表
CREATE TABLE IF NOT EXISTS public.shops (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  latitude float8,
  longitude float8,
  search_key text, -- 用於去重 (lowercase, no spaces, NFKC)
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- NEW: shop_claims 資料表
CREATE TABLE IF NOT EXISTS public.shop_claims (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  evidence_url text,
  created_at timestamptz DEFAULT now()
);

-- MODIFY: posts 資料表，增加 shop_id 關聯
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL;

-- 設定 RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_claims ENABLE ROW LEVEL SECURITY;

-- Shops RLS
CREATE POLICY "Shops are viewable by everyone" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create shops" ON public.shops FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owners can update own shops" ON public.shops FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Shop Claims RLS
CREATE POLICY "Claims are viewable by applicants and admins" ON public.shop_claims FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "Authenticated users can apply for claims" ON public.shop_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 索引優化
CREATE INDEX IF NOT EXISTS idx_shops_search_key ON public.shops(search_key);
CREATE INDEX IF NOT EXISTS idx_shops_coords ON public.shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_posts_shop_id ON public.posts(shop_id);
