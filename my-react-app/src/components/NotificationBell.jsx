import React, { useEffect, useState, useRef } from "react";
import { Bell, Check, Trash2, Info, AlertTriangle, X, Sparkles, Filter, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../api/clientflow";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [opened, setOpened] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bellRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const data = await api.listNotifications({ unreadOnly: true });
      setCount(data?.data?.length || 0);
    } catch (err) {
      console.error("Error fetching notification count", err);
    }
  };

  const fetchLastNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listNotifications();
      setItems(data?.data || []);
    } catch (err) {
      setError("Impossible de charger les notifications");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 45000); // 45 seconds refresh
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpened(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = async () => {
    const next = !opened;
    setOpened(next);
    if (next) {
      await fetchLastNotifications();
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setItems(items.map(n => n.id === id ? { ...n, is_read: true } : n));
      setCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setItems(items.map(n => ({ ...n, is_read: true })));
      setCount(0);
    } catch (err) {
      setError("Erreur lors du marquage des notifications");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      setItems(items.filter(n => n.id !== id));
      // Optionally update count if it was unread
      const deletedWasUnread = items.find(n => n.id === id)?.is_read === false;
      if (deletedWasUnread) setCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error deleting notification", err);
    }
  };

  return (
    <div className="relative" ref={bellRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={toggleOpen}
        className={`relative p-3.5 rounded-[18px] transition-all duration-300 border ${opened
          ? "bg-primary border-primary text-white shadow-xl shadow-blue-500/40"
          : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:border-primary/30"
          }`}
      >
        <Bell size={20} strokeWidth={2.5} className={count > 0 ? "animate-[swing_2s_ease-in-out_infinite]" : ""} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-red-500 border-2 border-white px-1 text-[10px] font-black text-white shadow-lg">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
            className="absolute right-0 mt-4 w-[420px] rounded-[28px] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden z-[100] border border-slate-200"
          >
            {/* Header */}
            <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" /> Notifications
                </h3>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1">{count} messages non lus</p>
              </div>
              <button
                onClick={handleMarkAllRead}
                disabled={items.every(n => n.is_read)}
                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                Tout marquer lu
              </button>
            </div>

            {/* List */}
            <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
              {loading && items.length === 0 && (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">Synchronisation...</span>
                </div>
              )}

              {error && (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={24} />
                  </div>
                  <p className="text-xs text-red-500 font-bold">{error}</p>
                </div>
              )}

              {!loading && items.length === 0 && (
                <div className="p-24 flex flex-col items-center justify-center gap-6 text-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <Bell size={40} strokeWidth={1.5} />
                    </div>
                    <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-1 -right-1 text-primary/30">
                      <Sparkles size={24} />
                    </motion.div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Silence absolu</p>
                    <p className="text-[11px] text-slate-400 font-medium tracking-tight">Aucune alerte capturée pour le moment.</p>
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {items.map((n) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    key={n.id}
                    onClick={async () => {
                      if (!n.is_read) await handleMarkRead(n.id);
                      if (n.meta) {
                        try {
                          const meta = typeof n.meta === 'string' ? JSON.parse(n.meta) : n.meta;
                          if (meta.page) {
                            navigate(meta.page);
                            setOpened(false);
                          }
                        } catch (e) {
                          console.error("Error parsing notification meta", e);
                        }
                      }
                    }}
                    className={`px-8 py-6 border-b border-slate-50 last:border-0 cursor-pointer transition-all relative group ${n.is_read ? "opacity-50 grayscale-[0.5]" : "bg-primary/[0.03] hover:bg-white"
                      }`}
                  >
                    {!n.is_read && (
                      <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary rounded-r-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                    )}
                    <div className="flex gap-5">
                      <div className={`mt-1 h-12 w-12 rounded-[18px] flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-110 duration-300 ${n.type === 'alert' ? 'bg-red-50 text-red-500 border-red-500/10' : 'bg-primary/5 text-primary border-primary/10'
                        }`}>
                        {n.type === 'alert' ? <AlertTriangle size={24} strokeWidth={2.5} /> : <Info size={24} strokeWidth={2.5} />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-[13px] font-black text-slate-900 truncate tracking-tight">{n.title}</p>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={(e) => handleDelete(e, n.id)}
                              className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                        <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2 font-medium tracking-tight pr-4">{n.message}</p>
                        {!n.is_read && (
                          <div className="mt-4 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Prioritaire</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
              <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-primary transition-all uppercase tracking-[0.2em] group">
                <Filter size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                Afficher l'historique complet
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

