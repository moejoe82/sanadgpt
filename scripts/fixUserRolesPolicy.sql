-- Fix user_roles RLS policy to allow users to read their own roles
-- This removes the circular dependency issue

-- Drop the existing problematic policy
DROP POLICY IF EXISTS roles_select ON public.user_roles;

-- Create a simpler policy that allows users to read their own roles
CREATE POLICY roles_select ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Keep the admin-only policies for insert/update
DROP POLICY IF EXISTS roles_insert ON public.user_roles;
CREATE POLICY roles_insert ON public.user_roles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

DROP POLICY IF EXISTS roles_update ON public.user_roles;
CREATE POLICY roles_update ON public.user_roles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );
