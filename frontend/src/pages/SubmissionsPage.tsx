import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { submissionApi, requisitionApi } from "../lib/api";
import { cn, STATUS_COLORS, formatDate } from "../lib/utils";
import { Plus, Search, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const CANDIDATE_STATUSES = [
  "submitted", "screened", "shortlisted", "interview_scheduled",
  "interview_completed", "offer_extended", "hired", "rejected", "withdrawn",
];

const SubmitCandidateForm = ({ onClose }: any) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", linkedinUrl: "",
    resumeUrl: "", currentTitle: "", currentCompany: "", totalExperience: "",
    location: "", expectedSalary: "", noticePeriod: "", coverNote: "",
    requisitionId: "", skills: "",
  });

  const { data: reqData } = useQuery({
    queryKey: ["requisitions-list"],
    queryFn: () => requisitionApi.list({ status: "open", limit: 100 }).then((r) => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => submissionApi.submit(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["submissions"] }); onClose(); },
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg">Submit Candidate</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Requisition *</label>
            <select className="input-field" value={form.requisitionId} onChange={(e) => set("requisitionId", e.target.value)}>
              <option value="">Select a requisition...</option>
              {(reqData || []).map((r: any) => (
                <option key={r.id} value={r.id}>{r.requisitionCode} — {r.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">First Name *</label>
              <input className="input-field" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Last Name *</label>
              <input className="input-field" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input type="email" className="input-field" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input className="input-field" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Title</label>
              <input className="input-field" value={form.currentTitle} onChange={(e) => set("currentTitle", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Company</label>
              <input className="input-field" value={form.currentCompany} onChange={(e) => set("currentCompany", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Experience (yrs)</label>
              <input type="number" step="0.5" min="0" className="input-field" value={form.totalExperience} onChange={(e) => set("totalExperience", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Notice (days)</label>
              <input type="number" min="0" className="input-field" value={form.noticePeriod} onChange={(e) => set("noticePeriod", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Expected CTC</label>
              <input type="number" className="input-field" value={form.expectedSalary} onChange={(e) => set("expectedSalary", e.target.value)} placeholder="Annual (₹)" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Skills (comma-separated)</label>
            <input className="input-field" value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, Node.js, PostgreSQL" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Resume URL</label>
            <input type="url" className="input-field" value={form.resumeUrl} onChange={(e) => set("resumeUrl", e.target.value)} placeholder="https://drive.google.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Cover Note</label>
            <textarea className="input-field resize-none" rows={3} value={form.coverNote} onChange={(e) => set("coverNote", e.target.value)} />
          </div>
        </div>
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent">Cancel</button>
          <button
            onClick={() =>
              mutation.mutate({
                ...form,
                skills: form.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
                totalExperience: form.totalExperience || undefined,
                noticePeriod: form.noticePeriod ? Number(form.noticePeriod) : undefined,
                expectedSalary: form.expectedSalary || undefined,
              })
            }
            disabled={mutation.isPending || !form.email || !form.firstName || !form.requisitionId}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending ? "Submitting..." : "Submit Candidate"}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusUpdateModal = ({ submission, onClose }: any) => {
  const qc = useQueryClient();
  const [status, setStatus] = useState(submission.status);
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: () => submissionApi.updateStatus(submission.id, { status, notes }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["submissions"] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-sm">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Update Status</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Candidate: <strong>{submission.candidateName}</strong>
            </p>
            <label className="block text-sm font-medium mb-1.5">New Status</label>
            <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
              {CANDIDATE_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Notes</label>
            <textarea className="input-field resize-none" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50">
            {mutation.isPending ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SubmissionsPage = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["submissions", status],
    queryFn: () => submissionApi.list({ status: status || undefined }).then((r) => r.data),
  });

  const submissions = data?.data || [];
  const canSubmit = user?.role === "vendor" || user?.role === "admin" || user?.role === "hr";
  const canUpdateStatus = user?.role !== "vendor";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track candidate submissions and pipeline</p>
        </div>
        {canSubmit && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Submit Candidate
          </button>
        )}
      </div>

      {/* Pipeline chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatus("")}
          className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", !status ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent")}
        >
          All
        </button>
        {CANDIDATE_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize", status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent")}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
            <Users className="h-8 w-8 opacity-30" />
            <p className="text-sm">No submissions found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Candidate</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Requisition</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Vendor</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Experience</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Submitted</th>
                {canUpdateStatus && <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.map((s: any) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium">{s.candidateName}</p>
                      <p className="text-xs text-muted-foreground">{s.candidateEmail}</p>
                      {s.currentTitle && <p className="text-xs text-muted-foreground">{s.currentTitle}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium">{s.requisitionTitle}</p>
                      <p className="text-xs font-mono text-muted-foreground">{s.requisitionCode}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{s.vendorName}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", STATUS_COLORS[s.status])}>
                      {s.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{s.totalExperience ? `${s.totalExperience} yrs` : "—"}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatDate(s.submittedAt)}</td>
                  {canUpdateStatus && (
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedSubmission(s)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Update
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <SubmitCandidateForm onClose={() => setShowForm(false)} />}
      {selectedSubmission && <StatusUpdateModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />}

      <style>{`
        .input-field { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem; border: 1px solid hsl(var(--input)); background: hsl(var(--background)); font-size: 0.875rem; outline: none; }
        .input-field:focus { box-shadow: 0 0 0 2px hsl(var(--ring) / 0.3); }
      `}</style>
    </div>
  );
};
