import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
    publish_date: "",
    team_member_id: 0,
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          title: editData.title,
          platform: editData.platform,
          status: editData.status,
          publish_date: editData.publish_date ? editData.publish_date.split("T")[0] : "",
          team_member_id: editData.pic?.id || 0,
          notes: editData.notes || "",
        });
      } else {
        setFormData({ title: "", platform: "Instagram", status: "Ide", publish_date: "", team_member_id: teams[0]?.id || 0, notes: "" });
      }
    }
  }, [isOpen, editData, teams]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Pastikan team_member_id dikonversi ke angka
    const payload = { ...formData, team_member_id: Number(formData.team_member_id) };

    try {
      const url = editData ? `${process.env.NEXT_PUBLIC_API_URL}/api/contents/${editData.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/contents/`;
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify(payload),
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">{editData ? "Edit Rencana Konten" : "Tambah Ide Konten Baru"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Judul / Topik Konten</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Misal: 5 Tips Optimasi SEO Next.js"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Platform</label>
              <select value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Blog SEO">Blog SEO</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Ide">Ideation</option>
                <option value="Drafting">Drafting</option>
                <option value="Review">Review</option>
                <option value="Terjadwal">Terjadwal</option>
                <option value="Publish">Publish</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">PIC (Penanggung Jawab)</label>
              <select
                required
                value={formData.team_member_id}
                onChange={(e) => setFormData({ ...formData, team_member_id: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tgl Tayang (Opsional)</label>
              <input type="date" value={formData.publish_date} onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Referensi link, hashtag, dll..."
            ></textarea>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              {isSubmitting ? "Menyimpan..." : "Simpan Konten"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
