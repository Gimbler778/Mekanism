import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, FunnelChart, Funnel, LabelList,
} from "recharts";
import { cn, STATUS_COLORS } from "../lib/utils";

const COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#f97316", "#6366f1", "#10b981", "#ef4444", "#6b7280", "#14b8a6"];

const PIPELINE_ORDER = [
  "submitted", "screened", "shortlisted", "interview_scheduled",
  "interview_completed", "offer_extended", "hired",
];

export const AnalyticsPage = () => {
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => analyticsApi.dashboard().then((r) => r.data.data),
  });

  const { data: vendorData, isLoading: vendorLoading } = useQuery({
    queryKey: ["vendor-report"],
    queryFn: () => analyticsApi.vendorReport().then((r) => r.data.data),
  });

  const pipeline = (dashData?.pipeline || [])
    .filter((p: any) => PIPELINE_ORDER.includes(p.status))
    .sort((a: any, b: any) => PIPELINE_ORDER.indexOf(a.status) - PIPELINE_ORDER.indexOf(b.status));

  const funnelData = pipeline.map((p: any) => ({
    name: p.status.replace(/_/g, " "),
    value: p.count,
  }));

  const vendorChartData = (vendorData || [])
    .filter((v: any) => v.totalSubmissions > 0)
    .slice(0, 10)
    .map((v: any) => ({
      name: v.companyName.length > 15 ? v.companyName.slice(0, 15) + "…" : v.companyName,
      submissions: v.totalSubmissions,
      hires: v.totalHires,
      ratio: Number(v.hiringRatio),
    }));

  if (dashLoading || vendorLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Insights into your hiring pipeline and vendor performance</p>
      </div>

      {/* Pipeline funnel */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold mb-1">Hiring Pipeline Funnel</h2>
        <p className="text-xs text-muted-foreground mb-4">Candidate progression through stages</p>
        {funnelData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
              <Tooltip formatter={(v) => [v, "Candidates"]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No pipeline data available</div>
        )}
      </div>

      {/* Vendor performance */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold mb-1">Vendor Submission vs. Hires</h2>
        <p className="text-xs text-muted-foreground mb-4">Top 10 vendors by submission volume</p>
        {vendorChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={vendorChartData} margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-40} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="submissions" fill="#3b82f6" name="Submissions" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hires" fill="#10b981" name="Hires" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No vendor data available</div>
        )}
      </div>

      {/* Vendor table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Vendor Performance Report</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Vendor</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-5 py-3 font-medium text-muted-foreground">Submissions</th>
              <th className="text-right px-5 py-3 font-medium text-muted-foreground">Hires</th>
              <th className="text-right px-5 py-3 font-medium text-muted-foreground">Hire Rate</th>
              <th className="text-right px-5 py-3 font-medium text-muted-foreground">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(vendorData || []).length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-sm">No vendor data</td></tr>
            ) : (vendorData || []).map((v: any) => (
              <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5 font-medium">{v.companyName}</td>
                <td className="px-5 py-3.5">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", STATUS_COLORS[v.status])}>
                    {v.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">{v.totalSubmissions}</td>
                <td className="px-5 py-3.5 text-right">{v.totalHires}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className={cn("font-medium", Number(v.hiringRatio) > 20 ? "text-emerald-600" : "text-muted-foreground")}>
                    {Number(v.hiringRatio).toFixed(1)}%
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-amber-400">★</span>
                    <span>{Number(v.rating).toFixed(1)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
