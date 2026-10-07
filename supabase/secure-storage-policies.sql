-- Chỉ ba tài khoản quản trị đã được xác nhận được quản lý hai bucket ảnh.
-- Chạy qua migration sau schema.sql và sau khi tạo đủ ba tài khoản trong Auth.
do $$
declare
  admin_ids uuid[];
  target record;
  restriction text;
  clauses text;
begin
  select array_agg(id order by id) into admin_ids
  from auth.users
  where email in ('buitheu698@gmail.com', 'chubaohong2206@gmail.com', 'hoabachhop79@gmail.com');

  if coalesce(cardinality(admin_ids), 0) <> 3 then
    raise exception 'Thiếu tài khoản quản trị Storage. Tạo đủ ba email đã xác nhận trong Supabase Auth trước khi chạy migration.';
  end if;

  for target in select * from (values
    ('product-images', 'Ai cũng xem được ảnh sản phẩm', 'Admin xem danh sách ảnh sản phẩm', 'SELECT'),
    ('product-images', 'Admin tải ảnh sản phẩm', 'Admin tải ảnh sản phẩm', 'INSERT'),
    ('product-images', 'Admin sửa ảnh sản phẩm', 'Admin sửa ảnh sản phẩm', 'UPDATE'),
    ('product-images', 'Admin xoá ảnh sản phẩm', 'Admin xoá ảnh sản phẩm', 'DELETE'),
    ('post-images', 'Ai cũng xem được ảnh blog', 'Admin xem danh sách ảnh blog', 'SELECT'),
    ('post-images', 'Admin tải ảnh blog', 'Admin tải ảnh blog', 'INSERT'),
    ('post-images', 'Admin sửa ảnh blog', 'Admin sửa ảnh blog', 'UPDATE'),
    ('post-images', 'Admin xoá ảnh blog', 'Admin xoá ảnh blog', 'DELETE')
  ) as policies(bucket, old_name, policy_name, operation)
  loop
    -- Lưu UUID vào policy để không phải đọc auth.users khi client chạy truy vấn.
    restriction := format('bucket_id = %L and (select auth.uid()) = any (%L::uuid[])', target.bucket, admin_ids);
    clauses := case target.operation
      when 'INSERT' then format('with check (%s)', restriction)
      when 'UPDATE' then format('using (%s) with check (%s)', restriction, restriction)
      else format('using (%s)', restriction)
    end;
    -- Tạo lại policy vì Supabase không hỗ trợ đổi tên policy qua vai trò postgres.
    execute format('drop policy %I on storage.objects', target.old_name);
    execute format('create policy %I on storage.objects for %s to authenticated %s', target.policy_name, target.operation, clauses);
  end loop;
end $$;
