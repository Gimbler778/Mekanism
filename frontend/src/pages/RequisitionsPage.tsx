import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requisitionApi } from "../lib/api";
import { cn, STATUS_COLORS, formatDate } from "../lib/utils";
import { Plus, Search, FileText, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const STATUSES = ["draft", "pending_approval", "approved", "open", "on_hold", "closed", "cancelled"];

const RequisitionForm = ({ onClose }: any) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "", department: "", location: "", description: "", requirements: "",
    numberOfOpenings: 1, experienceMin: 0, experienceMax: 5,
    targetStartDate: "", closingDate: "", skills: "",
  });

  const mutation = useMutation({
    mutationFn: (data: any) => requisitionApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["requisitions"] }); onClose(); },
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg">Create Job Requisition</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Job Title *</label>
            <input className="input-field" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior React Developer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Department</label>
              <input className="input-field" value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="Engineering" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Location</label>
              <input className="input-field" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Ahmedabad / Remote" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea className="input-field resize-none" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Requirements</label>
            <textarea className="input-field resize-none" rows={3} value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Skills (comma-separated)</label>
            <input className="input-field" value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, TypeScript, Node.js" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Openings</label>
              <input type="number" min="1" className="input-field" value={form.numberOfOpenings} onChange={(e) => set("numberOfOpenings", Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Exp. Min (yrs)</label>
              <input type="number" min="0" className="input-field" value={form.experienceMin} onChange={(e) => set("experienceMin", Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Exp. Max (yrs)</label>
              <input type="number" min="0" className="input-field" value={form.experienceMax} onChange={(e) => set("experienceMax", Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Target Start Date</label>
              <input type="date" className="input-field" value={form.targetStartDate} onChange={(e) => set("targetStartDate", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Closing Date</label>
              <input type="date" className="input-field" value={form.closingDate} onChange={(e) => set("closingDate", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent">Cancel</button>
          <button
            onClick={() =>
              mutation.mutate({
                ...form,
                skills: form.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
                status: "draft",
              })
            }
            disabled={mutation.isPending || !form.title}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending ? "Creating..." : "Create Requisition"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const RequisitionsPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["requisitions", search, status],
    queryFn: () => requisitionApi.list({ search: search || undefined, status: status || undefined }).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => requisitionApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requisitions"] }),
  });

  const requisitions = data?.data || [];
  const canApprove = user?.role === "admin" || user?.role === "hr";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Requisitions</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Create and manage job requisitions</p>
        </div>
        {canApprove && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New Requisition
          </button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input className="input-field pl-9" placeholder="Search requisitions..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : requisitions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
            <FileText className="h-8 w-8 opacity-30" />
            <p className="text-sm">No requisitions found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Code</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Department</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Openings</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Closing</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requisitions.map((r: any) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{r.requisitionCode}</td>
                  <td className="px-5 py-3.5 font-medium">{r.title}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.department || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", STATUS_COLORS[r.status])}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">{r.numberOfOpenings}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.closingDate ? formatDate(r.closingDate) : "—"}</td>
                  <td className="px-5 py-3.5">
                    {canApprove && r.status === "pending_approval" && (
                      <button
                        onClick={() => approveMutation.mutate(r.id)}
                        disabled={approveMutation.isPending}
                        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <RequisitionForm onClose={() => setShowForm(false)} />}

      <style>{`
        .input-field { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem; border: 1px solid hsl(var(--input)); background: hsl(var(--background)); font-size: 0.875rem; outline: none; }
        .input-field:focus { box-shadow: 0 0 0 2px hsl(var(--ring) / 0.3); }
      `}</style>
    </div>
  );
};
