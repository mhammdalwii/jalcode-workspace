import { useEffect } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, ClientFormValues } from "@/validations";
import { Client } from "@/types";

//  SCHEMA VALIDASI ZOD

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData: Client | null;
}

export default function ClientModal({ isOpen, onClose, onSuccess, editData }: ClientModalProps) {
  //  INISIALISASI REACT HOOK FORM + ZOD
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company: "",
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  //  AUTO-FILL SAAT MODE EDIT
  useEffect(() => {
    if (editData) {
      reset({
        company: editData.company,
        name: editData.name,
        email: editData.email || "",
        phone: editData.phone || "",
        address: editData.address || "",
      });
    } else {
      reset({ company: "", name: "", email: "", phone: "", address: "" });
    }
  }, [editData, isOpen, reset]);

  // 4. FUNGSI SUBMIT YANG SUDAH DIVALIDASI ZOD
  const onSubmit = async (data: ClientFormValues) => {
    try {
      const url = editData ? `http://localhost:8080/api/clients/${editData.id}` : "http://localhost:8080/api/clients/";
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data klien");

      toast.success(`Klien berhasil ${editData ? "diperbarui" : "ditambahkan"}!`);
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
        <h3 className="text-xl font-bold mb-4 text-gray-900">{editData ? "Edit Data Klien" : "Tambah Klien Baru"}</h3>

        {/* GUNAKAN handleSubmit DARI REACT HOOK FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan / Instansi *</label>
            {/* GANTIKAN value & onChange DENGAN {...register("nama_field")} */}
            <input type="text" {...register("company")} className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 ${errors.company ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"}`} />
            {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama PIC (Kontak Utama) *</label>
            <input type="text" {...register("name")} className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 ${errors.name ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="text" {...register("email")} className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
              {/* Note: Tetap gunakan type="text" agar tanda + bisa masuk, validasi diurus Zod */}
              <input
                type="text"
                {...register("phone")}
                className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 ${errors.phone ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"}`}
                placeholder="+6281..."
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea {...register("address")} className="w-full px-3 py-2 border rounded-lg text-black h-20 focus:outline-none focus:ring-2 focus:ring-blue-200"></textarea>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-gray-800">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
