-- Storage policies used to embed three admin UUIDs, so removing someone from
-- admin_users left them able to read receipts and edit images. Use is_admin()
-- like the table policies so admin_users is the single admin list.
do $$
declare
  target record;
  restriction text;
begin
  for target in select * from (values
    ('product-images', 'Admin xem danh sách ảnh sản phẩm', 'SELECT'),
    ('product-images', 'Admin tải ảnh sản phẩm', 'INSERT'),
    ('product-images', 'Admin sửa ảnh sản phẩm', 'UPDATE'),
    ('product-images', 'Admin xoá ảnh sản phẩm', 'DELETE'),
    ('post-images', 'Admin xem danh sách ảnh blog', 'SELECT'),
    ('post-images', 'Admin tải ảnh blog', 'INSERT'),
    ('post-images', 'Admin sửa ảnh blog', 'UPDATE'),
    ('post-images', 'Admin xoá ảnh blog', 'DELETE'),
    ('payment-receipts', 'Admin xem ảnh chuyển khoản', 'SELECT')
  ) as policies(bucket, policy_name, operation)
  loop
    restriction := format('bucket_id = %L and (select public.is_admin())', target.bucket);
    execute format('drop policy if exists %I on storage.objects', target.policy_name);
    execute format('create policy %I on storage.objects for %s to authenticated %s', target.policy_name, target.operation,
      case target.operation
        when 'INSERT' then format('with check (%s)', restriction)
        when 'UPDATE' then format('using (%s) with check (%s)', restriction, restriction)
        else format('using (%s)', restriction)
      end);
  end loop;
end $$;