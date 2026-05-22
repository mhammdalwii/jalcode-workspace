import { useState, useEffect } from "react";
import { X, Plus, Trash2, Calculator } from "lucide-react";
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

  // State Utama
  const [formData, setFormData] = useState({
    project_id: 0,
    status: "Unpaid",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    service_type: "Web App Development",
    notes: "",
  });

  // 🚀 STATE UNTUK RINCIAN ITEM
  const [items, setItems] = useState([{ description: "DP Pengerjaan Sistem (40%)", quantity: 1, price: 0, total: 0 }]);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          project_id: editData.project_id,
          status: editData.status,
          issue_date: editData.issue_date ? editData.issue_date.split("T")[0] : "",
          due_date: editData.due_date ? editData.due_date.split("T")[0] : "",
          service_type: editData.service_type || "Web App Development",
          notes: editData.notes || "",
        });
        // 🚀 Load items jika sedang mode Edit
        if (editData.items && editData.items.length > 0) {
          setItems(
            editData.items.map((i) => ({
              description: i.description,
              quantity: i.quantity,
              price: i.price,
              total: i.total,
            })),
          );
        }
      } else {
        setFormData({
          project_id: projects.length > 0 ? projects[0].id : 0,
          status: "Unpaid",
          issue_date: new Date().toISOString().split("T")[0],
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          service_type: "Web App Development",
          notes: "",
        });
        setItems([{ description: "DP Pengerjaan Sistem (40%)", quantity: 1, price: 0, total: 0 }]);
      }
    }
  }, [isOpen, editData, projects]);

  if (!isOpen) return null;

  // Fungsi update item dinamis
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items] as any;
    newItems[index][field] = value;

    // Auto hitung total per baris
    if (field === "price" || field === "quantity") {
      newItems[index].total = newItems[index].price * newItems[index].quantity;
    }
    setItems(newItems);
  };

  // Hitung total keseluruhan untuk dikirim ke field 'amount' di backend
  const grandTotal = items.reduce((acc, curr) => acc + curr.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.project_id === 0) return toast.error("Silakan pilih proyek klien!");
    if (grandTotal <= 0) return toast.error("Total tagihan tidak boleh nol!");

    setIsSubmitting(true);
    const payload = {
      ...formData,
      project_id: Number(formData.project_id),
      amount: grandTotal, // Total otomatis dari rincian
      items: items, // Rincian item
    };

    try {
      const url = editData ? `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${editData.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/`;
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan tagihan");

      toast.success(`Tagihan berhasil ${editData ? "diperbarui" : "diterbitkan"}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{editData ? "Edit Tagihan" : "Terbitkan Tagihan Baru"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* INFO DASAR */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Proyek Klien</label>
              <select required value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-xl text-sm outline-none bg-slate-50">
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
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm outline-none">
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* 🚀 TABEL RINCIAN ITEM DINAMIS */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Rincian Pekerjaan</label>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-100 group">
                  <div className="flex-1">
                    <input
                      placeholder="Deskripsi (misal: Desain UI/UX)"
                      className="w-full bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none text-sm py-1 mb-2 font-medium"
                      value={item.description}
                      onChange={(e) => updateItem(idx, "description", e.target.value)}
                    />
                    <div className="flex gap-4">
                      <div className="w-20">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Qty</p>
                        <input type="number" className="w-full bg-transparent outline-none text-sm font-bold" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Harga Satuan</p>
                        <input type="number" className="w-full bg-transparent outline-none text-sm font-bold text-blue-600" value={item.price} onChange={(e) => updateItem(idx, "price", Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 pt-1">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setItems([...items, { description: "", quantity: 1, price: 0, total: 0 }])} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition">
                <Plus size={14} /> Tambah Baris
              </button>
            </div>
          </div>

          {/* TOTAL & TANGGAL */}
          <div className="bg-slate-900 rounded-2xl p-4 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Calculator size={20} />
              </div>
              <p className="text-sm font-medium text-slate-300">Total Tagihan</p>
            </div>
            <p className="text-2xl font-black">Rp {grandTotal.toLocaleString("id-ID")}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Terbit</label>
              <input required type="date" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jatuh Tempo</label>
              <input required type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm outline-none text-red-600 font-bold" />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-100 disabled:bg-slate-300">
            {isSubmitting ? "Memproses..." : editData ? "Update Tagihan" : "Terbitkan Tagihan"}
          </button>
        </form>
      </div>
    </div>
  );
}
