-- 1. Profiles (使用者個人檔案)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text,
  total_bows_received int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. Shops (店家資料)
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

-- 3. Shop Claims (店家認領申請)
CREATE TABLE IF NOT EXISTS public.shop_claims (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  evidence_url text,
  created_at timestamptz DEFAULT now()
);

-- 4. Posts (貼文)
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  drink_type text CHECK (drink_type IN ('coffee', 'tea')),
  flavors text[],
  mood text,
  location_name text,
  item_name text,
  shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  -- SCA CVA 欄位
  flavor_intensity text CHECK (flavor_intensity IN ('low', 'medium', 'high')),
  main_tastes text[],
  acidity_intensity text CHECK (acidity_intensity IN ('low', 'medium', 'high')),
  acidity_type text CHECK (acidity_type IN ('dry', 'sweet')),
  sweetness_intensity text CHECK (sweetness_intensity IN ('low', 'medium', 'high')),
  mouthfeel text CHECK (mouthfeel IN ('low', 'medium', 'high')),
  mouthfeel_types text[],
  bow_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  post_date DATE NOT NULL,
  UNIQUE (user_id, post_date),
  CONSTRAINT check_post_date CHECK (post_date >= (CURRENT_DATE - 1) AND post_date <= (CURRENT_DATE + 1))
);

-- 5. RLS (資料列層級安全性)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Profiles 政策
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Shops 政策
CREATE POLICY "Shops are viewable by everyone" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create shops" ON public.shops FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owners can update own shops" ON public.shops FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Shop Claims 政策
CREATE POLICY "Claims are viewable by applicants and admins" ON public.shop_claims FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "Authenticated users can apply for claims" ON public.shop_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts 政策
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- 6. Functions & Triggers
-- 自動更新 total_bows_received
CREATE OR REPLACE FUNCTION public.handle_post_bow()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bow_count > OLD.bow_count THEN
    UPDATE public.profiles
    SET total_bows_received = total_bows_received + (NEW.bow_count - OLD.bow_count)
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_post_bow_update
  AFTER UPDATE OF bow_count ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_bow();

-- 建立 Profile 的 Trigger (當 Auth User 建立時)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. RPC (遠端程序呼叫)
-- 建立專用的點讚函數 (RPC)
CREATE OR REPLACE FUNCTION public.increment_bow(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.posts
  SET bow_count = bow_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. 索引優化
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_post_date ON public.posts(post_date);
CREATE INDEX IF NOT EXISTS idx_shops_search_key ON public.shops(search_key);
CREATE INDEX IF NOT EXISTS idx_shops_coords ON public.shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_posts_shop_id ON public.posts(shop_id);
