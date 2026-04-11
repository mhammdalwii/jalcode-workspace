/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { HistoryIcon, KanbanSquare, LayoutList, Menu } from "lucide-react";
import { TeamMember, Project, Client, Mentee, ActivityLog, ContentPlan } from "@/types";
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
import Sidebar from "@/components/ui/Sidebar";

const ProjectModal = dynamic(() => import("@/components/ui/ProjectModal"), {
  ssr: false,
  loading: () => <div className="hidden">Memuat Form...</div>,
});
const ClientModal = dynamic(() => import("@/components/ui/ClientModal"), { ssr: false });
const MenteeModal = dynamic(() => import("@/components/ui/MenteeModal"), { ssr: false });
const ProjectDetailPanel = dynamic(() => import("@/components/ui/ProjectDetailPanel"), { ssr: false });
import ActivityPanel from "@/components/ui/ActivityPanel";
import CredentialPanel from "@/components/ui/CredentialPanel";
import ContentKanban from "@/components/tables/ContentKanban";
import ContentModal from "@/components/ui/ContentModal";

export default function DashboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE TAB & VIEW (Diperbarui dengan 'dashboard') ---
  const params = useParams();
  const slug = params?.slug?.[0];

  // Kamus Penerjemah URL ke Tab Internal
  const urlToTab: Record<string, any> = {
    "data-proyek": "projects",
    "direktori-tim": "teams",
    "direktori-klien": "clients",
    mentorship: "mentees",
    "kalender-konten": "contents",
  };

  // Kamus Penerjemah Tab Internal ke URL
  const tabToUrl: Record<string, string> = {
    dashboard: "",
    projects: "data-proyek",
    teams: "direktori-tim",
    clients: "direktori-klien",
    mentees: "mentorship",
    contents: "kalender-konten",
  };

  // Tentukan tab aktif berdasarkan URL saat halaman pertama kali dimuat/di-refresh
  const initialTab = slug ? urlToTab[slug] || "dashboard" : "dashboard";
  const [activeTab, setActiveTabState] = useState<any>(initialTab);

  // Fungsi khusus untuk mengganti tab sekaligus memanipulasi URL tanpa loading
  const handleTabChange = (tabId: string) => {
    setActiveTabState(tabId);
    setSearchQuery(""); // Reset kolom pencarian

    // Sihir manipulasi URL:
    const newSlug = tabToUrl[tabId];
    const newUrl = newSlug ? `/dashboard/${newSlug}` : "/dashboard";
    window.history.pushState(null, "", newUrl);
  };

  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [isAdmin, setIsAdmin] = useState(false);

  // --- STATE PENCARIAN & FILTER ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRole, setFilterRole] = useState("All");

  // state untuk log aktivitas
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false);

  // --- STATE KONTEN & BRANDING ---
  const [contents, setContents] = useState<ContentPlan[]>([]);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentPlan | null>(null);

  // --- STATE UI RESPONSIVE ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // --- CEK ROLE SAAT PERTAMA RENDER ---
  useEffect(() => {
    setIsAdmin(isAdminOrFounder());
  }, []);

  // --- FUNGSI FETCH AKTIVITAS ---
  const fetchActivities = async () => {
    try {
      const token = Cookies.get("token");
      const res = await fetch("http://localhost:8080/api/activities/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat riwayat");

      setActivities(data.data || []);
    } catch (err) {
      toast.error("Gagal mengambil log aktivitas");
    }
  };

  // --- FUNGSI FETCH DATA ---
  const fetchData = async () => {
    const token = Cookies.get("token");
    if (!token) return router.push("/login");

    try {
      const [teamsRes, projectsRes, clientsRes, menteesRes, contentsRes] = await Promise.all([
        fetch("http://localhost:8080/api/teams/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/projects/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/clients/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/mentees/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/contents/", { headers: { Authorization: `Bearer ${token}` } }),
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
      const contentsData = await contentsRes.json();

      setTeams(teamsData.data || []);
      setProjects(projectsText ? JSON.parse(projectsText).data || [] : []);
      setClients(clientsData.data || []);
      setMentees(menteesData.data || []);
      setContents(contentsData.data || []);
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
  const handleDeleteContent = (id: number) => deleteData(`http://localhost:8080/api/contents/${id}`, "Konten berhasil dihapus!");

  const handleContentStatusChange = async (contentId: number, newStatus: string) => {
    const content = contents.find((c) => c.id === contentId);
    if (!content || content.status === newStatus) return;

    try {
      const payload = {
        title: content.title,
        platform: content.platform,
        status: newStatus,
        publish_date: content.publish_date ? content.publish_date.split("T")[0] : "",
        team_member_id: content.pic?.id || 0,
        notes: content.notes,
      };
      const res = await fetch(`http://localhost:8080/api/contents/${contentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal mengupdate status konten");
      toast.success(`Status digeser ke ${newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

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

  if (isLoading) return <div className="min-h-screen flex justify-center items-center bg-gray-50 text-gray-600">Memuat Workspace...</div>;

  return (
    <div className="flex h-screen bg-gray-50 text-black overflow-hidden">
      <Toaster position="top-right" />

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex justify-between items-center px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">J</div>
          <h1 className="font-bold text-gray-800">Jalcode</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
          <Menu size={24} />
        </button>
      </div>

      {/* 1. SIDEBAR KIRI */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* 2. KONTEN UTAMA KANAN */}
      <div
        className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"}
          pt-16 md:pt-0
        `}
      >
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
          {/* HEADER HALAMAN DINAMIS */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 mt-2 md:mt-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {activeTab === "dashboard"
                  ? "Overview"
                  : activeTab.replace("contents", "Kalender Konten").replace("projects", "Data Proyek").replace("teams", "Direktori Tim").replace("clients", "Data Klien").replace("mentees", "Mentorship")}
              </h1>
              <p className="text-gray-500 mt-1">Sistem Manajemen Internal Jalcode</p>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setIsActivityPanelOpen(true);
                  fetchActivities();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 shadow-sm transition"
              >
                <HistoryIcon size={18} /> Riwayat Tim
              </button>
            )}
          </div>

          {/* AREA TAB: DASHBOARD (STATISTIK) */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <StatCards
                totalProjects={projects?.length || 0}
                activeProjects={projects?.filter((p) => p.status === "Proses" || p.status === "Antrean").length || 0}
                totalClients={clients?.length || 0}
                totalTeams={teams?.length || 0}
                totalMentees={mentees?.length || 0}
                graduatedMentees={mentees?.filter((m) => m.status === "Lulus").length || 0}
              />

              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center text-gray-500">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Selamat Datang di Jalcode Workspace 🚀</h3>
                <p>Pilih menu di sidebar sebelah kiri untuk mulai mengelola operasional agensi, proyek klien, hingga jadwal konten.</p>
              </div>
            </div>
          )}

          {/* BARIS PENCARIAN (Hanya Muncul jika bukan di tab dashboard) */}
          {activeTab !== "dashboard" && (
            <div className="mb-6">
              <SearchFilterBar activeTab={activeTab as any} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterRole={filterRole} setFilterRole={setFilterRole} />
            </div>
          )}

          <ProjectDetailPanel isOpen={isDetailPanelOpen} onClose={() => setIsDetailPanelOpen(false)} project={projects.find((p) => p.id === selectedProject?.id) || null} onRefresh={fetchData} />

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

          {/* 5. KONTEN */}
          {activeTab === "contents" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <SectionHeader
                title="Kalender Pemasaran & SEO"
                count={contents.length}
                badgeColor="pink"
                buttonText="Tambah Ide"
                isAdmin={isAdmin}
                onAdd={() => {
                  setEditingContent(null);
                  setIsContentModalOpen(true);
                }}
              />
              <ContentKanban
                contents={contents}
                onEdit={(c) => {
                  setEditingContent(c);
                  setIsContentModalOpen(true);
                }}
                onDelete={handleDeleteContent}
                onStatusChange={handleContentStatusChange}
                isAdmin={isAdmin}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODAL COMPONENTS */}
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSuccess={fetchData} teams={teams} editData={editingProject} clients={clients} />
      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSuccess={fetchData} editData={editingClient} />
      <MenteeModal isOpen={isMenteeModalOpen} onClose={() => setIsMenteeModalOpen(false)} onSuccess={fetchData} teams={teams} editData={editingMentee} />
      <TeamModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} onSubmit={handleSubmitTeam} isSubmitting={isSubmittingTeam} formData={teamFormData} setFormData={setTeamFormData} isEditMode={!!editingTeam} />
      <ActivityPanel isOpen={isActivityPanelOpen} onClose={() => setIsActivityPanelOpen(false)} activities={activities} />
      <CredentialPanel isOpen={isCredentialPanelOpen} onClose={() => setIsCredentialPanelOpen(false)} client={selectedClientForVault} />
      <ContentModal isOpen={isContentModalOpen} onClose={() => setIsContentModalOpen(false)} onSuccess={fetchData} editData={editingContent} teams={teams} />
    </div>
  );
}
