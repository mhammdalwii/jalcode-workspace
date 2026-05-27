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

export default function ContentModal({ isOpen, onClose, onSuccess, editData, teams }: ContentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    platform: "Instagram",
    status: "Ide",
    pillar: "Edukasi",
    priority: "Sedang",
    asset_url: "",
    publish_date: "",
    pic_ids: [] as number[],
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          title: editData.title,
          platform: editData.platform,
          status: editData.status,
          pillar: editData.pillar || "Edukasi",
          priority: editData.priority || "Sedang",
          asset_url: editData.asset_url || "",
          publish_date: editData.publish_date ? editData.publish_date.split("T")[0] : "",
          pic_ids: editData.pics ? editData.pics.map((p) => p.id) : [],
          notes: editData.notes || "",
        });
      } else {
        setFormData({
          title: "",
          platform: "Instagram",
          status: "Ide",
          pillar: "Edukasi",
          priority: "Sedang",
          asset_url: "",
          publish_date: "",
          pic_ids: [],
          notes: "",
        });
      }
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const togglePic = (id: number) => {
    setFormData((prev) => {
      if (prev.pic_ids.includes(id)) {
        return { ...prev, pic_ids: prev.pic_ids.filter((picId) => picId !== id) };
      } else {
        return { ...prev, pic_ids: [...prev.pic_ids, id] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pic_ids.length === 0) return toast.error("Pilih minimal 1 orang PIC!");

    setIsSubmitting(true);
    try {
      const url = editData ? `${process.env.NEXT_PUBLIC_API_URL}/api/contents/${editData.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/contents/`;
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan konten");
      }

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Platform <span className="text-red-500">*</span>
              </label>
              <select value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-white">
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Blog SEO">Blog SEO</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-white">
                <option value="Ide">Ideation</option>
                <option value="Drafting">Drafting</option>
                <option value="Review">Review</option>
                <option value="Terjadwal">Terjadwal</option>
                <option value="Publish">Publish</option>
              </select>
            </div>
          </div>

          {/* 🚀 BARIS BARU: PILAR & PRIORITAS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Pilar Konten <span className="text-red-500">*</span>
              </label>
              <select value={formData.pillar} onChange={(e) => setFormData({ ...formData, pillar: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-white">
                <option value="Edukasi">Edukasi & Tips</option>
                <option value="Portofolio Proyek">Portofolio Proyek</option>
                <option value="Hard Selling">Hard Selling</option>
                <option value="Behind the Scene">Behind the Scene</option>
                <option value="Artikel SEO">Artikel SEO</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Prioritas <span className="text-red-500">*</span>
              </label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-white">
                <option value="Tinggi">Tinggi 🔴</option>
                <option value="Sedang">Sedang 🟡</option>
                <option value="Rendah">Rendah 🟢</option>
              </select>
            </div>
          </div>

          {/* 🚀 BARIS BARU: URL LINK ASET */}
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

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Pilih PIC Tim (Bisa lebih dari 1) <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-xl max-h-32 overflow-y-auto p-2 bg-gray-50/50 space-y-1">
              {teams.map((t) => {
                const isSelected = formData.pic_ids.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => togglePic(t.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors border ${isSelected ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" : "bg-white border-transparent text-gray-700 hover:bg-gray-100"}`}
                  >
                    <span>
                      {t.name} <span className="text-[10px] text-gray-400 ml-1">({t.role})</span>
                    </span>
                    {isSelected && <Check size={16} className="text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tgl Tayang (Opsional)</label>
              <input
                type="date"
                value={formData.publish_date}
                onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-white text-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Tambahan (Opsional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-blue-500 outline-none resize-none text-sm bg-white"
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
