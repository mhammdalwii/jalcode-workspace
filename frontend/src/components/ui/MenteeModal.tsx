import { useEffect } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mentee, TeamMember } from "@/types";
import { menteeSchema, MenteeFormValues } from "@/validations";

interface MenteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teams: TeamMember[]; // Untuk daftar mentor
  editData?: Mentee | null;
}

export default function MenteeModal({ isOpen, onClose, onSuccess, teams, editData }: MenteeModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MenteeFormValues>({
    resolver: zodResolver(menteeSchema),
    defaultValues: { name: "", email: "", program: "Full Stack Web", status: "Aktif", mentor_id: "" },
  });

  useEffect(() => {
    if (editData) {
      reset({
        name: editData.name,
        email: editData.email || "",
        program: editData.program,
        status: editData.status,
        mentor_id: String(editData.mentor_id || ""),
      });
    } else {
      reset({ name: "", email: "", program: "Full Stack Web", status: "Aktif", mentor_id: "" });
    }
  }, [editData, isOpen, reset]);

  const onSubmit = async (data: MenteeFormValues) => {
    try {
      const url = editData ? `${process.env.NEXT_PUBLIC_API_URL}/api/mentees/${editData.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/mentees/`;
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify({ ...data, mentor_id: Number(data.mentor_id) }),
      });

      if (!res.ok) throw new Error(`Gagal ${editData ? "memperbarui" : "menambahkan"} peserta`);

      toast.success(`Peserta berhasil ${editData ? "diperbarui" : "didaftarkan"}!`);
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
        <h3 className="text-xl font-bold mb-4 text-gray-900">{editData ? "Edit Data Peserta" : "Daftar Peserta Baru"}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Peserta *</label>
            <input type="text" {...register("name")} className={`w-full px-3 py-2 border rounded-lg ${errors.name ? "border-red-500" : ""}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" {...register("email")} className={`w-full px-3 py-2 border rounded-lg ${errors.email ? "border-red-500" : ""}`} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Program</label>
              <select {...register("program")} className="w-full px-3 py-2 border rounded-lg bg-white">
                <option value="Full Stack Web">Full Stack Web</option>
                <option value="Mobile App Dev">Mobile App Dev</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="IoT Engineering">IoT Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register("status")} className="w-full px-3 py-2 border rounded-lg bg-white">
                <option value="Aktif">Aktif</option>
                <option value="Lulus">Lulus</option>
                <option value="Drop Out">Drop Out</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mentor Pembimbing *</label>
            <select {...register("mentor_id")} className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.mentor_id ? "border-red-500" : ""}`}>
              <option value="">-- Pilih Mentor --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.role})
                </option>
              ))}
            </select>
            {errors.mentor_id && <p className="text-red-500 text-xs mt-1">{errors.mentor_id.message}</p>}
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
