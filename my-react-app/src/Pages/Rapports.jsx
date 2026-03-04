import React, { useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  PieChart as PieChartIcon,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  FileText,
  Share2,
  MoreVertical,
  Layers,
  Activity,
  Zap,
  DollarSign,
  Users
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Cell,
  Pie
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import NotificationBell from "../components/NotificationBell";

const data = [
  { name: "Jan", revenue: 4500, users: 400, installations: 240 },
  { name: "Feb", revenue: 5200, users: 450, installations: 300 },
  { name: "Mar", revenue: 4800, users: 420, installations: 200 },
  { name: "Apr", revenue: 6100, users: 500, installations: 278 },
  { name: "May", revenue: 5900, users: 480, installations: 189 },
  { name: "Jun", revenue: 7200, users: 600, installations: 239 },
  { name: "Jul", revenue: 8500, users: 750, installations: 349 },
];

const pieData = [
  { name: "Pro 25", value: 400, color: "#2563EB" },
  { name: "Office 100", value: 300, color: "#8B5CF6" },
  { name: "Fibre 500", value: 200, color: "#10B981" },
  { name: "Pro 50", value: 100, color: "#F59E0B" },
];

function Rapports() {
  const [period, setPeriod] = useState("Mensuel");
  const [loading, setLoading] = useState(false);

  const stats = [
    { label: "Chiffre d'Affaires", value: "12 500 000 FCFA", change: "+12.5%", positive: true, icon: DollarSign, accent: "primary" },
    { label: "Installations", value: "32", change: "+8.2%", positive: true, icon: Activity, accent: "green" },
    { label: "Clients Actifs", value: "1,284", change: "-2.4%", positive: false, icon: Users, accent: "purple" },
  ];

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark font-inter transition-colors duration-500">
      <Sidebar />

      <main className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-text-main-light dark:text-text-main-dark tracking-tight">Rapports & Statistiques</h1>
            <p className="text-text-muted-light dark:text-text-muted-dark mt-2 font-medium">Analyse approfondie de vos performances commerciales.</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex gap-3">
              <Button variant="secondary" icon={Download} className="!px-6">Exporter</Button>
              <Button variant="primary" icon={Share2} className="shadow-primary/30">Partager</Button>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-radius-button border border-border-light dark:border-white/10 shadow-premium w-full lg:w-auto">
            {["Mensuel", "Trimestriel", "Annuel"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 lg:flex-none px-8 py-3 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-text-muted-light hover:text-primary"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-grow lg:flex-grow-0">
              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light" size={18} />
              <select className="w-full lg:w-64 pl-14 pr-10 py-4 bg-white dark:bg-white/5 border border-border-light dark:border-white/10 rounded-radius-button appearance-none outline-none focus:ring-4 ring-primary/10 text-[10px] font-black text-text-main-light dark:text-text-main-dark uppercase tracking-widest cursor-pointer shadow-premium">
                <option>Derniers 30 jours</option>
                <option>Derniers 90 jours</option>
                <option>Année en cours</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted-light pointer-events-none" size={16} />
            </div>
            <button className="p-4 bg-white dark:bg-white/5 border border-border-light dark:border-white/10 rounded-radius-button text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-all active:scale-95 shadow-premium">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {stats.map((stat, idx) => (
            <GlassCard key={idx} className="p-8 relative overflow-hidden group" hover={true}>
              <div className="relative z-10 flex items-start justify-between">
                <div className={`p-4 rounded-radius-card ${stat.accent === 'primary' ? 'bg-primary/10 text-primary' : 'bg-accent-' + stat.accent + '/10 text-accent-' + stat.accent}`}>
                  <stat.icon size={28} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${stat.positive ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : 'bg-accent-red/10 text-accent-red border border-accent-red/20'}`}>
                  {stat.positive ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                  {stat.change}
                </div>
              </div>
              <div className="relative z-10 mt-6">
                <p className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.25em] mb-2">{stat.label}</p>
                <h3 className="text-3xl font-black text-text-main-light dark:text-text-main-dark leading-tight">{stat.value}</h3>
              </div>
              <div className={`absolute -bottom-6 -right-6 w-32 h-32 ${stat.accent === 'primary' ? 'bg-primary/5' : 'bg-accent-' + stat.accent + '/5'} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
            </GlassCard>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <GlassCard className="lg:col-span-2 p-10" hover={true}>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-text-main-light dark:text-text-main-dark tracking-tight">Ventes & Croissance</h3>
                <p className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest mt-1">Évolution du chiffre d'affaires sur 7 mois</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-bg-light/50 dark:bg-white/5 rounded-radius-button border border-border-light dark:border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-[9px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">Revenue</span>
                </div>
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200, 200, 200, 0.1)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 800 }}
                    dy={10}
                    className="text-text-muted-light dark:text-text-muted-dark"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 800 }}
                    className="text-text-muted-light dark:text-text-muted-dark"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(var(--bg-card-dark-rgb), 0.95)',
                      borderRadius: '18px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
                      padding: '15px'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-10" hover={true}>
            <div className="mb-10">
              <h3 className="text-xl font-black text-text-main-light dark:text-text-main-dark tracking-tight">Top Services</h3>
              <p className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest mt-1">Répartition par offre</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-4">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[9px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-text-main-light dark:text-text-main-dark">{(item.value / 10).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Detailed Table Section */}
        <GlassCard className="p-0 overflow-hidden" hover={true}>
          <div className="p-8 border-b border-border-light dark:border-white/5 flex items-center justify-between bg-bg-light/30 dark:bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-radius-card flex items-center justify-center">
                <Layers size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-text-main-light dark:text-text-main-dark tracking-tight">Activité Détaillée</h3>
                <p className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em] mt-0.5">Journal des transactions et rapports</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-bg-card-dark dark:bg-white/5 text-white dark:text-primary text-[10px] font-black uppercase tracking-widest rounded-radius-button hover:bg-primary hover:text-white dark:hover:bg-primary transition-all shadow-premium">
              <FileText size={16} /> Générer PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-light/50 dark:bg-white/5">
                  <th className="px-10 py-5 text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em]">Période</th>
                  <th className="px-10 py-5 text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em]">C.A Brut</th>
                  <th className="px-10 py-5 text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em]">Net</th>
                  <th className="px-10 py-5 text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em]">Installations</th>
                  <th className="px-10 py-5 text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em]">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-white/5">
                {[
                  { period: "Janvier 2026", gross: "1 200 000 F", net: "980 000 F", inst: "24", status: "Stable" },
                  { period: "Décembre 2025", gross: "2 450 000 F", net: "1 950 000 F", inst: "45", status: "Record" },
                  { period: "Novembre 2025", gross: "1 890 000 F", net: "1 520 000 F", inst: "38", status: "Hausse" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-6 text-sm font-black text-text-main-light dark:text-text-main-dark">{row.period}</td>
                    <td className="px-10 py-6 text-sm font-bold text-text-muted-light dark:text-text-muted-dark">{row.gross}</td>
                    <td className="px-10 py-6 text-sm font-black text-primary">{row.net}</td>
                    <td className="px-10 py-6 text-sm font-bold text-text-muted-light dark:text-text-muted-dark">{row.inst}</td>
                    <td className="px-10 py-6">
                      <span className="px-3 py-1 bg-bg-light dark:bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border border-border-light dark:border-white/10">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}

export default Rapports;
