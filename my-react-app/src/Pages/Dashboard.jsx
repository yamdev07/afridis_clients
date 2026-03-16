import { useEffect, useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import { api } from "../api/clientflow";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle,
  Clock,
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
  Legend,
} from "recharts";
import GlassCard from "../components/ui/GlassCard";
import NotificationBell from "../components/NotificationBell";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState("week"); // 'week' | 'month'

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

  // Filtrer les données du graphe selon la période choisie
  const chartData = useMemo(() => {
    const raw = summary?.chartData || [];
    if (chartPeriod === "week") return raw.slice(-7);
    return raw; // 30 jours
  }, [summary, chartPeriod]);

  const pieData = [
    { name: "Installés", value: summary?.installed || 0, color: "#22C55E" },
    { name: "En attente", value: summary?.pending || 0, color: "#F59E0B" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-bg-light font-inter transition-colors duration-500">
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
    <div className="flex min-h-screen bg-bg-light font-inter transition-colors duration-500">
      <Sidebar />

      <main className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-text-main-light tracking-tight"
            >
              Tableau de bord
            </motion.h1>
            <p className="text-text-muted-light mt-2 font-medium">
              Ravi de vous revoir, <span className="text-primary font-bold">{user?.name || "Collaborateur"}</span>. Voici les performances du jour.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-1 px-2 bg-white rounded-radius-button border border-border-light flex items-center shadow-premium">
              <span className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted-light">Live Status</span>
              <span className="shrink-0 w-2.5 h-2.5 bg-accent-green rounded-full animate-pulse mr-4"></span>
            </div>
            <NotificationBell />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Clients"
            value={summary?.clients ?? 0}
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Installés"
            value={summary?.installed ?? 0}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="En attente"
            value={summary?.pending ?? 0}
            icon={Clock}
            color="orange"
          />
          {user?.role !== "commercial" && (
            <StatCard
              title="Chiffre d'Affaires"
              value={`${(summary?.totalRevenue || 0).toLocaleString("fr-FR")} F`}
              icon={DollarSign}
              color="purple"
            />
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Activity Chart — DONNÉES RÉELLES */}
          <GlassCard className="lg:col-span-2 p-8" hover={false}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-text-main-light">Activité Clients</h3>
                <p className="text-sm text-text-muted-light font-medium">
                  Clients créés vs installés — {chartPeriod === "week" ? "7 derniers jours" : "30 derniers jours"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartPeriod("week")}
                  className={`px-4 py-2 rounded-radius-input text-[10px] font-black uppercase transition-all ${chartPeriod === "week"
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-bg-light text-text-muted-light hover:bg-primary/10"
                    }`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setChartPeriod("month")}
                  className={`px-4 py-2 rounded-radius-input text-[10px] font-black uppercase transition-all ${chartPeriod === "month"
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-bg-light text-text-muted-light hover:bg-primary/10"
                    }`}
                >
                  Mois
                </button>
              </div>
            </div>

            {chartData.length === 0 || chartData.every(d => Number(d.created) === 0 && Number(d.installed) === 0) ? (
              <div className="h-[250px] lg:h-[300px] flex flex-col items-center justify-center gap-4 text-text-muted-light">
                <TrendingUp size={48} className="opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">Aucune donnée sur la période</p>
              </div>
            ) : (
              <div className="h-[250px] lg:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInstalled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border-light opacity-30" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 800 }}
                      dy={10}
                      interval={window.innerWidth < 768 ? (chartPeriod === "week" ? 1 : 6) : (chartPeriod === "month" ? 4 : 0)}
                    />
                    <YAxis
                      hide={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 800 }}
                      allowDecimals={false}
                      width={25}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid rgba(0,0,0,0.05)",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                        backgroundColor: "#fff",
                        color: "#0f172a",
                        fontSize: "11px",
                        fontWeight: 800,
                      }}
                      labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
                      formatter={(value, name) => [value, name === "created" ? "Créés" : "Installés"]}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          {value === "created" ? "Créés" : "Installés"}
                        </span>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="created"
                      stroke="#2563EB"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorCreated)"
                      animationDuration={1500}
                      dot={false}
                      activeDot={{ r: 5, fill: "#2563EB" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="installed"
                      stroke="#22C55E"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorInstalled)"
                      animationDuration={1500}
                      dot={false}
                      activeDot={{ r: 5, fill: "#22C55E" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>

          {/* Status Pie — toujours dynamique */}
          <GlassCard className="p-8 flex flex-col items-center" hover={false}>
            <div className="w-full mb-6">
              <h3 className="text-xl font-black text-text-main-light">Statut Global</h3>
              <p className="text-sm text-text-muted-light font-medium">Répartition des dossiers</p>
            </div>

            {(summary?.installed === 0 && summary?.pending === 0) ? (
              <div className="flex-grow flex flex-col items-center justify-center gap-3 text-text-muted-light">
                <Users size={48} className="opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">Aucun abonnement enregistré</p>
              </div>
            ) : (
              <>
                <div className="h-[230px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1000}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                          fontSize: "11px",
                          fontWeight: 800,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-black text-text-main-light leading-none">{summary?.clients || 0}</span>
                    <span className="text-[10px] text-text-muted-light font-black uppercase tracking-widest mt-1">Dossiers</span>
                  </div>
                </div>

                <div className="w-full space-y-3 mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-4 bg-bg-light rounded-radius-card border border-border-light transition-all hover:translate-x-1 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full ring-4 ring-white" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-bold text-text-main-light">{item.name}</span>
                      </div>
                      <span className="text-base font-black text-primary">{item.value}</span>
                    </div>
                  ))}
                  {/* Taux d'installation */}
                  {(summary?.installed || 0) + (summary?.pending || 0) > 0 && (
                    <div className="p-4 bg-primary/5 rounded-radius-card border border-primary/10 text-center">
                      <p className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Taux d'installation</p>
                      <p className="text-2xl font-black text-primary mt-1">
                        {Math.round(((summary?.installed || 0) / ((summary?.installed || 0) + (summary?.pending || 0))) * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </GlassCard>
        </div>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-8 rounded-[24px] bg-primary/10 border border-primary/20 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
              <div className="flex items-center gap-8">
                <div className="h-20 w-20 rounded-radius-card bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 shrink-0">
                  <TrendingUp size={36} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-text-main-light">Impact Performance</h2>
                  <p className="text-text-muted-light mt-2 max-w-xl font-medium leading-relaxed">
                    {summary?.clients > 0
                      ? `${summary.clients} client(s) au total · ${summary.installed} installé(s) · ${(summary.totalRevenue || 0).toLocaleString("fr-FR")} F de CA généré`
                      : "Commencez par ajouter vos premiers clients dans ClientFlow."}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Button onClick={() => navigate('/clients')} variant="primary" className="whitespace-nowrap">
                  Exploration Clients
                </Button>
                <button
                  onClick={() => navigate('/reports')}
                  className="px-8 py-4 bg-white text-text-main-light border border-border-light rounded-radius-button font-black text-[10px] uppercase tracking-[0.2em] hover:bg-bg-light transition-all shadow-premium"
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

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    primary: "text-primary bg-primary/5 border-primary/10",
    green: "text-accent-green bg-accent-green/5 border-accent-green/10",
    orange: "text-accent-orange bg-accent-orange/5 border-accent-orange/10",
    purple: "text-accent-purple bg-accent-purple/5 border-accent-purple/10",
  };
  const c = colors[color] || colors.primary;

  return (
    <GlassCard className="p-6 border-slate-200" hover={true}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg border ${c}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 leading-tight">{value ?? "0"}</h3>
        </div>
      </div>
    </GlassCard>
  );
}
