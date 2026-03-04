export default function RoleBadge({ role }) {
  const styles = {
    super_admin: "bg-red-100 text-red-600",
    admin: "bg-blue-100 text-blue-600",
    commercial: "bg-green-100 text-green-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
        styles[role] || "bg-gray-100 text-gray-600"
      }`}
    >
      {role}
    </span>
  );
}
