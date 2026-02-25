-- Drop the broken policy
drop policy "Admin can view feedback" on feedback;

-- Re-create it using the JWT claims (standard, secure, and performant)
create policy "Admin can view feedback"
  on feedback for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') = 'stianberg2@gmail.com'
  );
