import { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Loader2, ClipboardList } from "lucide-react";
import { Project, RequirementFeature } from "@/types";
import toast from "react-hot-toast";
import { fetchWithAuth } from "@/utils/fetchApi";

interface RequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onRefresh: () => void;
}

export default function RequirementModal({ isOpen, onClose, project, onRefresh }: RequirementModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    business_goal: "",
    target_audience: "",
    design_preferences: "",
    tech_stack: "",
    notes: "",
  });

  const [features, setFeatures] = useState<RequirementFeature[]>([]);

  useEffect(() => {
    if (isOpen && project) {
      fetchRequirement();
    }
  }, [isOpen, project]);

  const fetchRequirement = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${project?.id}/requirement`);
      const json = await res.json();

      if (res.ok && json.data) {
        setFormData({
          business_goal: json.data.business_goal || "",
          target_audience: json.data.target_audience || "",
          design_preferences: json.data.design_preferences || "",
          tech_stack: json.data.tech_stack || "",
          notes: json.data.notes || "",
        });
        setFeatures(json.data.features || []);
      } else {
        // Reset jika belum ada data
        setFormData({ business_goal: "", target_audience: "", design_preferences: "", tech_stack: "", notes: "" });
        setFeatures([{ title: "", description: "" }]);
      }
    } catch (error) {
      console.error("Gagal menarik data analisis", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFeature = () => {
    setFeatures([...features, { title: "", description: "" }]);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, field: keyof RequirementFeature, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFeatures(newFeatures);
  };

  const handleSave = async () => {
    // Validasi fitur kosong
    const validFeatures = features.filter((f) => f.title.trim() !== "");

    setIsSaving(true);
    try {
      const payload = {
        project_id: project?.id,
        ...formData,
        features: validFeatures,
      };

      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${project?.id}/requirement`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan analisis kebutuhan");

      toast.success("Dokumen Analisis Kebutuhan terkunci!");
      onRefresh();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden max-h-[90vh]">
        {/* HEADER */}
        <div className="p-5 border-b flex justify-between items-center bg-linear-to-r from-purple-700 to-indigo-700 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Analisis Kebutuhan Klien (Brief)</h3>
              <p className="text-purple-100 text-xs">Proyek: {project.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto bg-gray-50/50 space-y-6">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Loader2 className="animate-spin text-purple-600 mb-2" size={40} />
              <p className="text-gray-500 font-medium animate-pulse">Menyelaraskan Dokumen...</p>
            </div>
          ) : (
            <>
              {/* BAGIAN 1: INFORMASI UMUM */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h4 className="font-bold text-gray-800 border-b pb-2 mb-4">1. Identifikasi Dasar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tujuan Bisnis Aplikasi</label>
                    <textarea
                      value={formData.business_goal}
                      onChange={(e) => setFormData({ ...formData, business_goal: e.target.value })}
                      rows={3}
                      placeholder="Contoh: Meningkatkan konversi penjualan secara online..."
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Target Pengguna (Audience)</label>
                    <textarea
                      value={formData.target_audience}
                      onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                      rows={3}
                      placeholder="Contoh: Mahasiswa umur 18-24 tahun, suka diskon..."
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tech Stack & Platform</label>
                    <input
                      type="text"
                      value={formData.tech_stack}
                      onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                      placeholder="Contoh: Next.js + Tailwind, Flutter Mobile..."
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Preferensi Desain / Referensi</label>
                    <input
                      type="text"
                      value={formData.design_preferences}
                      onChange={(e) => setFormData({ ...formData, design_preferences: e.target.value })}
                      placeholder="Contoh: Warna biru BCA, referensi: tokped.com"
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 2: DAFTAR FITUR DINAMIS */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h4 className="font-bold text-gray-800">2. Rincian Fitur Utama (Scope of Work)</h4>
                  <button onClick={handleAddFeature} className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded hover:bg-purple-100 transition">
                    <Plus size={14} /> Tambah Fitur
                  </button>
                </div>

                <div className="space-y-3">
                  {features.map((feat, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 relative group">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={feat.title}
                          onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                          placeholder="Nama Fitur (misal: Login OTP WhatsApp)"
                          className="w-full p-2 border-b bg-transparent text-sm font-semibold text-gray-900 focus:border-purple-500 outline-none"
                        />
                        <textarea
                          value={feat.description}
                          onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                          placeholder="Penjelasan detail cara kerja fitur ini..."
                          rows={2}
                          className="w-full p-2 border rounded text-xs bg-white text-gray-600 focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                      <button onClick={() => handleRemoveFeature(index)} className="p-2 mt-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {features.length === 0 && <p className="text-center text-sm text-gray-400 py-4 italic">Belum ada rincian fitur. Klik tambah fitur.</p>}
                </div>
              </div>

              {/* BAGIAN 3: CATATAN TAMBAHAN */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Catatan Tambahan (Timeline/Lainnya)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Catatan tambahan hasil meeting..."
                  className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white shadow-sm"
                />
              </div>
            </>
          )}
        </div>

        {/* FOOTER ACTION */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">
            Batal
          </button>
          <button onClick={handleSave} disabled={isSaving || isLoading} className="px-6 py-2 bg-purple-700 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-purple-800 transition disabled:bg-purple-400">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? "Menyimpan..." : "Kunci Analisis"}
          </button>
        </div>
      </div>
    </div>
  );
}
