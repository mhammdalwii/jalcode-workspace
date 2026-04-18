import { useState, useEffect, useRef } from "react";
import { Save, Lock, User, Building, ShieldCheck, Upload } from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

// Menambahkan interface props agar onSuccess dikenali
interface SettingsViewProps {
  onSuccess: () => void;
}

export default function SettingsView({ onSuccess }: SettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "security">("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: "Muhammad Alwi",
    email: "jalcodeid@gmail.com",
    company: "Jalcode Agency",
    phone: "08804207761",
    logo: "/logo/logoRemove.png",
  });

  const [securityData, setSecurityData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/agency/", {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        });
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
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8080/api/agency/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        toast.success("Profil berhasil disimpan ke Database!");
        onSuccess(); // Refresh data global di page.tsx
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

    // Validasi dasar di sisi Frontend
    if (securityData.newPassword !== securityData.confirmPassword) {
      return toast.error("Password baru dan konfirmasi tidak cocok!");
    }
    if (securityData.newPassword.length < 8) {
      return toast.error("Password baru minimal harus 8 karakter!");
    }

    setIsSubmitting(true);

    try {
      //  API Golang
      const res = await fetch("http://localhost:8080/api/auth/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          current_password: securityData.currentPassword,
          new_password: securityData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat mengubah password");
      }

      // Jika sukses, kosongkan form dan beri notifikasi
      toast.success(data.message || "Password berhasil diubah!");
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Profil Agensi</h2>
              <p className="text-gray-500 mt-1">Perbarui informasi dasar perusahaan dan logo yang akan tampil di Invoice.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profileData.logo || "/logo/logoRemove.png"} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoChange} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                    <Upload size={16} /> Pilih Logo Baru
                  </button>
                  <p className="text-xs text-gray-400 mt-2">Disarankan rasio kotak (1:1), maksimal 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <User size={14} /> Nama Founder / CEO
                  </label>
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <Building size={14} /> Nama Agensi / Perusahaan
                  </label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1.5">Email Kontak</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1.5">Nomor WhatsApp / Telepon</label>
                  <input type="text" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                  <Save size={18} /> {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        )}

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
                <input
                  required
                  type="password"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-gray-50"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">Password Baru</label>
                <input
                  required
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  placeholder="Minimal 8 karakter"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">Konfirmasi Password Baru</label>
                <input
                  required
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  placeholder="Ulangi password baru"
                />
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
