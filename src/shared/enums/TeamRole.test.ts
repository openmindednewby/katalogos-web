/**
 * Unit tests for TeamRole enum helpers.
 */
import { isManagerRole, isOwnerRole, teamRoleToLabelKey, teamRoleToSemanticColor } from './TeamRole';

describe('teamRoleToLabelKey', () => {
  it('maps Owner to owner label key', () => {
    expect(teamRoleToLabelKey('Owner')).toBe('settings.team.roleOwner');
  });

  it('maps Manager to manager label key', () => {
    expect(teamRoleToLabelKey('Manager')).toBe('settings.team.roleManager');
  });

  it('maps Staff to staff label key', () => {
    expect(teamRoleToLabelKey('Staff')).toBe('settings.team.roleStaff');
  });

  it('maps unknown role to staff label key', () => {
    expect(teamRoleToLabelKey('unknown')).toBe('settings.team.roleStaff');
  });

  it('is case insensitive', () => {
    expect(teamRoleToLabelKey('OWNER')).toBe('settings.team.roleOwner');
    expect(teamRoleToLabelKey('manager')).toBe('settings.team.roleManager');
  });
});

describe('teamRoleToSemanticColor', () => {
  it('maps Owner to info', () => {
    expect(teamRoleToSemanticColor('Owner')).toBe('info');
  });

  it('maps Manager to warning', () => {
    expect(teamRoleToSemanticColor('Manager')).toBe('warning');
  });

  it('maps Staff to success', () => {
    expect(teamRoleToSemanticColor('Staff')).toBe('success');
  });

  it('maps unknown role to success', () => {
    expect(teamRoleToSemanticColor('unknown')).toBe('success');
  });
});

describe('isOwnerRole', () => {
  it('returns true for Owner', () => {
    expect(isOwnerRole('Owner')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(isOwnerRole('OWNER')).toBe(true);
    expect(isOwnerRole('owner')).toBe(true);
  });

  it('returns false for non-owner roles', () => {
    expect(isOwnerRole('Manager')).toBe(false);
    expect(isOwnerRole('Staff')).toBe(false);
  });
});

describe('isManagerRole', () => {
  it('returns true for Manager', () => {
    expect(isManagerRole('Manager')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(isManagerRole('MANAGER')).toBe(true);
    expect(isManagerRole('manager')).toBe(true);
  });

  it('returns false for non-manager roles', () => {
    expect(isManagerRole('Owner')).toBe(false);
    expect(isManagerRole('Staff')).toBe(false);
  });
});
