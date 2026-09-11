import { createClient } from "@supabase/supabase-js";

// Chỉ dùng key công khai (publishable/anon) — an toàn để chạy trong trình duyệt,
// vì mọi bảng đều được bảo vệ bằng Row Level Security (RLS) phía Supabase.
// KHÔNG bao giờ đưa SUPABASE_SERVICE_ROLE_KEY vào file này hay bất kỳ code nào chạy ở client.
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
