/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { LogOut, Plus, Briefcase, Users, Building2 } from "lucide-react";

import { TeamMember, Project, Client } from "@/types";
import ProjectModal from "@/components/ui/ProjectModal";
import ProjectTable from "@/components/tables/ProjectTable";
import TeamTable from "@/components/tables/TeamTable";
import StatCards from "@/components/dashboard/StatCards";
import SearchFilterBar from "@/components/dashboard/SearchFilterBar";
import ClientTable from "@/components/tables/ClientTable";
import ClientModal from "@/components/ui/ClientModal";

export default function DashboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE TAB NAVIGASI ---
  const [activeTab, setActiveTab] = useState<"projects" | "teams" | "clients">("projects");

  // --- STATE MODAL PROYEK ---
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // --- STATE MODAL TIM ---
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamMember | null>(null);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [teamFormData, setTeamFormData] = useState({
    name: "",
    role: "Web Developer",
    email: "",
    password: "",
  });

  // --- STATE PENCARIAN & FILTER ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRole, setFilterRole] = useState("All");

  // --- FUNGSI FETCH DATA ---
  const fetchData = async () => {
    const token = Cookies.get("token");
    if (!token) return router.push("/login");

    try {
      const [teamsRes, projectsRes, clientsRes] = await Promise.all([
        fetch("http://localhost:8080/api/teams/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/projects/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/clients/", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const teamsData = await teamsRes.json();
      const projectsText = await projectsRes.text();
      const clientsData = await clientsRes.json();

      setTeams(teamsData.data || []);
      setProjects(projectsText ? JSON.parse(projectsText).data || [] : []);
      setClients(clientsData.data || []);
    } catch (err) {
      toast.error("Gagal memuat data dari server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // --- FUNGSI AKSI PROYEK ---
  const handleDeleteProject = async (id: number) => {
    if (!confirm("Yakin ingin menghapus proyek ini?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus proyek");
      toast.success("Proyek berhasil dihapus!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // fungsi delete tim
  const handleDeleteTeam = async (id: number) => {
    if (!confirm("Yakin ingin menghapus anggota tim ini?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/teams/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus anggota tim");
      toast.success("Anggota tim berhasil dihapus!");
      fetchData(); // Refresh data
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // --- FUNGSI AKSI TIM ---
  const handleSubmitTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTeam(true);
    try {
      const token = Cookies.get("token");

      // Jika mode Edit, URL-nya ke /teams/:id dengan metode PUT
      // Jika mode Tambah, URL-nya ke /auth/register dengan metode POST
      const url = editingTeam ? `http://localhost:8080/api/teams/${editingTeam.id}` : "http://localhost:8080/api/auth/register";

      const method = editingTeam ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teamFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses data anggota");

      toast.success(`Anggota tim berhasil ${editingTeam ? "diperbarui" : "ditambahkan"}!`);
      setIsTeamModalOpen(false);
      setEditingTeam(null);
      setTeamFormData({ name: "", role: "Web Developer", email: "", password: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data klien ini?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus klien");
      toast.success("Data klien berhasil dihapus!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  // --- LOGOUT ---
  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  // --- LOGIKA FILTER & PENCARIAN ---
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || (p.pic?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredTeams = teams.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "All" || t.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.company.toLowerCase().includes(searchQuery.toLowerCase()) || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) return <div className="min-h-screen flex justify-center items-center">Memuat Workspace...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jalcode Workspace</h1>
            <p className="text-gray-500 mt-1">Manajemen Tim Internal & Operasional</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <StatCards
          totalTeams={teams.length}
          totalProjects={projects?.length || 0}
          activeProjects={projects?.filter((p) => p.status !== "Selesai").length || 0}
          completedProjects={projects?.filter((p) => p.status === "Selesai").length || 0}
        />

        {/* TAB NAVIGASI */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors duration-200 relative ${activeTab === "projects" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Briefcase size={18} /> Data Proyek
            {activeTab === "projects" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors duration-200 relative ${activeTab === "teams" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Users size={18} /> Direktori Tim
            {activeTab === "teams" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors duration-200 relative ${activeTab === "clients" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Building2 size={18} /> Direktori Klien
            {activeTab === "clients" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
        </div>
        <SearchFilterBar activeTab={activeTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterRole={filterRole} setFilterRole={setFilterRole} />

        {/* AREA KONTEN UTAMA */}

        {/* 1. TABEL PROYEK */}
        {activeTab === "projects" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Daftar Proyek Klien</h2>
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">{filteredProjects?.length || 0} Ditemukan</span>
              </div>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsProjectModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <Plus size={18} /> Tambah Proyek
              </button>
            </div>
            {/* PANGGIL KOMPONEN TABEL PROYEK DI SINI */}
            <ProjectTable
              projects={filteredProjects}
              onEdit={(p) => {
                setEditingProject(p);
                setIsProjectModalOpen(true);
              }}
              onDelete={handleDeleteProject}
            />
          </div>
        )}

        {activeTab === "clients" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Direktori Perusahaan Klien</h2>
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">{filteredClients.length} Ditemukan</span>
              </div>
              <button
                onClick={() => {
                  setEditingClient(null);
                  setIsClientModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <Plus size={18} /> Tambah Klien
              </button>
            </div>
            <ClientTable
              clients={filteredClients}
              onEdit={(c) => {
                setEditingClient(c);
                setIsClientModalOpen(true);
              }}
              onDelete={handleDeleteClient}
            />
          </div>
        )}

        {/* 2. TABEL TIM */}
        {activeTab === "teams" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Daftar Anggota Tim</h2>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">{filteredTeams.length} Ditemukan</span>
              </div>
              <button onClick={() => setIsTeamModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                <Plus size={18} /> Tambah Anggota
              </button>
            </div>
            {/* PANGGIL KOMPONEN TABEL TIM DI SINI */}
            <TeamTable
              teams={filteredTeams}
              onEdit={(t) => {
                setEditingTeam(t);
                setTeamFormData({ name: t.name, role: t.role, email: t.email, password: "" });
                setIsTeamModalOpen(true);
              }}
              onDelete={handleDeleteTeam}
            />
          </div>
        )}
      </div>

      {/* MODAL COMPONENTS */}
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSuccess={fetchData} teams={teams} editData={editingProject} />

      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSuccess={fetchData} editData={editingClient} />

      {/* MODAL TIM */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Tambah Anggota Baru</h3>
            <form onSubmit={handleSubmitTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" required className="w-full px-3 py-2 border rounded-lg text-black" value={teamFormData.name} onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Divisi / Role</label>
                <select className="w-full px-3 py-2 border rounded-lg text-black" value={teamFormData.role} onChange={(e) => setTeamFormData({ ...teamFormData, role: e.target.value })}>
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
                <input type="email" required className="w-full px-3 py-2 border rounded-lg text-black" value={teamFormData.email} onChange={(e) => setTeamFormData({ ...teamFormData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Sementara</label>
                <input type="password" required minLength={6} className="w-full px-3 py-2 border rounded-lg text-black" value={teamFormData.password} onChange={(e) => setTeamFormData({ ...teamFormData, password: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsTeamModalOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-gray-800">
                  Batal
                </button>
                <button type="submit" disabled={isSubmittingTeam} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {isSubmittingTeam ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
