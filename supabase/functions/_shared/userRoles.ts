
// Helper function to get user roles

export const getUserRoleQuery = `
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id_param UUID)
RETURNS SETOF app_role
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = user_id_param;
$$;
`;

export const assignRoleQuery = `
CREATE OR REPLACE FUNCTION public.assign_role(user_id_param UUID, role_param app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id_param, role_param)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
`;

export const removeRoleQuery = `
CREATE OR REPLACE FUNCTION public.remove_role(user_id_param UUID, role_param app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_roles
  WHERE user_id = user_id_param AND role = role_param;
END;
$$;
`;
