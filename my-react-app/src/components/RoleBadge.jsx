const ROLE_META = {
  super_admin: {
    label: 'Super Admin',
    className: 'bg-red-100 text-red-600',
  },
  admin_local: {
    label: 'Admin Local',
    className: 'bg-indigo-100 text-indigo-700',
  },
  admin: {
    label: 'Admin',
    className: 'bg-blue-100 text-blue-600',
  },
  commercial: {
    label: 'Commercial',
    className: 'bg-green-100 text-green-600',
  },
};

export default function RoleBadge({ role }) {
  const meta = ROLE_META[role] || {
    label: role,
    className: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${meta.className}`}>
      {meta.label}
    </span>
  );
}
