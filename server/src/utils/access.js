export const ROLES = ['super_admin', 'admin_local', 'admin', 'commercial'];

export const INTERNAL_ROLES = ['super_admin', 'admin_local', 'admin'];

export const USER_MANAGEMENT_ROLES = ['super_admin', 'admin_local', 'admin'];

export function isSuperAdmin(user) {
  return user?.role === 'super_admin';
}

export function canAccessUserManagement(user) {
  return USER_MANAGEMENT_ROLES.includes(user?.role);
}

export function getCreatableRoles(actorRole) {
  switch (actorRole) {
    case 'super_admin':
      return ['super_admin', 'admin_local', 'admin', 'commercial'];
    case 'admin_local':
      return ['admin', 'commercial'];
    case 'admin':
      return ['commercial'];
    default:
      return [];
  }
}

export async function getOrganizationOwnerId(pool, userId) {
  if (!userId) return null;

  const result = await pool.query(
    `WITH RECURSIVE chain AS (
       SELECT id, created_by, role, 0 AS depth
       FROM users
       WHERE id = $1
       UNION ALL
       SELECT parent.id, parent.created_by, parent.role, chain.depth + 1
       FROM users parent
       JOIN chain ON parent.id = chain.created_by
     )
     SELECT id
     FROM chain
     WHERE role = 'admin_local'
     ORDER BY depth
     LIMIT 1`,
    [userId],
  );

  return result.rows[0]?.id || userId;
}
