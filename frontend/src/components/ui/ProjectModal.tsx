import { useEffect } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Client, Project, TeamMember } from "@/types";
import { projectSchema, ProjectFormValues } from "@/validations";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teams: TeamMember[];
  clients: Client[];
  editData?: Project | null;
}

export default function ProjectModal({ isOpen, onClose, onSuccess, teams, clients, editData }: ProjectModalProps) {
  //INISIALISASI REACT HOOK FORM
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      client_id: "",
      category: "Web Application",
      status: "Antrean",
      team_member_id: "",
    },
  });

  // AUTO-FILL SAAT MODE EDIT
  useEffect(() => {
    if (editData) {
      reset({
        title: editData.title,
        category: editData.category,
        status: editData.status,
        team_member_id: editData.pic?.id ? String(editData.pic.id) : "",
        client_id: editData.client?.id ? String(editData.client.id) : "",
      });
    } else {
      reset({
        title: "",
        client_id: "",
        category: "Web Application",
        status: "Antrean",
        team_member_id: "",
      });
    }
  }, [editData, isOpen, reset]);

  // FUNGSI SUBMIT
  const onSubmit = async (data: ProjectFormValues) => {
    try {
      const token = Cookies.get("token");
      const url = editData ? `http://localhost:8080/api/projects/${editData.id}` : "http://localhost:8080/api/projects/";
      const method = editData ? "PUT" : "POST";

      // Persiapkan data untuk backend (Convert ID kembali ke Number)
      const payload = {
        ...data,
        client_id: data.client_id ? Number(data.client_id) : "",
        team_member_id: Number(data.team_member_id),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Gagal ${editData ? "memperbarui" : "menambahkan"} proyek`);

      toast.success(`Proyek berhasil ${editData ? "diperbarui" : "ditambahkan"}!`);
      onSuccess();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-900">{editData ? "Edit Proyek" : "Tambah Proyek Baru"}</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-gray-800">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Proyek *</label>
            <input type="text" {...register("title")} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.title ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"}`} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan / Klien</label>
            <select {...register("client_id")} className="w-full px-3 py-2 border rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="">-- Proyek Internal (Tanpa Klien) --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select {...register("category")} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="Web Application">Web Application</option>
                <option value="Mobile Application">Mobile Application</option>
                <option value="UI/UX & Brand Design">UI/UX & Brand Design</option>
                <option value="IoT & Automation">IoT & Automation</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register("status")} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="Antrean">Antrean</option>
                <option value="Proses">Proses</option>
                <option value="Revisi">Revisi</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">PIC (Penanggung Jawab) *</label>
            <select {...register("team_member_id")} className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 ${errors.team_member_id ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"}`}>
              <option value="">-- Pilih Tim --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.role})
                </option>
              ))}
            </select>
            {errors.team_member_id && <p className="text-red-500 text-xs mt-1">{errors.team_member_id.message}</p>}
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
