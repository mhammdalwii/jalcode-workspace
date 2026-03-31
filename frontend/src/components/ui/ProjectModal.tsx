/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Project, TeamMember } from "@/types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teams: TeamMember[];
  editData?: Project | null; // Jika ada isinya, berarti mode Edit. Jika kosong, mode Tambah.
}

export default function ProjectModal({ isOpen, onClose, onSuccess, teams, editData }: ProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Web Application",
    status: "Antrean",
    team_member_id: 0,
  });

  // Isi form otomatis jika masuk mode Edit
  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title,
        category: editData.category,
        status: editData.status,
        team_member_id: editData.pic?.id || 0,
      });
    } else {
      setFormData({ title: "", category: "Web Application", status: "Antrean", team_member_id: 0 });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = Cookies.get("token");
      if (!formData.team_member_id) throw new Error("Silakan pilih PIC!");

      const url = editData ? `http://localhost:8080/api/projects/${editData.id}` : "http://localhost:8080/api/projects/";
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, team_member_id: Number(formData.team_member_id) }),
      });

      if (!res.ok) throw new Error(`Gagal ${editData ? "memperbarui" : "menambahkan"} proyek`);

      toast.success(`Proyek berhasil ${editData ? "diperbarui" : "ditambahkan"}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-900">{editData ? "Edit Proyek" : "Tambah Proyek Baru"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Proyek</label>
            <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select className="w-full px-3 py-2 border rounded-lg" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="Web Application">Web Application</option>
                <option value="Mobile Application">Mobile Application</option>
                <option value="UI/UX & Brand Design">UI/UX & Brand Design</option>
                <option value="IoT & Automation">IoT & Automation</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full px-3 py-2 border rounded-lg" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Antrean">Antrean</option>
                <option value="Proses">Proses</option>
                <option value="Revisi">Revisi</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PIC (Penanggung Jawab)</label>
            <select required className="w-full px-3 py-2 border rounded-lg" value={formData.team_member_id} onChange={(e) => setFormData({ ...formData, team_member_id: Number(e.target.value) })}>
              <option value={0} disabled>
                -- Pilih Tim --
              </option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.role})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
