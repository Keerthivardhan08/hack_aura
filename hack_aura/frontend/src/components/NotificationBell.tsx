"use client";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/supabase";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "deadline" | "update" | "general";
  read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
    });
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data);
    }
  };

  const subscribeToNotifications = () => {
    return supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter((n) => n.type === "deadline" && !n.read).length;

  const markAsRead = async (id: number) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
  };

  const markAllAsRead = async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user?.id);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) markAllAsRead();
        }}
        className="notification-bell relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
        {urgentCount > 0 && (
          <span className="urgent-badge">{urgentCount > 9 ? "9+" : urgentCount}</span>
        )}
        {unreadCount > 0 && !urgentCount && (
          <span className="unread-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-200">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer ${
                      !notification.read ? "bg-gray-700/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {notification.type === "deadline" && (
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                        )}
                        {notification.type === "update" && (
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                        )}
                        {notification.type === "general" && (
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-purple-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-200 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}