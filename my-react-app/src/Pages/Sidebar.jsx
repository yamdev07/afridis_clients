import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
  PieChart,
  FileUp,
  Download,
  User as UserIcon,
  ShieldCheck,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(() => window.innerWidth >= 1024);

  // Écouter les changements de taille pour s'adapter automatiquement
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === "super_admin" || user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { name: "Tableau de Bord", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Portefeuille Clients", icon: Users, path: "/clients" },
    { name: "Offres & Services", icon: Briefcase, path: "/services" },
    { name: "Rapports d'Activité", icon: PieChart, path: "/reports" },
  ];

  const adminOnlyItems = [
    { name: "Importation Data", icon: FileUp, path: "/import" },
    { name: "Exportation & Flux", icon: Download, path: "/export" },
  ];

  const profileItem = { name: "Mon Profil", icon: UserIcon, path: "/profile" };

  const adminItems = [
    { name: "Comptes Utilisateurs", icon: ShieldCheck, path: "/admin/users" },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[100] p-4 bg-primary text-white rounded-full shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-[90] flex flex-col font-inter transition-all duration-300"
          >
            {/* Header / Logo */}
            <div className="p-8 pb-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white shadow-sm">
                  <LayoutDashboard size={18} fill="currentColor" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight uppercase whitespace-nowrap">
                  Client<span className="text-primary italic">Flow</span>
                </h2>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-grow px-4 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Menu Principal</p>
                {menuItems.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    isActive={location.pathname === item.path}
                    onClick={() => { if (window.innerWidth < 1024) setIsOpen(false); }}
                  />
                ))}

                {isAdmin && adminOnlyItems.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    isActive={location.pathname === item.path}
                    onClick={() => { if (window.innerWidth < 1024) setIsOpen(false); }}
                  />
                ))}
              </div>

              <div className="space-y-1">
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Mon Espace</p>
                <NavItem
                  item={profileItem}
                  isActive={location.pathname === profileItem.path}
                  onClick={() => { if (window.innerWidth < 1024) setIsOpen(false); }}
                />
              </div>

              {isAdmin && (
                <div className="space-y-1">
                  <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Administration High-Level</p>
                  {adminItems.map((item) => (
                    <NavItem
                      key={item.path}
                      item={item}
                      isActive={location.pathname === item.path}
                    />
                  ))}
                </div>
              )}
            </nav>

            {/* Bottom Actions & User */}
            <div className="p-4 mt-auto border-t border-slate-800">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center gap-3 p-1">
                  <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user?.name || "Administrateur"}</p>
                    <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-tighter">{user?.role || "Agent"}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                >
                  <LogOut size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Déconnexion</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ item, isActive, onClick }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group ${isActive
        ? "bg-primary text-white"
        : "text-slate-400 hover:text-white hover:bg-slate-800"
        }`}
    >
      <item.icon size={18} />
      <span className="text-sm font-medium">{item.name}</span>
    </Link>
  );
}
