-- Chạy bằng SQL Editor/MCP. Chỉ kiểm tra quyền đọc, không sửa dữ liệu hoặc file.
begin;
select set_config('gungdetox.admin_ids', (
  select jsonb_agg(id order by id)::text from auth.users
  where email in ('buitheu698@gmail.com', 'chubaohong2206@gmail.com', 'hoabachhop79@gmail.com')
), true);
select set_config('gungdetox.expected_files', (
  select count(*)::text from storage.objects where bucket_id in ('product-images', 'post-images')
), true);

set local role anon;
do $$
begin
  if exists (select 1 from storage.objects where bucket_id in ('product-images', 'post-images')) then
    raise exception 'Khách chưa đăng nhập vẫn liệt kê được file Storage.';
  end if;
  if not exists (select 1 from public.products) or not exists (select 1 from public.posts) then
    raise exception 'Khách chưa đăng nhập không đọc được sản phẩm/blog.';
  end if;
end $$;

set local role authenticated;
do $$
declare
  admin_id text;
  visible_files bigint;
begin
  if jsonb_array_length(current_setting('gungdetox.admin_ids')::jsonb) <> 3 then
    raise exception 'Danh sách quản trị phải có đúng ba tài khoản đã xác nhận.';
  end if;
  for admin_id in select jsonb_array_elements_text(current_setting('gungdetox.admin_ids')::jsonb)
  loop
    perform set_config('request.jwt.claim.sub', admin_id, true);
    select count(*) into visible_files from storage.objects where bucket_id in ('product-images', 'post-images');
    if visible_files <> current_setting('gungdetox.expected_files')::bigint then
      raise exception 'Tài khoản quản trị % không truy cập được đủ ảnh.', admin_id;
    end if;
  end loop;
  perform set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
  if exists (select 1 from storage.objects where bucket_id in ('product-images', 'post-images')) then
    raise exception 'Tài khoản ngoài danh sách quản trị vẫn liệt kê được file Storage.';
  end if;
end $$;
rollback;
select 'Storage access checks passed' as result;
