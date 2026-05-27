import { useState, useEffect, useRef } from "react";
import { Save, Lock, User, Building, ShieldCheck, Upload, EyeOff, Eye, Info, ListTree, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

// IMPORT ZOD & REACT-HOOK-FORM
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { fetchWithAuth } from "@/utils/fetchApi";
import { isAdminOrFounder } from "@/utils/auth";
import { Category } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal"; // 🚀 IMPORT MODAL BARU

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Password saat ini wajib diisi" }),
    newPassword: z.string().min(8, { message: "Password baru minimal 8 karakter" }),
    confirmPassword: z.string().min(1, { message: "Konfirmasi password wajib diisi" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru dan konfirmasi tidak cocok!",
    path: ["confirmPassword"],
  });

type SecurityFormValues = z.infer<typeof securitySchema>;

interface SettingsViewProps {
  onSuccess: () => void;
}

export default function SettingsView({ onSuccess }: SettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "security" | "categories">("profile");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: "Muhammad Alwi",
    email: "jalcodeid@gmail.com",
    company: "Jalcode Agency",
    phone: "08804207761",
    logo: "/logo/logoRemove.png",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting: isSubmittingSecurity },
  } = useForm<SecurityFormValues>({ resolver: zodResolver(securitySchema) });

  useEffect(() => {
    setIsAdmin(isAdminOrFounder());
    const fetchInitData = async () => {
      try {
        const resAgency = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/agency/`);
        const resultAgency = await resAgency.json();
        if (resultAgency.data) setProfileData(resultAgency.data);

        const resDashboard = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard-utama`);
        const resultDashboard = await resDashboard.json();
        if (resultDashboard.data?.categories) setCategories(resultDashboard.data.categories);
      } catch (err) {
        console.error("Gagal menarik data inisialisasi");
      }
    };
    fetchInitData();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("Ukuran foto maksimal 2MB!");
      const reader = new FileReader();
      reader.onloadend = () => setProfileData({ ...profileData, logo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return toast.error("Hanya Admin/Founder yang dapat mengubah profil!");
    setIsSubmittingProfile(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/agency/`, { method: "PUT", body: JSON.stringify(profileData) });
      if (res.ok) {
        toast.success("Profil berhasil disimpan ke Database!");
        onSuccess();
      } else throw new Error("Gagal menyimpan");
    } catch (err) {
      toast.error("Koneksi ke server gagal");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const onSubmitSecurity = async (data: SecurityFormValues) => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-password`, { method: "PUT", body: JSON.stringify({ current_password: data.currentPassword, new_password: data.newPassword }) });
      const result = await res.json();
      if (!res.ok) {
        if (result.error?.toLowerCase().includes("password") || result.error?.toLowerCase().includes("salah")) {
          setError("currentPassword", { type: "server", message: "Password saat ini tidak sesuai!" });
          return;
        }
        throw new Error(result.error || "Terjadi kesalahan saat mengubah password");
      }
      toast.success(result.message || "Password berhasil diubah!");
      reset();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmittingCategory(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/`, { method: "POST", body: JSON.stringify({ name: newCategoryName.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah kategori");
      toast.success("Kategori ditambahkan!");
      setCategories([...categories, data.data]);
      setNewCategoryName("");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  // 🚀 FUNGSI EKSEKUSI HAPUS (DIPANGGIL OLEH MODAL)
  const executeDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeletingCategory(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus kategori");
      toast.success("Kategori dihapus!");
      setCategories(categories.filter((c) => c.id !== categoryToDelete));
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeletingCategory(false);
      setCategoryToDelete(null); // Tutup modal
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-150">
        <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Menu Pengaturan</h3>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSubTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeSubTab === "profile" ? "bg-blue-50 text-blue-700 border border-blue-100" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <Building size={18} /> Profil Agensi
            </button>
            <button
              onClick={() => setActiveSubTab("categories")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeSubTab === "categories" ? "bg-blue-50 text-blue-700 border border-blue-100" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <ListTree size={18} /> Master Kategori
            </button>
            <button
              onClick={() => setActiveSubTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeSubTab === "security" ? "bg-blue-50 text-blue-700 border border-blue-100" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <ShieldCheck size={18} /> Keamanan
            </button>
          </nav>
        </div>

        <div className="flex-1 p-8">
          {activeSubTab === "profile" && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* KODE PROFIL SAMA SEPERTI SEBELUMNYA */}
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Profil Agensi</h2>
                  <p className="text-gray-500 mt-1">Perbarui informasi dasar perusahaan dan logo yang akan tampil di Invoice.</p>
                </div>
                {!isAdmin && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium">
                    <Lock size={14} /> Mode Hanya Lihat
                  </div>
                )}
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50 opacity-90">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profileData.logo || "/logo/logoRemove.png"} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoChange} className="hidden" disabled={!isAdmin} />
                    {isAdmin ? (
                      <>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                        >
                          <Upload size={16} /> Pilih Logo Baru
                        </button>
                        <p className="text-xs text-gray-400 mt-2">Disarankan rasio kotak (1:1), maksimal 2MB.</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Info size={14} /> Hanya Admin yang mengubah logo.
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                      <User size={14} /> Nama Founder / CEO
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isAdmin}
                      className={`px-4 py-2.5 border rounded-xl outline-none transition ${isAdmin ? "focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" : "bg-gray-100 text-gray-500 cursor-not-allowed"}`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                      <Building size={14} /> Nama Agensi / Perusahaan
                    </label>
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      disabled={!isAdmin}
                      className={`px-4 py-2.5 border rounded-xl outline-none transition ${isAdmin ? "focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" : "bg-gray-100 text-gray-500 cursor-not-allowed"}`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1.5">Email Kontak</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isAdmin}
                      className={`px-4 py-2.5 border rounded-xl outline-none transition ${isAdmin ? "focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" : "bg-gray-100 text-gray-500 cursor-not-allowed"}`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1.5">Nomor WhatsApp / Telepon</label>
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isAdmin}
                      className={`px-4 py-2.5 border rounded-xl outline-none transition ${isAdmin ? "focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" : "bg-gray-100 text-gray-500 cursor-not-allowed"}`}
                    />
                  </div>
                </div>
                {isAdmin && (
                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={isSubmittingProfile} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                      <Save size={18} /> {isSubmittingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeSubTab === "categories" && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Master Kategori Proyek</h2>
                <p className="text-gray-500 mt-1">Kelola daftar kategori dinamis yang akan muncul di form tambah proyek baru.</p>
              </div>

              {isAdmin && (
                <form onSubmit={handleAddCategory} className="flex gap-3 mb-8">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Misal: Data Science, IoT, Branding..."
                    className="flex-1 px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingCategory || !newCategoryName.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    <Plus size={18} /> Tambah
                  </button>
                </form>
              )}

              <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {categories.length === 0 ? (
                    <li className="p-6 text-center text-gray-400">Belum ada kategori. Silakan tambahkan!</li>
                  ) : (
                    categories.map((cat) => (
                      <li key={cat.id} className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition">
                        <span className="font-semibold text-gray-800">{cat.name}</span>
                        {isAdmin && (
                          <button
                            onClick={() => setCategoryToDelete(cat.id)} // 🚀 PANGGIL MODAL DI SINI
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Kategori"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}

          {activeSubTab === "security" && (
            <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* KODE KEAMANAN SAMA SEPERTI SEBELUMNYA */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Keamanan Akun</h2>
                <p className="text-gray-500 mt-1">Ganti kata sandi secara berkala untuk menjaga keamanan akun Workspace Anda.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmitSecurity)} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <Lock size={14} /> Password Saat Ini
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      {...register("currentPassword")}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none bg-gray-50 pr-12 transition ${errors.currentPassword ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-500"}`}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 transition">
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.currentPassword.message}</p>}
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      {...register("newPassword")}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none bg-gray-50 pr-12 transition ${errors.newPassword ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-500"}`}
                      placeholder="Minimal 8 karakter"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 transition">
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.newPassword.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      {...register("confirmPassword")}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none bg-gray-50 pr-12 transition ${errors.confirmPassword ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-500"}`}
                      placeholder="Ulangi password baru"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 transition">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
                </div>
                <div className="pt-6">
                  <button type="submit" disabled={isSubmittingSecurity} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg shadow-gray-200 disabled:opacity-50">
                    <ShieldCheck size={18} /> {isSubmittingSecurity ? "Memperbarui..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 🚀 PASANG MODAL KONFIRMASI HAPUS DI SINI */}
      <ConfirmModal
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={executeDeleteCategory}
        title="Hapus Kategori?"
        message="Yakin ingin menghapus kategori ini? Proyek yang menggunakan kategori ini mungkin akan kehilangan label pencariannya."
        isLoading={isDeletingCategory}
      />
    </>
  );
}
