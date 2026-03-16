import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import { api } from "../api/clientflow";
import {
  TrendingUp,
  Download,
  Calendar,
  Filter,
  FileText,
  Share2,
  Layers,
  Activity,
  DollarSign,
  Users
} from "lucide-react";
import {
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
import { motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import NotificationBell from "../components/NotificationBell";

function Rapports() {
  const [period, setPeriod] = useState("Mensuel");
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState({
    chartData: [],
    pieData: [],
    tableData: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getReportsData();
        setReportsData(data);
      } catch (err) {
        console.error("Erreur rapports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalRev = reportsData.chartData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    const totalInst = reportsData.chartData.reduce((acc, curr) => acc + (curr.installations || 0), 0);
    const totalClients = reportsData.chartData.reduce((acc, curr) => acc + (curr.users || 0), 0);

    return [
      { label: "Chiffre d'Affaires Total", value: `${totalRev.toLocaleString('fr-FR')} F`, icon: DollarSign, accent: "primary" },
      { label: "Installations (Période)", value: totalInst, icon: Activity, accent: "green" },
      { label: "Nouveaux Clients", value: totalClients, icon: Users, accent: "purple" },
    ];
  }, [reportsData]);

  if (loading) {
    return (
      <div className="flex h-screen bg-bg-light transition-colors duration-500">
        <Sidebar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-light font-inter transition-colors duration-500">
      <Sidebar />

      <main className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-black text-text-main-light tracking-tight">Rapports & Analyses</h1>
            <p className="text-text-muted-light mt-2 font-medium">Performance globale de votre CRM en temps réel.</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex gap-2">
            </div>
          </div>
        </header>

        {/* Toolbar Minimaliste */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200 w-full lg:w-auto">
            {["Historique"].map((p) => (
              <button
                key={p}
                className="px-6 py-2 bg-white text-primary shadow-sm rounded-md text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-grow lg:flex-grow-0">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select className="w-full lg:w-56 pl-10 pr-4 py-2.5 bg-white border border-border-light shadow-premium rounded-lg outline-none cursor-pointer text-xs font-medium appearance-none">
                <option>6 Derniers Mois</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <GlassCard key={idx} className="p-6 border-slate-200" hover={true}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg border ${stat.accent === 'primary' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                  <stat.icon size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">{stat.value}</h3>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <GlassCard className="lg:col-span-2 p-8 border-slate-200" hover={true}>
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Performances Commerciales</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Évolution du revenu par mois</p>
            </div>
            {reportsData.chartData.every(d => d.revenue === 0) ? (
              <div className="h-[250px] lg:h-[350px] flex items-center justify-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aucune donnée sur la période</p>
              </div>
            ) : (
            <div className="h-[250px] lg:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportsData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                    interval={window.innerWidth < 1024 ? 1 : 0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      color: '#0f172a',
                      fontSize: '11px',
                      fontWeight: 800
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenu"
                    stroke="#2563EB"
                    strokeWidth={4}
                    fillOpacity={0.1}
                    fill="#2563EB"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            )}
          </GlassCard>

          <GlassCard className="p-8 border-slate-200" hover={true}>
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Répartition Services</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Top 5 des offres souscrites</p>
            </div>
            {reportsData.pieData.length === 0 ? (
               <div className="h-[250px] flex items-center justify-center">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aucune donnée</p>
               </div>
            ) : (
            <>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportsData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {reportsData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {reportsData.pieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
            </>
            )}
          </GlassCard>
        </div>

        {/* Detailed Table Section */}
        <GlassCard className="p-0 overflow-hidden" hover={true}>
          <div className="p-8 border-b border-border-light flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Layers size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Activité Mensuelle</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Journal consolidé des transactions</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
              <FileText size={16} /> Rapport Complet
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Période</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">C.A Brut</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">C.A Net (Est.)</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Installations</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportsData.tableData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 text-sm font-black text-slate-900 capitalize">{row.period}</td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-bold">{row.gross}</td>
                    <td className="px-8 py-5 text-sm font-black text-primary">{row.net}</td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-bold">{row.volume}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-1 rounded font-black uppercase text-[9px] border ${row.status === 'Record' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          row.status === 'Hausse' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {reportsData.tableData.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-10 text-center text-slate-500 font-medium">Aucune donnée disponible.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}

export default Rapports;
