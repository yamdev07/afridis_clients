import { describe, it, expect } from 'vitest';
import { canAccessUserManagement, getCreatableRoles, isSuperAdmin } from './access.js';

describe('access helpers', () => {
  it('getCreatableRoles: un admin simple ne peut créer que des commerciaux', () => {
    expect(getCreatableRoles('admin')).toEqual(['commercial']);
  });

  it('canAccessUserManagement: réservé aux rôles internes, pas au commercial', () => {
    expect(canAccessUserManagement({ role: 'commercial' })).toBe(false);
    expect(canAccessUserManagement({ role: 'admin_local' })).toBe(true);
  });

  it('isSuperAdmin: uniquement le rôle super_admin', () => {
    expect(isSuperAdmin({ role: 'super_admin' })).toBe(true);
    expect(isSuperAdmin({ role: 'admin' })).toBe(false);
    expect(isSuperAdmin(null)).toBe(false);
  });
});
