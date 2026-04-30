import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { Invoice, Project } from "@/types";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData: Invoice | null;
  projects: Project[];
}

export default function InvoiceModal({ isOpen, onClose, onSuccess, editData, projects }: InvoiceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    project_id: 0,
    amount: 0,
    status: "Unpaid",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Default +14 hari
    service_type: "Web App Development",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          project_id: editData.project_id,
          amount: editData.amount,
          status: editData.status,
          issue_date: editData.issue_date ? editData.issue_date.split("T")[0] : "",
          due_date: editData.due_date ? editData.due_date.split("T")[0] : "",
          service_type: editData.service_type || "Web App Development",
          notes: editData.notes || "",
        });
      } else {
        setFormData({
          project_id: projects.length > 0 ? projects[0].id : 0,
          amount: 0,
          status: "Unpaid",
          issue_date: new Date().toISOString().split("T")[0],
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          service_type: "Web App Development",
          notes: "",
        });
      }
    }
  }, [isOpen, editData, projects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.project_id === 0) return toast.error("Silakan pilih proyek klien terlebih dahulu!");

    setIsSubmitting(true);
    const payload = {
      ...formData,
      project_id: Number(formData.project_id),
      // amount sudah otomatis berupa Number di state kita
    };

    try {
      const url = editData ? `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${editData.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/`;
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan tagihan");
      }

      toast.success(`Tagihan berhasil ${editData ? "diperbarui" : "diterbitkan"}!`);
      onSuccess();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">{editData ? "Edit Tagihan" : "Terbitkan Tagihan Baru"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Proyek Klien</label>
            <select
              required
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
            >
              <option value={0} disabled>
                -- Pilih Proyek --
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.client?.company || "Internal"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
              {/* 🚀 SIHIR FORMAT RUPIAH ADA DI SINI */}
              <input
                required
                type="text"
                value={formData.amount === 0 ? "" : formData.amount.toLocaleString("id-ID")}
                onChange={(e) => {
                  // Hapus semua karakter yang bukan angka (termasuk titik pemisah)
                  const rawValue = e.target.value.replace(/[^0-9]/g, "");
                  setFormData({ ...formData, amount: Number(rawValue) });
                }}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Misal: 5.000.000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status Pembayaran</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Unpaid">Belum Dibayar (Unpaid)</option>
                <option value="Paid">Lunas (Paid)</option>
                <option value="Overdue">Jatuh Tempo (Overdue)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori Layanan</label>
            <select value={formData.service_type} onChange={(e) => setFormData({ ...formData, service_type: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Web App Development">Web App Development</option>
              <option value="Mobile App Development">Mobile App Development</option>
              <option value="UI/UX & Brand Design">UI/UX & Brand Design</option>
              <option value="IoT & Smart Systems">IoT & Smart Systems</option>
              <option value="Academic & Tech Mentorship">Academic & Tech Mentorship</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Terbit</label>
              <input required type="date" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Jatuh Tempo</label>
              <input required type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Tagihan (Opsional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Misal: Termin 1 (DP 50%)"
            ></textarea>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              {isSubmitting ? "Menyimpan..." : "Simpan Tagihan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
