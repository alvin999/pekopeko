-- 建立 profiles 表，用於儲存使用者統計與基本資訊
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text,
  total_bows_received int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 建立 posts 表，用於儲存每日貼文
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  drink_type text CHECK (drink_type IN ('coffee', 'tea')),
  flavors text[],
  mood text,
  location_url text,
  location_name text,
  item_name text,
  -- SCA CVA 欄位
  flavor_intensity text CHECK (flavor_intensity IN ('low', 'medium', 'high')),
  main_tastes text[], -- 選 2 個
  acidity_intensity text CHECK (acidity_intensity IN ('low', 'medium', 'high')),
  acidity_type text CHECK (acidity_type IN ('dry', 'sweet')),
  sweetness_intensity text CHECK (sweetness_intensity IN ('low', 'medium', 'high')),
  mouthfeel text CHECK (mouthfeel IN ('low', 'medium', 'high')),
  mouthfeel_types text[], -- 選 2 個
  bow_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

-- 開啟 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Profiles 政策
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Posts 政策
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (expires_at > now());
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can update bow_count" ON public.posts FOR UPDATE USING (true) WITH CHECK (true);

-- 自動更新 total_bows_received 的 Function 與 Trigger
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
