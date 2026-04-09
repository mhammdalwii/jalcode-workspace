import { useState, useEffect } from "react";
import { X, Shield, Plus, Copy, Eye, EyeOff, Trash2, ExternalLink, Key, Calendar } from "lucide-react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Credential, Client } from "@/types";

interface CredentialPanelProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function CredentialPanel({ isOpen, onClose, client }: CredentialPanelProps) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // State untuk melacak password mana saja yang sedang di-Unmask (dilihat)
  const [visiblePasswords, setVisiblePasswords] = useState<number[]>([]);

  // State untuk form tambah baru
  const [formData, setFormData] = useState({
    type: "cPanel",
    url: "",
    username: "",
    password: "",
    expiry_date: "",
    notes: "",
  });

  // Tarik data saat panel dibuka
  useEffect(() => {
    if (isOpen && client) {
      fetchCredentials();
      setIsFormOpen(false); // Tutup form jika pindah klien
      setVisiblePasswords([]); // Sembunyikan semua password
    }
  }, [isOpen, client]);

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/clients/${client?.id}/credentials`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      if (!res.ok) throw new Error("Gagal memuat brankas");
      const data = await res.json();
      setCredentials(data.data || []);
    } catch (err) {
      toast.error("Gagal memuat kredensial klien");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/clients/${client?.id}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Gagal menyimpan ke brankas");

      toast.success("Kredensial berhasil diamankan! 🔒");
      setFormData({ type: "cPanel", url: "", username: "", password: "", expiry_date: "", notes: "" });
      setIsFormOpen(false);
      fetchCredentials();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus akses ini permanen?")) return;
    try {
      await fetch(`http://localhost:8080/api/credentials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      toast.success("Akses dihapus");
      fetchCredentials();
    } catch (err) {
      toast.error("Gagal menghapus akses");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin!`, { icon: "📋" });
  };

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords((prev) => (prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]));
  };

  if (!isOpen || !client) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-slate-50 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        {/* HEADER PANEL */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Brankas Klien</h2>
              <p className="text-xs text-slate-400">{client.company} - Terenkripsi AES-256</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* AREA KONTEN */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TOMBOL TAMBAH BARU */}
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full mb-6 py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl font-medium hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex justify-center items-center gap-2"
            >
              <Plus size={18} /> Tambah Akses Baru
            </button>
          )}

          {/* FORM TAMBAH BARU */}
          {isFormOpen && (
            <form onSubmit={handleAddCredential} className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Key size={16} className="text-emerald-500" /> Akses Baru
                </h3>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Tipe Akses</label>
                  <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none">
                    <option value="cPanel">cPanel</option>
                    <option value="WordPress">WordPress</option>
                    <option value="FTP">FTP / SSH</option>
                    <option value="Database">Database</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Tenggat Hosting (Opsional)</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">URL Login (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Password</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Catatan</label>
                <input
                  type="text"
                  placeholder="Misal: Port 2083"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition">
                {isLoading ? "Mengamankan..." : "Simpan ke Brankas"}
              </button>
            </form>
          )}

          {/* DAFTAR KREDENSIAL */}
          <div className="space-y-4">
            {credentials.length === 0 && !isFormOpen && <div className="text-center py-10 text-slate-400">Belum ada kredensial yang disimpan.</div>}

            {credentials.map((cred) => {
              const isVisible = visiblePasswords.includes(cred.id);
              return (
                <div key={cred.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group">
                  {/* Card Header */}
                  <div className="bg-slate-100/50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-md">{cred.type}</span>
                      {cred.url && (
                        <a href={cred.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition" title="Buka URL">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    <button onClick={() => handleDelete(cred.id)} className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Username */}
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Username</span>
                        <span className="text-sm font-medium text-slate-800 font-mono">{cred.username}</span>
                      </div>
                      <button onClick={() => copyToClipboard(cred.username, "Username")} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition">
                        <Copy size={16} />
                      </button>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Password</span>
                        <span className="text-sm font-medium text-slate-800 font-mono truncate">{isVisible ? cred.password : "••••••••••••••••"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => togglePasswordVisibility(cred.id)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition">
                          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={() => copyToClipboard(cred.password, "Password")} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition">
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Footer / Notes / Expiry */}
                    {(cred.notes || cred.expiry_date) && (
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-500 truncate pr-2" title={cred.notes}>
                          {cred.notes}
                        </span>

                        {cred.expiry_date && cred.expiry_date !== "0001-01-01T00:00:00Z" && (
                          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 bg-amber-50 text-amber-600 rounded">
                            <Calendar size={12} />
                            {new Date(cred.expiry_date).toLocaleDateString("id-ID")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
