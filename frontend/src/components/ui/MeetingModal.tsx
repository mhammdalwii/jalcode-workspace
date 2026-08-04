import { useState } from "react";
import { X, Save, Plus, Trash2, Loader2, Users, CalendarDays, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { fetchWithAuth } from "@/utils/fetchApi";
import { Project, TeamMember, MeetingActionItem } from "@/types";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  teams: TeamMember[];
  onRefresh: () => void;
}

export default function MeetingModal({ isOpen, onClose, project, teams, onRefresh }: MeetingModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  // State untuk form utama
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // State untuk checklist tugas (Action Items)
  const [actionItems, setActionItems] = useState<MeetingActionItem[]>([]);

  const handleAddActionItem = () => {
    setActionItems([...actionItems, { task: "", pic_id: 0 }]);
  };

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleActionItemChange = (index: number, field: keyof MeetingActionItem, value: any) => {
    const newItems = [...actionItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setActionItems(newItems);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date) {
      toast.error("Judul dan tanggal rapat wajib diisi!");
      return;
    }

    // Validasi Action Items: Pastikan task tidak kosong dan PIC sudah dipilih
    const validItems = actionItems.filter((item) => item.task.trim() !== "");
    const invalidPic = validItems.find((item) => item.pic_id === 0);

    if (invalidPic) {
      toast.error("Setiap tugas harus memiliki PIC yang bertanggung jawab!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        project_id: project?.id || null, // null jika rapat internal
        title: formData.title,
        date: formData.date,
        notes: formData.notes,
        action_items: validItems.map((item) => ({
          task: item.task,
          pic_id: Number(item.pic_id),
        })),
      };

      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/meetings/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan jurnal rapat");

      toast.success("Jurnal rapat berhasil dikunci!");

      // Reset form
      setFormData({ title: "", date: new Date().toISOString().split("T")[0], notes: "" });
      setActionItems([]);

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
        {/* HEADER */}
        <div className="p-5 border-b flex justify-between items-center bg-linear-to-r from-teal-700 to-emerald-700 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Buat Jurnal Rapat Baru</h3>
              <p className="text-teal-100 text-xs">{project ? `Proyek: ${project.title}` : "Rapat Internal Jalcode"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto bg-gray-50/50 space-y-6">
          {/* BAGIAN 1: INFO RAPAT */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
              <FileText size={16} /> 1. Informasi Utama
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Topik Rapat</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Misal: Sprint Planning UI/UX"
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
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
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hasil Diskusi / Catatan Bebas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                placeholder="Tuliskan kesimpulan atau catatan bebas dari rapat di sini..."
                className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          {/* BAGIAN 2: ACTION ITEMS (CHECKLIST TUGAS) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">2. Action Items (Tugas)</h4>
              <button onClick={handleAddActionItem} className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1.5 rounded hover:bg-teal-100 transition">
                <Plus size={14} /> Tambah Tugas
              </button>
            </div>

            <div className="space-y-3">
              {actionItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 relative group">
                  <input
                    type="text"
                    value={item.task}
                    onChange={(e) => handleActionItemChange(index, "task", e.target.value)}
                    placeholder="Deskripsi tugas..."
                    className="flex-1 w-full p-2 border rounded text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                  />

                  <select
                    value={item.pic_id}
                    onChange={(e) => handleActionItemChange(index, "pic_id", Number(e.target.value))}
                    className="w-full sm:w-48 p-2 border rounded text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white cursor-pointer"
                  >
                    <option value={0} disabled>
                      Pilih PIC...
                    </option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.role})
                      </option>
                    ))}
                  </select>

                  <button onClick={() => handleRemoveActionItem(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {actionItems.length === 0 && <p className="text-center text-sm text-gray-400 py-4 italic">Belum ada tugas yang dibagikan. Klik Tambah Tugas.</p>}
            </div>
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">
            Batal
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-teal-700 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-teal-800 transition disabled:opacity-50">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? "Menyimpan..." : "Simpan & Bagikan Tugas"}
          </button>
        </div>
      </div>
    </div>
  );
}
