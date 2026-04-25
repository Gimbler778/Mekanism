import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard, Building2, FileText, Users, BarChart3,
  LogOut, Bell, Settings,
} from "lucide-react";
import { cn } from "../lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

type UserPreferences = {
  compactSidebar: boolean;
};

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/vendors", icon: Building2, label: "Vendors" },
  { to: "/requisitions", icon: FileText, label: "Requisitions" },
  { to: "/submissions", icon: Users, label: "Candidates" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Demo submission received",
    message: "A sample candidate activity was added to the feed.",
    timestamp: "2m ago",
    read: false,
  },
  {
    id: "2",
    title: "Demo requisition update",
    message: "A sample requisition was marked as approved.",
    timestamp: "1h ago",
    read: false,
  },
  {
    id: "3",
    title: "Demo analytics ready",
    message: "A sample weekly summary is available for review.",
    timestamp: "Yesterday",
    read: true,
  },
];

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window === "undefined") {
      return {
        compactSidebar: false,
      };
    }

    try {
      const stored = window.localStorage.getItem("mekanism-ui-preferences");
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UserPreferences>;
        return {
          compactSidebar: parsed.compactSidebar ?? false,
        };
      }
    } catch {
      // Ignore invalid persisted preferences.
    }

    return {
      compactSidebar: false,
    };
  });

  const unreadCount = useMemo(
    () => DEMO_NOTIFICATIONS.filter((item) => !item.read).length,
    []
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((current) => {
      const next = !current;
      if (next) {
        setIsSettingsOpen(false);
      }
      return next;
    });
  };

  const toggleSettings = () => {
    setIsSettingsOpen((current) => {
      const next = !current;
      if (next) {
        setIsNotificationsOpen(false);
      }
      return next;
    });
  };

  const updatePreference = (key: keyof UserPreferences, value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    window.localStorage.setItem("mekanism-ui-preferences", JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target) &&
        settingsRef.current &&
        !settingsRef.current.contains(target)
      ) {
        setIsNotificationsOpen(false);
        setIsSettingsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "??";
  const avatarSeed = user
    ? encodeURIComponent(`${user.firstName}-${user.lastName}-${user.email}`)
    : "guest";
  const avatarUrl =
    user?.avatarUrl ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${avatarSeed}`;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex-shrink-0 border-r border-border bg-card flex flex-col transition-[width]",
          preferences.compactSidebar ? "w-20" : "w-60"
        )}
      >
        {/* Logo */}
        <div className={cn("h-16 flex items-center border-b border-border", preferences.compactSidebar ? "justify-center px-3" : "px-6") }>
          <div className={cn("flex items-center gap-2.5", preferences.compactSidebar && "justify-center") }>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div className={cn(preferences.compactSidebar && "hidden")}>
              <p className="font-semibold text-sm leading-none">MekaHire</p>
              <p className="text-xs text-muted-foreground mt-0.5">ATS Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 py-4 space-y-1", preferences.compactSidebar ? "px-2" : "px-3")}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md text-sm transition-colors",
                  preferences.compactSidebar ? "justify-center px-0 py-3" : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className={cn(preferences.compactSidebar && "sr-only")}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className={cn("border-t border-border", preferences.compactSidebar ? "p-2" : "p-3")}>
          <div className={cn("flex items-center rounded-md hover:bg-accent cursor-pointer group", preferences.compactSidebar ? "justify-center gap-0 px-0 py-2" : "gap-3 px-3 py-2")}>
            <img
              src={avatarUrl}
              alt={`${user?.firstName || "User"} avatar`}
              className={cn(
                "h-8 w-8 rounded-full object-cover flex-shrink-0 bg-primary/10",
                preferences.compactSidebar && "hidden"
              )}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div
              className={cn(
                "h-8 w-8 rounded-full bg-primary/10 items-center justify-center flex-shrink-0",
                preferences.compactSidebar ? "flex" : "hidden"
              )}
            >
              <span className="text-xs font-semibold text-primary">{initials}</span>
            </div>
            <div className={cn("flex-1 min-w-0", preferences.compactSidebar && "hidden")}>
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground capitalize truncate">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-end px-6 gap-3 flex-shrink-0 relative">
          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              aria-label="Open notifications"
              title="Notifications"
              onClick={toggleNotifications}
              className={cn(
                "h-9 w-9 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors relative",
                isNotificationsOpen && "bg-accent"
              )}
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-md border border-border bg-card shadow-lg p-3 z-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Demo notifications</h3>
                </div>

                <div className="space-y-2 max-h-80 overflow-auto">
                  {DEMO_NOTIFICATIONS.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "w-full text-left p-2 rounded-md border transition-colors",
                        item.read
                          ? "border-transparent bg-transparent"
                          : "border-border bg-accent/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{item.title}</p>
                        {!item.read && <span className="h-2 w-2 rounded-full bg-primary mt-1" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.message}</p>
                      <p className="text-[11px] text-muted-foreground mt-2">{item.timestamp}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">Demo feed only; no live notification source is connected.</p>
              </div>
            )}
          </div>

          <div ref={settingsRef} className="relative">
            <button
              type="button"
              aria-label="Open settings"
              title="Settings"
              onClick={toggleSettings}
              className={cn(
                "h-9 w-9 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors",
                isSettingsOpen && "bg-accent"
              )}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-md border border-border bg-card shadow-lg p-3 z-50">
                <h3 className="text-sm font-semibold mb-3">Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between gap-3 text-sm">
                    <span>Compact sidebar</span>
                    <input
                      type="checkbox"
                      checked={preferences.compactSidebar}
                      onChange={(e) => updatePreference("compactSidebar", e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent text-destructive"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="p-6 animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
