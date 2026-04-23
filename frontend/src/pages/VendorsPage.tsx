import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorApi } from "../lib/api";
import { cn, STATUS_COLORS, formatDate } from "../lib/utils";
import { Plus, Search, Star, Building2 } from "lucide-react";

const VENDOR_STATUSES = ["pending", "active", "inactive", "blacklisted"];

const VendorForm = ({ onClose, onSuccess }: any) => {
  const [form, setForm] = useState({
    companyName: "", website: "", address: "", city: "", country: "India",
    status: "pending", notes: "",
    contacts: [{ name: "", email: "", phone: "", designation: "", isPrimary: true }],
  });
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: any) => vendorApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vendors"] }); onSuccess(); onClose(); },
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg">Register New Vendor</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Company Name *</label>
            <input className="input-field" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">City</label>
              <input className="input-field" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Country</label>
              <input className="input-field" value={form.country} onChange={(e) => set("country", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Website</label>
            <input className="input-field" type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Notes</label>
            <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold mb-3">Primary Contact</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Name *</label>
                  <input className="input-field" value={form.contacts[0].name} onChange={(e) => set("contacts", [{ ...form.contacts[0], name: e.target.value }])} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Email *</label>
                  <input className="input-field" type="email" value={form.contacts[0].email} onChange={(e) => set("contacts", [{ ...form.contacts[0], email: e.target.value }])} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Phone</label>
                  <input className="input-field" value={form.contacts[0].phone} onChange={(e) => set("contacts", [{ ...form.contacts[0], phone: e.target.value }])} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Designation</label>
                  <input className="input-field" value={form.contacts[0].designation} onChange={(e) => set("contacts", [{ ...form.contacts[0], designation: e.target.value }])} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent">Cancel</button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.companyName}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : "Register Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const VendorsPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["vendors", search, status],
    queryFn: () => vendorApi.list({ search: search || undefined, status: status || undefined }).then((r) => r.data),
  });

  const vendors = data?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage vendor registrations and performance</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Register Vendor
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="input-field pl-9"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {VENDOR_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : vendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
            <Building2 className="h-8 w-8 opacity-30" />
            <p className="text-sm">No vendors found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Company</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Location</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Rating</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Submissions</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Hires</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendors.map((v: any) => (
                <tr key={v.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {v.companyName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{v.companyName}</p>
                        {v.website && <p className="text-xs text-muted-foreground">{v.website}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{[v.city, v.country].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", STATUS_COLORS[v.status])}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span>{Number(v.rating).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{v.totalSubmissions}</td>
                  <td className="px-5 py-3.5">{v.totalHires}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatDate(v.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <VendorForm onClose={() => setShowForm(false)} onSuccess={() => {}} />
      )}

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--input));
          background: hsl(var(--background));
          font-size: 0.875rem;
          outline: none;
          transition: box-shadow 0.15s;
        }
        .input-field:focus {
          box-shadow: 0 0 0 2px hsl(var(--ring) / 0.3);
        }
      `}</style>
    </div>
  );
};
