import React, { useEffect, useState } from "react";
import { api } from "../api/clientflow";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [opened, setOpened] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const data = await api.listNotifications({ unreadOnly: true });
      setCount(data?.data?.length || 0);
    } catch {
      // on ignore les erreurs silencieusement ici
    }
  };

  const fetchLastNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.listNotifications();
      setItems(data?.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const toggleOpen = async () => {
    const next = !opened;
    setOpened(next);
    if (next) {
      await fetchLastNotifications();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md transition"
        aria-label="Notifications"
      >
        <span className="mr-1">🔔</span>
        {count > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {opened && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-xl ring-1 ring-black/5 z-20">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">
              Notifications récentes
            </p>
            <button
              type="button"
              className="text-[10px] text-indigo-600 hover:underline"
              onClick={async () => {
                await api.markAllNotificationsRead();
                setCount(0);
                fetchLastNotifications();
              }}
            >
              Tout marquer comme lu
            </button>
          </div>
          <div className="max-h-72 overflow-auto text-xs">
            {loading ? (
              <p className="px-3 py-2 text-slate-500">Chargement...</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-2 text-slate-500">
                Aucune notification pour le moment.
              </p>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`px-3 py-2 border-b border-slate-100 last:border-0 ${
                    n.is_read ? "bg-white" : "bg-indigo-50/60"
                  }`}
                >
                  <p className="font-semibold text-slate-800 mb-0.5">
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-slate-600 mb-0.5">{n.body}</p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

