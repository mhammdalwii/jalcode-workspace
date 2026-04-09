/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { LogOut, Briefcase, Users, Building2, KanbanSquare, LayoutList, GraduationCap, HistoryIcon } from "lucide-react";
import { TeamMember, Project, Client, Mentee, ActivityLog } from "@/types";
import { isAdminOrFounder } from "@/utils/auth";
import dynamic from "next/dynamic";

import ProjectTable from "@/components/tables/ProjectTable";
import TeamTable from "@/components/tables/TeamTable";
import ClientTable from "@/components/tables/ClientTable";
import MenteeTable from "@/components/tables/MenteeTable";
import ProjectKanban from "@/components/tables/ProjectKanban";
import StatCards from "@/components/dashboard/StatCards";
import SearchFilterBar from "@/components/dashboard/SearchFilterBar";
import SectionHeader from "@/components/dashboard/SectionHeader";
import TeamModal from "@/components/ui/TeamModal";

const ProjectModal = dynamic(() => import("@/components/ui/ProjectModal"), {
  ssr: false,
  loading: () => <div className="hidden">Memuat Form...</div>,
});
const ClientModal = dynamic(() => import("@/components/ui/ClientModal"), { ssr: false });
const MenteeModal = dynamic(() => import("@/components/ui/MenteeModal"), { ssr: false });
const ProjectDetailPanel = dynamic(() => import("@/components/ui/ProjectDetailPanel"), { ssr: false });
import ActivityPanel from "@/components/ui/ActivityPanel";
import CredentialPanel from "@/components/ui/CredentialPanel";

export default function DashboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE TAB & VIEW ---
  const [activeTab, setActiveTab] = useState<"projects" | "teams" | "clients" | "mentees">("projects");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [isAdmin, setIsAdmin] = useState(false);

  // --- STATE PENCARIAN & FILTER ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRole, setFilterRole] = useState("All");

  // state untuk log aktivitas
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false);

  // state untuk credential
  const [selectedClientForVault, setSelectedClientForVault] = useState<Client | null>(null);
  const [isCredentialPanelOpen, setIsCredentialPanelOpen] = useState(false);

  // --- STATE MODAL ---
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isMenteeModalOpen, setIsMenteeModalOpen] = useState(false);
  const [editingMentee, setEditingMentee] = useState<Mentee | null>(null);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamMember | null>(null);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [teamFormData, setTeamFormData] = useState({ name: "", role: "Web Developer", email: "", password: "" });

  // --- KONFIGURASI TAB NAVIGASI ---
  const TABS = [
    { id: "projects", label: "Data Proyek", icon: Briefcase },
    { id: "teams", label: "Direktori Tim", icon: Users },
    { id: "clients", label: "Direktori Klien", icon: Building2 },
    { id: "mentees", label: "Mentorship", icon: GraduationCap },
  ] as const;

  // --- CEK ROLE SAAT PERTAMA RENDER ---
  useEffect(() => {
    setIsAdmin(isAdminOrFounder());
  }, []);

  // --- FUNGSI FETCH DATA ---
  const fetchData = async () => {
    const token = Cookies.get("token");
    if (!token) return router.push("/login");

    try {
      const [teamsRes, projectsRes, clientsRes, menteesRes] = await Promise.all([
        fetch("http://localhost:8080/api/teams/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/projects/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/clients/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/mentees/", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (teamsRes.status === 401 || projectsRes.status === 401) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        Cookies.remove("token");
        router.push("/login");
        return;
      }

      const teamsData = await teamsRes.json();
      const projectsText = await projectsRes.text();
      const clientsData = await clientsRes.json();
      const menteesData = await menteesRes.json();

      setTeams(teamsData.data || []);
      setProjects(projectsText ? JSON.parse(projectsText).data || [] : []);
      setClients(clientsData.data || []);
      setMentees(menteesData.data || []);
    } catch (err) {
      toast.error("Gagal memuat data dari server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // --- FUNGSI HAPUS DATA ---
  const deleteData = async (url: string, successMsg: string) => {
    if (!confirm(`Yakin ingin menghapus data ini?`)) return;
    try {
      const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${Cookies.get("token")}` } });
      if (!res.ok) throw new Error("Gagal menghapus data");
      toast.success(successMsg);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteProject = (id: number) => deleteData(`http://localhost:8080/api/projects/${id}`, "Proyek berhasil dihapus!");
  const handleDeleteClient = (id: number) => deleteData(`http://localhost:8080/api/clients/${id}`, "Klien berhasil dihapus!");
  const handleDeleteTeam = (id: number) => deleteData(`http://localhost:8080/api/teams/${id}`, "Anggota tim berhasil dihapus!");
  const handleDeleteMentee = (id: number) => deleteData(`http://localhost:8080/api/mentees/${id}`, "Peserta berhasil dihapus!");

  // --- FUNGSI UPDATE STATUS PROYEK ---
  const handleStatusChange = async (projectId: number, newStatus: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project || project.status === newStatus) return;

    try {
      const payload = {
        title: project.title,
        category: project.category,
        status: newStatus,
        team_member_id: project.team_member_id,
        client_id: project.client_id ? Number(project.client_id) : undefined,
      };

      const res = await fetch(`http://localhost:8080/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal mengupdate status proyek");
      toast.success(`Status dipindahkan ke ${newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // --- FUNGSI SUBMIT TIM ---
  const handleSubmitTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTeam(true);
    try {
      const url = editingTeam ? `http://localhost:8080/api/teams/${editingTeam.id}` : "http://localhost:8080/api/auth/register";
      const method = editingTeam ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
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

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  // --- LOGIKA FILTER ---
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

  const filteredClients = clients.filter((c) => c.company.toLowerCase().includes(searchQuery.toLowerCase()) || c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredMentees = mentees.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || (m.mentor?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
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
            <div className="flex items-center gap-3 mt-3">
              {/* Tombol Riwayat (Hanya Muncul untuk Admin) */}
              {isAdmin && (
                <button onClick={() => setIsActivityPanelOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm">
                  <HistoryIcon size={18} /> Riwayat
                </button>
              )}
            </div>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <StatCards
          totalProjects={projects?.length || 0}
          activeProjects={projects?.filter((p) => p.status === "Proses" || p.status === "Antrean").length || 0}
          totalClients={clients?.length || 0}
          totalTeams={teams?.length || 0}
          totalMentees={mentees?.length || 0}
          graduatedMentees={mentees?.filter((m) => m.status === "Lulus").length || 0}
        />

        {/* TAB NAVIGASI */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery("");
                  setFilterStatus("All");
                  setFilterRole("All");
                }}
                className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors duration-200 relative whitespace-nowrap ${activeTab === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Icon size={18} /> {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
              </button>
            );
          })}
        </div>

        <SearchFilterBar activeTab={activeTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterRole={filterRole} setFilterRole={setFilterRole} />

        <ProjectDetailPanel isOpen={isDetailPanelOpen} onClose={() => setIsDetailPanelOpen(false)} project={projects.find((p) => p.id === selectedProject?.id) || null} onRefresh={fetchData} />

        {/* AREA KONTEN UTAMA */}

        {/* 1. PROYEK */}
        {activeTab === "projects" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader
              title="Data Proyek Klien"
              count={filteredProjects.length}
              badgeColor="green"
              buttonText="Tambah Proyek"
              isAdmin={isAdmin}
              onAdd={() => {
                setEditingProject(null);
                setIsProjectModalOpen(true);
              }}
            >
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                  <LayoutList size={18} />
                </button>
                <button onClick={() => setViewMode("kanban")} className={`p-1.5 rounded-md transition ${viewMode === "kanban" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                  <KanbanSquare size={18} />
                </button>
              </div>
            </SectionHeader>

            <div className="p-0 sm:p-2 bg-gray-50/50">
              {viewMode === "list" ? (
                <ProjectTable
                  projects={filteredProjects}
                  onEdit={(p) => {
                    setEditingProject(p);
                    setIsProjectModalOpen(true);
                  }}
                  onDelete={handleDeleteProject}
                  isAdmin={isAdmin}
                />
              ) : (
                <div className="p-4 overflow-x-auto">
                  <ProjectKanban
                    projects={filteredProjects}
                    onEdit={(p) => {
                      setEditingProject(p);
                      setIsProjectModalOpen(true);
                    }}
                    onDelete={handleDeleteProject}
                    onStatusChange={handleStatusChange}
                    onOpenDetail={(p) => {
                      setSelectedProject(p);
                      setIsDetailPanelOpen(true);
                    }}
                    isAdmin={isAdmin}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. KLIEN */}
        {activeTab === "clients" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader
              title="Direktori Perusahaan Klien"
              count={filteredClients.length}
              badgeColor="purple"
              buttonText="Tambah Klien"
              isAdmin={isAdmin}
              onAdd={() => {
                setEditingClient(null);
                setIsClientModalOpen(true);
              }}
            />
            <ClientTable
              clients={filteredClients}
              onEdit={(c) => {
                setEditingClient(c);
                setIsClientModalOpen(true);
              }}
              onDelete={handleDeleteClient}
              onOpenVault={(c) => {
                setSelectedClientForVault(c);
                setIsCredentialPanelOpen(true);
              }}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* 3. TIM */}
        {activeTab === "teams" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader
              title="Daftar Anggota Tim"
              count={filteredTeams.length}
              badgeColor="blue"
              buttonText="Tambah Anggota"
              isAdmin={isAdmin}
              onAdd={() => {
                setEditingTeam(null);
                setTeamFormData({ name: "", role: "Web Developer", email: "", password: "" });
                setIsTeamModalOpen(true);
              }}
            />
            <TeamTable
              teams={filteredTeams}
              onEdit={(t) => {
                setEditingTeam(t);
                setTeamFormData({ name: t.name, role: t.role, email: t.email, password: "" });
                setIsTeamModalOpen(true);
              }}
              onDelete={handleDeleteTeam}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* 4. MENTEE */}
        {activeTab === "mentees" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader
              title="Daftar Peserta Didik"
              count={filteredMentees.length}
              countLabel="Aktif"
              badgeColor="indigo"
              buttonText="Tambah Peserta"
              isAdmin={isAdmin}
              onAdd={() => {
                setEditingMentee(null);
                setIsMenteeModalOpen(true);
              }}
            />
            <MenteeTable
              mentees={filteredMentees}
              onEdit={(m) => {
                setEditingMentee(m);
                setIsMenteeModalOpen(true);
              }}
              onDelete={handleDeleteMentee}
              isAdmin={isAdmin}
            />
          </div>
        )}
      </div>

      {/* MODAL COMPONENTS */}
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSuccess={fetchData} teams={teams} editData={editingProject} clients={clients} />
      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSuccess={fetchData} editData={editingClient} />
      <MenteeModal isOpen={isMenteeModalOpen} onClose={() => setIsMenteeModalOpen(false)} onSuccess={fetchData} teams={teams} editData={editingMentee} />
      <TeamModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} onSubmit={handleSubmitTeam} isSubmitting={isSubmittingTeam} formData={teamFormData} setFormData={setTeamFormData} isEditMode={!!editingTeam} />
      <ActivityPanel isOpen={isActivityPanelOpen} onClose={() => setIsActivityPanelOpen(false)} activities={activities} />
      <CredentialPanel isOpen={isCredentialPanelOpen} onClose={() => setIsCredentialPanelOpen(false)} client={selectedClientForVault} />
    </div>
  );
}
