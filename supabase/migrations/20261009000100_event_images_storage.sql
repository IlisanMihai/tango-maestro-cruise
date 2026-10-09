-- Stage 1: public bucket for event images.
-- Layout: event-images/<uploader uid>/<file>. Anyone can read; active staff
-- upload only into their own folder; owners delete their own files, admin any.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-images',
  'event-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "event-images: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'event-images');

create policy "event-images: staff upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'event-images'
    and (select public.is_active_staff())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "event-images: owner or admin can update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'event-images'
    and (
      (select public.is_admin())
      or ((select public.is_active_staff())
          and (storage.foldername(name))[1] = (select auth.uid())::text)
    )
  )
  with check (
    bucket_id = 'event-images'
    and (
      (select public.is_admin())
      or ((select public.is_active_staff())
          and (storage.foldername(name))[1] = (select auth.uid())::text)
    )
  );

create policy "event-images: owner or admin can delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'event-images'
    and (
      (select public.is_admin())
      or ((select public.is_active_staff())
          and (storage.foldername(name))[1] = (select auth.uid())::text)
    )
  );
