import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Building2, FileText, Users, TrendingUp, Award } from "lucide-react";

const COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#f97316", "#6366f1", "#10b981", "#ef4444", "#6b7280"];

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </div>
  </div>
);

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => analyticsApi.dashboard().then((r) => r.data.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  const totals = data?.totals || {};
  const pipeline = data?.pipeline || [];
  const topVendors = data?.topVendors || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Good morning, {user?.firstName} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your ATS today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Requisitions" value={totals.openRequisitions ?? "—"} icon={FileText} color="bg-blue-500" />
        <StatCard label="Total Submissions" value={totals.submissions ?? "—"} icon={Users} color="bg-purple-500" />
        <StatCard label="Active Vendors" value={totals.activeVendors ?? "—"} icon={Building2} color="bg-emerald-500" />
        <StatCard label="Total Hires" value={totals.hires ?? "—"} icon={TrendingUp} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Candidate Pipeline</h2>
          {pipeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipeline} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.replace(/_/g, " ")}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => [v, "Candidates"]}
                  labelFormatter={(l) => l.replace(/_/g, " ")}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              No pipeline data yet
            </div>
          )}
        </div>

        {/* Top vendors */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            Top Performing Vendors
          </h2>
          {topVendors.length > 0 ? (
            <div className="space-y-3">
              {topVendors.map((v: any, i: number) => (
                <div key={v.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{v.companyName}</span>
                      <span className="text-xs text-muted-foreground">
                        {v.totalHires} hires / {Number(v.hiringRatio).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(Number(v.hiringRatio), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              No vendor data yet
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Add Vendor", href: "/vendors" },
            { label: "Create Requisition", href: "/requisitions" },
            { label: "Submit Candidate", href: "/submissions" },
            { label: "View Reports", href: "/analytics" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
