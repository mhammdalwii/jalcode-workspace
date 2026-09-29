import { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Loader2, Users, CalendarDays, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { fetchWithAuth } from "@/utils/fetchApi";
import { Project, TeamMember, MeetingActionItem, MeetingNote } from "@/types";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  teams: TeamMember[];
  onRefresh: () => void;
  editData?: MeetingNote | null; // 🚀 BARU: Prop untuk mode edit
}

export default function MeetingModal({ isOpen, onClose, project, teams, onRefresh, editData }: MeetingModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [actionItems, setActionItems] = useState<MeetingActionItem[]>([]);

  // 🚀 BARU: Isi form otomatis jika mode Edit
  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        title: editData.title,
        date: editData.date.split("T")[0],
        notes: editData.notes || "",
      });
      setActionItems(
        (editData.action_items || []).map((item) => ({
          task: item.task,
          pic_ids: item.pics?.map((p) => p.id) || [],
          is_done: item.is_done,
        })),
      );
    } else if (isOpen) {
      setFormData({ title: "", date: new Date().toISOString().split("T")[0], notes: "" });
      setActionItems([]);
    }
  }, [editData, isOpen]);

  const handleAddActionItem = () => {
    setActionItems([...actionItems, { task: "", pic_ids: [] }]); // Inisialisasi array kosong
  };

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleActionItemChange = (index: number, field: keyof MeetingActionItem, value: any) => {
    const newItems = [...actionItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setActionItems(newItems);
  };

  // 🚀 BARU: Fungsi untuk Toggle / Klik Banyak PIC
  const togglePic = (index: number, teamId: number) => {
    const newItems = [...actionItems];
    const currentPicIds = newItems[index].pic_ids || [];

    if (currentPicIds.includes(teamId)) {
      newItems[index].pic_ids = currentPicIds.filter((id) => id !== teamId); // Hapus jika sudah ada
    } else {
      newItems[index].pic_ids = [...currentPicIds, teamId]; // Tambah jika belum ada
    }
    setActionItems(newItems);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date) {
      toast.error("Judul dan tanggal rapat wajib diisi!");
      return;
    }

    const validItems = actionItems.filter((item) => item.task.trim() !== "");
    const invalidPic = validItems.find((item) => !item.pic_ids || item.pic_ids.length === 0);

    if (invalidPic) {
      toast.error("Setiap tugas minimal harus menugaskan 1 PIC!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        project_id: project?.id || null,
        title: formData.title,
        date: formData.date,
        notes: formData.notes,
        action_items: validItems.map((item) => ({
          task: item.task,
          pic_ids: item.pic_ids, // 🚀 Kirim array ID ke backend
        })),
      };

      // 🚀 BARU: Tentukan URL dan Method berdasarkan mode (Edit / Create)
      const url = editData ? `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${editData.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/`;
      const method = editData ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method: method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan jurnal rapat");

      toast.success(editData ? "Jurnal rapat berhasil diperbarui!" : "Jurnal rapat berhasil dikunci!");
      onRefresh();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-5 border-b flex justify-between items-center bg-linear-to-r from-teal-700 to-emerald-700 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{editData ? "Edit Jurnal Rapat" : "Buat Jurnal Rapat Baru"}</h3>
              <p className="text-teal-100 text-xs">{project ? `Proyek: ${project.title}` : "Rapat Internal Jalcode"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-gray-50/50 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
              <FileText size={16} /> 1. Informasi Utama
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Topik Rapat</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal Rapat</label>
                <div className="relative">
                  <CalendarDays size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-10 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hasil Diskusi / Catatan</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>

          {/* ACTION ITEMS */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">2. Action Items (Tugas)</h4>
              <button onClick={handleAddActionItem} className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1.5 rounded hover:bg-teal-100 transition">
                <Plus size={14} /> Tambah Tugas
              </button>
            </div>

            <div className="space-y-4">
              {actionItems.map((item, index) => (
                <div key={index} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.task}
                      onChange={(e) => handleActionItemChange(index, "task", e.target.value)}
                      placeholder="Tulis deskripsi tugas..."
                      className="flex-1 p-2 border rounded text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                    <button onClick={() => handleRemoveActionItem(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* 🚀 BARU: UI Multi-Select Tags untuk PIC */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tugaskan Kepada:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {teams.map((team) => {
                        const isSelected = item.pic_ids?.includes(team.id);
                        return (
                          <button
                            key={team.id}
                            type="button"
                            onClick={() => togglePic(index, team.id)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all ${
                              isSelected ? "bg-teal-100 text-teal-700 border-teal-300 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {team.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {actionItems.length === 0 && <p className="text-center text-sm text-gray-400 py-4 italic">Belum ada tugas. Klik Tambah Tugas.</p>}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">
            Batal
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-teal-700 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-teal-800 transition disabled:opacity-50">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {editData ? "Perbarui Jurnal" : "Simpan & Bagikan"}
          </button>
        </div>
      </div>
    </div>
  );
}
