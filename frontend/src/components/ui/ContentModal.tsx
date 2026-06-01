import { useState, useEffect } from "react";
import { X, Check, Link } from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { ContentPlan, TeamMember } from "@/types";

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData: ContentPlan | null;
  teams: TeamMember[];
}

const PLATFORM_OPTIONS = ["Instagram", "TikTok", "LinkedIn", "Blog SEO", "YouTube", "Twitter", "Facebook"];

export default function ContentModal({ isOpen, onClose, onSuccess, editData, teams }: ContentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    platform: ["Instagram"] as string[],
    status: "Ide",
    pillar: "Edukasi",
    priority: "Sedang",
    asset_url: "",
    start_date: "",
    publish_date: "",
    pic_ids: [] as number[],
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          title: editData.title,
          platform: Array.isArray(editData.platform) ? editData.platform : [],
          status: editData.status,
          pillar: editData.pillar || "Edukasi",
          priority: editData.priority || "Sedang",
          asset_url: editData.asset_url || "",
          start_date: editData.start_date ? editData.start_date.split("T")[0] : "",
          publish_date: editData.publish_date ? editData.publish_date.split("T")[0] : "",
          pic_ids: editData.pics ? editData.pics.map((p) => p.id) : [],
          notes: editData.notes || "",
        });
      } else {
        setFormData({
          title: "",
          platform: ["Instagram"],
          status: "Ide",
          pillar: "Edukasi",
          priority: "Sedang",
          asset_url: "",
          start_date: "",
          publish_date: "",
          pic_ids: [],
          notes: "",
        });
      }
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const togglePic = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      pic_ids: prev.pic_ids.includes(id) ? prev.pic_ids.filter((p) => p !== id) : [...prev.pic_ids, id],
    }));
  };

  const togglePlatform = (plat: string) => {
    setFormData((prev) => ({
      ...prev,
      platform: prev.platform.includes(plat) ? prev.platform.filter((p) => p !== plat) : [...prev.platform, plat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.platform.length === 0) return toast.error("Pilih minimal 1 Platform!");
    if (formData.pic_ids.length === 0) return toast.error("Pilih minimal 1 orang PIC!");

    // Validasi Tanggal
    if (formData.start_date && formData.publish_date && new Date(formData.start_date) > new Date(formData.publish_date)) {
      return toast.error("Tgl Mulai tidak boleh lebih besar dari Deadline!");
    }

    setIsSubmitting(true);
    try {
      const url = editData ? `${process.env.NEXT_PUBLIC_API_URL}/api/contents/${editData.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/contents/`;
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal menyimpan konten");

      toast.success(`Konten berhasil ${editData ? "diperbarui" : "ditambahkan"}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">{editData ? "Edit Rencana Konten" : "Tambah Ide Konten Baru"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Judul / Topik Konten <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm bg-white"
              placeholder="Misal: 5 Tips Optimasi SEO Next.js"
            />
          </div>

          {/* 🚀 PLATFORM BISA PILIH BANYAK */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Platform Distribusi <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((plat) => {
                const isSelected = formData.platform.includes(plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => togglePlatform(plat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${isSelected ? "bg-blue-100 text-blue-700 border-blue-300 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                  >
                    {plat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilar Konten</label>
              <select value={formData.pillar} onChange={(e) => setFormData({ ...formData, pillar: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-white">
                <option value="Edukasi">Edukasi & Tips</option>
                <option value="Portofolio Proyek">Portofolio Proyek</option>
                <option value="Hard Selling">Hard Selling</option>
                <option value="Behind the Scene">Behind the Scene</option>
                <option value="Artikel SEO">Artikel SEO</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prioritas</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-white">
                <option value="Tinggi">Tinggi 🔴</option>
                <option value="Sedang">Sedang 🟡</option>
                <option value="Rendah">Rendah 🟢</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
              <Link size={12} /> Tautan Aset / Draft (Opsional)
            </label>
            <input
              type="url"
              value={formData.asset_url}
              onChange={(e) => setFormData({ ...formData, asset_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm bg-white"
              placeholder="Link Google Docs, Figma, atau Canva..."
            />
          </div>

          {/* 🚀 RENTANG WAKTU (START - DEADLINE) */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mulai Dikerjakan</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-xs bg-white text-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deadline / Publish</label>
              <input
                type="date"
                value={formData.publish_date}
                onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-xs bg-white text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Pilih PIC Tim <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-200 rounded-xl max-h-24 overflow-y-auto p-1.5 bg-gray-50/50 space-y-1">
                {teams.map((t) => {
                  const isSelected = formData.pic_ids.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => togglePic(t.id)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors border ${isSelected ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "bg-white border-transparent text-gray-700 hover:bg-gray-100"}`}
                    >
                      <span>
                        {t.name.split(" ")[0]} <span className="text-[9px] text-gray-400">({t.role})</span>
                      </span>
                      {isSelected && <Check size={14} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Tambahan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-500 outline-none resize-none text-xs bg-white"
                placeholder="Referensi link, hashtag, dll..."
              ></textarea>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50">
              {isSubmitting ? "Menyimpan..." : "Simpan Konten"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
