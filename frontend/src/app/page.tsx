"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
}

interface Project {
  id: number;
  title: string;
  category: string;
  status: string;
  team_member?: TeamMember;
}

export default function DashboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);

  // State untuk Modal Form Tambah Tim
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "Web Developer", // Default value
    email: "",
    password: "",
  });

  // Fungsi untuk mengambil data tim (dipisahkan agar bisa dipanggil ulang)
  const fetchTeams = async () => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/teams/", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal mengambil data tim");

      const data = await res.json();
      setTeams(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:8080/api/projects/", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data proyek");

      const data = await res.json();
      setProjects(data.data || []);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchProjects();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  // Fungsi untuk mengirim data anggota baru
  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Kita gunakan endpoint register agar passwordnya ikut terenkripsi di database
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menambahkan anggota");

      // Tutup modal, bersihkan form, dan refresh tabel
      setIsModalOpen(false);
      setFormData({ name: "", role: "Web Developer", email: "", password: "" });
      fetchTeams();
    } catch (err: any) {
      alert(err.message); // Tampilkan alert jika error (misal: email sudah ada)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black relative">
      <div className="max-w-6xl mx-auto">
        {/* Header Dashboard */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jalcode Workspace</h1>
            <p className="text-gray-500 mt-1">Manajemen Tim Internal & Operasional</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition">
            Logout
          </button>
        </div>

        {/* Area Konten Utama */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Daftar Anggota Tim</h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">{teams.length} Orang</span>
            </div>

            {/* Tombol Buka Modal */}
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
              + Tambah Anggota
            </button>
          </div>

          {/* Table Area (Sama seperti sebelumnya) */}
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Memuat data dari server...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : teams.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada anggota tim yang terdaftar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="p-4 border-b font-medium">Nama</th>
                    <th className="p-4 border-b font-medium">Role</th>
                    <th className="p-4 border-b font-medium">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition border-b last:border-0">
                      <td className="p-4 font-medium text-gray-900">{member.name}</td>
                      <td className="p-4 text-gray-600">{member.role}</td>
                      <td className="p-4 text-gray-600">{member.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Daftar Proyek Klien</h2>
            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">{projects?.length || 0} Proyek Aktif</span>
          </div>

          {!projects || projects.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada proyek yang dikerjakan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="p-4 border-b font-medium">Nama Proyek</th>
                    <th className="p-4 border-b font-medium">Kategori</th>
                    <th className="p-4 border-b font-medium">Status</th>
                    <th className="p-4 border-b font-medium">PIC (Penanggung Jawab)</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition border-b last:border-0">
                      <td className="p-4 font-medium text-gray-900">{project.title}</td>
                      <td className="p-4 text-gray-600">{project.category}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${project.status === "Selesai" ? "bg-green-100 text-green-700" : project.status === "Proses" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{project.team_member?.name || "Belum ada PIC"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay Tambah Tim */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Tambah Anggota Baru</h3>
            <form onSubmit={handleAddTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Divisi / Role</label>
                <select className="w-full px-3 py-2 border rounded-lg" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <option value="Web Developer">Web Developer</option>
                  <option value="Mobile Developer">Mobile Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="IoT Engineer">IoT Engineer</option>
                  <option value="Tech Mentor">Tech Mentor</option>
                  <option value="Project Manager">Project Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required className="w-full px-3 py-2 border rounded-lg" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Sementara</label>
                <input type="password" required minLength={6} className="w-full px-3 py-2 border rounded-lg" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
