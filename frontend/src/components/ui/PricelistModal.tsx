import { useEffect } from "react";
import { X, Tag } from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CurrencyInput from "@/components/ui/CurrencyInput";
import { pricelistSchema, PricelistFormValues } from "@/validations";
import { Pricelist, Category } from "@/types";

interface PricelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData: Pricelist | null;
  categories: Category[]; //  TERIMA DATA KATEGORI
}

export default function PricelistModal({ isOpen, onClose, onSuccess, editData, categories }: PricelistModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PricelistFormValues>({
    resolver: zodResolver(pricelistSchema),
    defaultValues: {
      service_name: "",
      category: categories.length > 0 ? categories[0].name : "",
      price: 0,
      description: "",
    },
  });

  const currentPrice = watch("price");

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        reset({
          service_name: editData.service_name,
          category: editData.category,
          price: editData.price,
          description: editData.description || "",
        });
      } else {
        reset({
          service_name: "",
          category: categories.length > 0 ? categories[0].name : "", // 🚀 Reset Dinamis
          price: 0,
          description: "",
        });
      }
    }
  }, [isOpen, editData, reset, categories]);

  if (!isOpen) return null;

  const onSubmit = async (data: PricelistFormValues) => {
    try {
      const url = editData ? `${process.env.NEXT_PUBLIC_API_URL}/api/pricelists/${editData.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/pricelists/`;
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Gagal menyimpan katalog harga");

      toast.success(`Katalog harga berhasil ${editData ? "diperbarui" : "ditambahkan"}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-black">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Tag size={18} className="text-blue-600" /> {editData ? "Edit Item Harga" : "Tambah Item Harga Standar"}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-full transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Nama Jasa / Paket <span className="text-red-500">*</span>
            </label>
            <input
              {...register("service_name")}
              type="text"
              placeholder="Misal: Landing Page Premium"
              className={`w-full px-3 py-2 border rounded-xl text-sm outline-none bg-white ${errors.service_name ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
            />
            {errors.service_name && <p className="text-red-500 text-xs mt-1">{errors.service_name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            {/* 🚀 SELECT KATEGORI DINAMIS DARI DATABASE */}
            <select {...register("category")} className="w-full px-3 py-2 border rounded-xl text-sm outline-none bg-white focus:border-blue-500">
              {categories.length === 0 && <option value="">Belum ada kategori</option>}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Harga Dasar Standar (Rp) <span className="text-red-500">*</span>
            </label>
            <CurrencyInput
              value={currentPrice || 0}
              onChange={(val) => setValue("price", val, { shouldValidate: true })}
              className={`w-full px-3 py-2 border rounded-xl text-sm font-mono font-bold outline-none bg-white ${errors.price ? "border-red-500 text-red-600 focus:border-red-500" : "text-blue-600 focus:border-blue-500"}`}
              placeholder="Masukkan nominal harga"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi / Cakupan Fitur</label>
            <textarea
              {...register("description")}
              placeholder="Misal: Maks 5 Halaman, Integrasi WhatsApp, Animasi Framer Motion..."
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-blue-500 bg-white"
              rows={3}
            ></textarea>
            <p className="text-[10px] text-gray-400 mt-1 italic">*Opsional, hanya untuk catatan internal.</p>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed mt-2">
            {isSubmitting ? "Memproses..." : editData ? "Update Katalog Harga" : "Simpan ke Katalog"}
          </button>
        </form>
      </div>
    </div>
  );
}
