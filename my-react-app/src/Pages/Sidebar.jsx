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
import ThemeToggle from "../components/ThemeToggle";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(true);

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
    { name: "Gestion Clients", icon: Users, path: "/clients" },
    { name: "Services & Offres", icon: Briefcase, path: "/services" },
    { name: "Analyses & Rapports", icon: PieChart, path: "/reports" },
    { name: "Importation", icon: FileUp, path: "/import" },
    { name: "Exportation", icon: Download, path: "/export" },
  ];

  const adminItems = [
    { name: "Utilisateurs CRM", icon: ShieldCheck, path: "/admin/users" },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[100] p-4 bg-primary text-white rounded-full shadow-2xl"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed lg:static inset-y-0 left-0 w-72 bg-white dark:bg-sidebar-dark border-r border-border-light dark:border-white/5 z-[90] flex flex-col font-inter shadow-xl lg:shadow-none transition-colors duration-500"
          >
            {/* Header / Logo */}
            <div className="p-8 pb-12 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-radius-card flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <LayoutDashboard size={22} fill="currentColor" />
                </div>
                <h2 className="text-xl font-black text-text-main-light dark:text-text-main-dark tracking-tighter uppercase whitespace-nowrap">
                  Client<span className="text-primary">Flow</span>
                </h2>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-grow px-4 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <p className="px-4 text-[11px] font-black uppercase tracking-[0.2em] text-text-muted-light dark:text-text-muted-dark mb-4">Menu Principal</p>
                {menuItems.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    isActive={location.pathname === item.path}
                  />
                ))}
              </div>

              {isAdmin && (
                <div className="space-y-1">
                  <p className="px-4 text-[11px] font-black uppercase tracking-[0.2em] text-text-muted-light dark:text-text-muted-dark mb-4">Administration</p>
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
            <div className="p-4 mt-auto space-y-4">
              <div className="flex items-center justify-center">
                <ThemeToggle />
              </div>

              <div className="p-4 bg-bg-light dark:bg-white/5 rounded-radius-card border border-border-light dark:border-white/5 space-y-4">
                <Link to="/profile" className="flex items-center gap-3 p-1 group">
                  <div className="w-10 h-10 rounded-radius-card bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-text-main-light dark:text-text-main-dark truncate">{user?.name || "Utilisateur"}</p>
                    <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark font-black truncate uppercase tracking-widest">{user?.role || "Agent"}</p>
                  </div>
                  <ChevronRight size={14} className="text-text-muted-light group-hover:text-primary transition-colors" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 text-text-muted-light hover:text-accent-red hover:bg-accent-red/10 rounded-radius-card transition-all group"
                >
                  <LogOut size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ item, isActive }) {
  return (
    <Link
      to={item.path}
      className={`flex items-center gap-4 px-4 py-3.5 rounded-radius-card transition-all group ${isActive
        ? "bg-primary-light dark:bg-primary/20 text-primary"
        : "text-text-muted-light dark:text-text-muted-dark hover:bg-bg-light dark:hover:bg-white/5 hover:text-primary dark:hover:text-white"
        }`}
    >
      <item.icon size={20} className={`${isActive ? "text-primary" : "text-text-muted-light group-hover:text-primary"} transition-colors`} />
      <span className={`text-sm font-bold tracking-tight ${isActive ? "text-primary" : ""}`}>{item.name}</span>
      {isActive && (
        <motion.div
          layoutId="activeSide"
          className="ml-auto w-1.5 h-6 bg-primary rounded-full"
        />
      )}
    </Link>
  );
}
