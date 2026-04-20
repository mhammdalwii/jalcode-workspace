import { useState, useEffect, useRef } from "react";
import { Save, Lock, User, Building, ShieldCheck, Upload, EyeOff, Eye, Info } from "lucide-react";
import toast from "react-hot-toast";

// Import prajurit pintar kita
import { fetchWithAuth } from "@/utils/fetchApi";
import { isAdminOrFounder } from "@/utils/auth";

interface SettingsViewProps {
  onSuccess: () => void;
}

export default function SettingsView({ onSuccess }: SettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "security">("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: "Muhammad Alwi",
    email: "jalcodeid@gmail.com",
    company: "Jalcode Agency",
    phone: "08804207761",
    logo: "/logo/logoRemove.png",
  });

  const [securityData, setSecurityData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Cek apakah user ini punya hak akses Founder/Admin
    setIsAdmin(isAdminOrFounder());

    const fetchAgency = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/agency/`);
        const result = await res.json();
        if (result.data) setProfileData(result.data);
      } catch (err) {
        console.error("Gagal menarik data agensi");
      }
    };
    fetchAgency();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("Ukuran foto maksimal 2MB!");
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return toast.error("Hanya Admin/Founder yang dapat mengubah profil!"); // Keamanan ganda

    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/agency/`, {
        method: "PUT",
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        toast.success("Profil berhasil disimpan ke Database!");
        onSuccess();
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (err) {
      toast.error("Koneksi ke server gagal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (securityData.newPassword !== securityData.confirmPassword) {
      return toast.error("Password baru dan konfirmasi tidak cocok!");
    }
    if (securityData.newPassword.length < 8) {
      return toast.error("Password baru minimal harus 8 karakter!");
    }

    setIsSubmitting(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-password`, {
        method: "PUT",
        body: JSON.stringify({
          current_password: securityData.currentPassword,
          new_password: securityData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat mengubah password");
      }

      toast.success(data.message || "Password berhasil diubah!");
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Profil Agensi</h2>
                <p className="text-gray-500 mt-1">Perbarui informasi dasar perusahaan dan logo yang akan tampil di Invoice.</p>
              </div>
              {/* Notifikasi visual jika mode hanya-lihat */}
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
                      <Info size={14} /> Hanya Admin yang dapat mengubah logo perusahaan.
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

              {/* Tampilkan tombol simpan hanya untuk Admin/Founder */}
              {isAdmin && (
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    <Save size={18} /> {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* TAB KEAMANAN - TETAP BISA DIAKSES OLEH SEMUA ROLE */}
        {activeSubTab === "security" && (
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Keamanan Akun</h2>
              <p className="text-gray-500 mt-1">Ganti kata sandi secara berkala untuk menjaga keamanan akun Workspace Anda.</p>
            </div>

            <form onSubmit={handleSaveSecurity} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <Lock size={14} /> Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    required
                    type={showCurrent ? "text" : "password"}
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-gray-50 pr-12"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 transition">
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">Password Baru</label>
                <div className="relative">
                  <input
                    required
                    type={showNew ? "text" : "password"}
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 pr-12"
                    placeholder="Minimal 8 karakter"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 transition">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input
                    required
                    type={showConfirm ? "text" : "password"}
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 pr-12"
                    placeholder="Ulangi password baru"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 transition">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg shadow-gray-200">
                  <ShieldCheck size={18} /> {isSubmitting ? "Memperbarui..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
