import { useEffect, useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import { api } from "../api/clientflow";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle,
  Clock,
  Activity,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import GlassCard from "../components/ui/GlassCard";
import NotificationBell from "../components/NotificationBell";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useMemo(() => {
    return typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;
  }, []);

  useEffect(() => {
    let intervalId;
    const fetchSummary = async () => {
      try {
        const data = await api.getDashboardSummary();
        setSummary(data);
        setError(null);
      } catch (err) {
        console.error("Erreur dashboard:", err);
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
    intervalId = setInterval(fetchSummary, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const activityData = [
    { name: "Lun", value: 12 },
    { name: "Mar", value: 18 },
    { name: "Mer", value: 45 },
    { name: "Jeu", value: 30 },
    { name: "Ven", value: 55 },
    { name: "Sam", value: 40 },
    { name: "Dim", value: 65 },
  ];

  const pieData = [
    { name: "Installés", value: summary?.installed || 0, color: "#22C55E" },
    { name: "En attente", value: summary?.pending || 0, color: "#F59E0B" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-bg-light dark:bg-bg-dark font-inter transition-colors duration-500">
        <Sidebar />
        <div className="flex-grow flex items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark font-inter transition-colors duration-500">
      <Sidebar />

      <main className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-text-main-light dark:text-text-main-dark tracking-tight"
            >
              Tableau de bord
            </motion.h1>
            <p className="text-text-muted-light dark:text-text-muted-dark mt-2 font-medium">
              Ravi de vous revoir, <span className="text-primary font-bold">{user?.name || "Collaborateur"}</span>. Voici les performances du jour.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-1 px-2 bg-white dark:bg-white/5 rounded-radius-button border border-border-light dark:border-white/10 flex items-center shadow-premium">
              <span className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted-light dark:text-text-muted-dark">Live Status</span>
              <span className="shrink-0 w-2.5 h-2.5 bg-accent-green rounded-full animate-pulse mr-4"></span>
            </div>
            <NotificationBell />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Clients"
            value={summary?.clients}
            icon={Users}
            trend="+12%"
            color="primary"
          />
          <StatCard
            title="Installés"
            value={summary?.installed}
            icon={CheckCircle}
            trend="+5%"
            color="green"
          />
          <StatCard
            title="En attente"
            value={summary?.pending}
            icon={Clock}
            trend="-2%"
            color="orange"
          />
          {user?.role !== "commercial" ? (
            <StatCard
              title="Chiffre d'Affaires"
              value={`${(summary?.totalRevenue || 0).toLocaleString()} F`}
              icon={DollarSign}
              trend="+8.4%"
              color="purple"
            />
          ) : (
            <StatCard
              title="Services Actifs"
              value={summary?.tv}
              icon={Zap}
              trend="+3"
              color="purple"
            />
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Activity Chart */}
          <GlassCard className="lg:col-span-2 p-8" hover={false}>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-text-main-light dark:text-text-main-dark">Activité Clients</h3>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark font-medium">Flux des inscriptions hebdomadaires</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-bg-light dark:bg-white/5 rounded-radius-input text-[10px] font-black uppercase text-text-muted-light dark:text-text-muted-dark hover:bg-primary hover:text-white transition-all">Semaine</button>
                <button className="px-4 py-2 bg-transparent text-[10px] font-black uppercase text-text-muted-light/40 transition-all">Mois</button>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border-light dark:text-border-dark" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }}
                    dy={15}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '18px',
                      border: 'none',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    }}
                    wrapperStyle={{
                      backgroundColor: 'transparent'
                    }}
/>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563EB"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Service Distribution / Status Pie */}
          <GlassCard className="p-8 flex flex-col items-center" hover={false}>
            <div className="w-full mb-8">
              <h3 className="text-xl font-black text-text-main-light dark:text-text-main-dark">Statut Global</h3>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark font-medium">Répartition des dossiers</p>
            </div>

            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-text-main-light dark:text-text-main-dark leading-none">{summary?.clients || 0}</span>
                <span className="text-[10px] text-text-muted-light dark:text-text-muted-dark font-black uppercase tracking-widest mt-1">Dossiers</span>
              </div>
            </div>

            <div className="w-full space-y-4 mt-8">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-4 bg-bg-light dark:bg-white/5 rounded-radius-card border border-border-light dark:border-white/5 transition-all hover:translate-x-1 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full ring-4 ring-white dark:ring-bg-card-dark" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark">{item.name}</span>
                  </div>
                  <span className="text-base font-black text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Global Performance Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-8 rounded-[24px] bg-primary/10 dark:bg-primary/5 border border-primary/20 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
              <div className="flex items-center gap-8">
                <div className="h-20 w-20 rounded-radius-card bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 shrink-0">
                  <TrendingUp size={36} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-text-main-light dark:text-text-main-dark">Impact Performance</h2>
                  <p className="text-text-muted-light dark:text-text-muted-dark mt-2 max-w-xl font-medium leading-relaxed">
                    Votre croissance client est stable avec un taux de conversion de <span className="text-primary font-black">74%</span>.
                    Le délai d'installation moyen a été réduit de <span className="text-accent-green font-black">1.5 jours</span>.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Button onClick={() => navigate('/clients')} variant="primary" className="whitespace-nowrap">
                  Exploration Clients
                </Button>
                <button
                  onClick={() => navigate('/reports')}
                  className="px-8 py-4 bg-white dark:bg-bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-white/10 rounded-radius-button font-black text-[10px] uppercase tracking-[0.2em] hover:bg-bg-light dark:hover:bg-white/5 transition-all shadow-premium"
                >
                  Analyses
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }) {
  const colors = {
    primary: "bg-primary/10 text-primary border-primary/20",
    green: "bg-accent-green/10 text-accent-green border-accent-green/20",
    orange: "bg-accent-orange/10 text-accent-orange border-accent-orange/20",
    purple: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
  };

  const isUp = trend?.startsWith('+');

  return (
    <GlassCard className="p-6 group relative" hover={true}>
      <div className="absolute top-0 right-0 p-4">
        <div className={`p-3 rounded-radius-button ${colors[color]?.split(' ').slice(0, 2).join(' ')} transition-transform group-hover:scale-110 duration-300`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>

      <div className="mt-8">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider w-fit mb-4 ${isUp ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-orange/10 text-accent-orange'}`}>
          {isUp ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
          {trend}
        </div>
        <p className="text-text-muted-light dark:text-text-muted-dark text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
        <h3 className="text-4xl font-black text-text-main-light dark:text-text-main-dark leading-none">{value ?? "0"}</h3>
      </div>

      <div className={`absolute bottom-0 left-0 h-1.5 w-full bg-current opacity-20 ${colors[color]?.split(' ')[1]}`} />
    </GlassCard>
  );
}
