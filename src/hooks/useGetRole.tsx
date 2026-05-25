import { useSelector } from 'react-redux';

import { KeycloakRoles } from '../auth/keycloakTypes';

import type { RootState } from '../store/reduxStore';

export function useGetRole(): { isAdmin: boolean; isSuperAdmin: boolean; isUser: boolean } {
  const userInfo = useSelector((s: RootState) => s.auth.userInfo);
  const roles = userInfo?.roles ?? [];
  const isAdmin = roles.includes(KeycloakRoles.Admin);
  const isSuperAdmin = roles.includes(KeycloakRoles.SuperUser);
  const isUser = roles.includes(KeycloakRoles.User);

  return { isAdmin, isSuperAdmin, isUser };
}
