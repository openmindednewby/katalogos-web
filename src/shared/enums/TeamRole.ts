/** Roles assignable to team members within a tenant. */
const enum TeamRole {
  Owner = 0,
  Manager = 1,
  Staff = 2,
}

/** Maps a backend role string to a translation key. */
export function teamRoleToLabelKey(role: string): string {
  const normalized = role.toLowerCase();
  if (normalized === 'owner') return 'settings.team.roleOwner';
  if (normalized === 'manager') return 'settings.team.roleManager';
  if (normalized === 'staff') return 'settings.team.roleStaff';
  return 'settings.team.roleStaff';
}

/** Returns true when the role string represents the Owner role. */
export function isOwnerRole(role: string): boolean {
  return role.toLowerCase() === 'owner';
}

/** Returns true when the role string represents the Manager role. */
export function isManagerRole(role: string): boolean {
  return role.toLowerCase() === 'manager';
}

/** Maps a backend role string to a semantic color key. */
export function teamRoleToSemanticColor(role: string): 'info' | 'warning' | 'success' {
  const normalized = role.toLowerCase();
  if (normalized === 'owner') return 'info';
  if (normalized === 'manager') return 'warning';
  return 'success';
}

export default TeamRole;
