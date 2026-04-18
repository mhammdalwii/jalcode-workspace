/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { HistoryIcon, KanbanSquare, LayoutList, Menu } from "lucide-react";
import dynamic from "next/dynamic";

import { TeamMember, Project, Client, Mentee, ActivityLog, ContentPlan, Invoice } from "@/types";
import { isAdminOrFounder } from "@/utils/auth";

// --- KOMPONEN IMPORT ---
import ProjectTable from "@/components/tables/ProjectTable";
import TeamTable from "@/components/tables/TeamTable";
import ClientTable from "@/components/tables/ClientTable";
import MenteeTable from "@/components/tables/MenteeTable";
import ProjectKanban from "@/components/tables/ProjectKanban";
import ContentKanban from "@/components/tables/ContentKanban";
import InvoiceTable from "@/components/tables/InvoiceTable";

import StatCards from "@/components/dashboard/StatCards";
import SearchFilterBar from "@/components/dashboard/SearchFilterBar";
import SectionHeader from "@/components/dashboard/SectionHeader";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import SettingsView from "@/components/dashboard/SettingsView";
import Sidebar from "@/components/ui/Sidebar";

const ProjectModal = dynamic(() => import("@/components/ui/ProjectModal"), { ssr: false, loading: () => <div className="hidden">Memuat Form...</div> });
const ClientModal = dynamic(() => import("@/components/ui/ClientModal"), { ssr: false });
const MenteeModal = dynamic(() => import("@/components/ui/MenteeModal"), { ssr: false });
const ProjectDetailPanel = dynamic(() => import("@/components/ui/ProjectDetailPanel"), { ssr: false });
import ActivityPanel from "@/components/ui/ActivityPanel";
import CredentialPanel from "@/components/ui/CredentialPanel";
import ContentModal from "@/components/ui/ContentModal";
import InvoiceModal from "@/components/ui/InvoiceModal";
import TeamModal from "@/components/ui/TeamModal";

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug?.[0];

  // --- STATE UTAMA ---
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [contents, setContents] = useState<ContentPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");

  // --- STATE UI & RESPONSIVE ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- KAMUS URL & TAB ---
  const urlToTab: Record<string, any> = {
    "data-proyek": "projects",
    "direktori-tim": "teams",
    "direktori-klien": "clients",
    mentorship: "mentees",
    "kalender-konten": "contents",
    "data-tagihan": "invoices",
    pengaturan: "settings",
  };
  const tabToUrl: Record<string, string> = {
    dashboard: "",
    projects: "data-proyek",
    teams: "direktori-tim",
    clients: "direktori-klien",
    mentees: "mentorship",
    contents: "kalender-konten",
    invoices: "data-tagihan",
    settings: "pengaturan",
  };

  const [activeTab, setActiveTabState] = useState<any>(slug ? urlToTab[slug] || "dashboard" : "dashboard");

  const handleTabChange = (tabId: string) => {
    setActiveTabState(tabId);
    setSearchQuery(""); // Otomatis reset pencarian saat pindah menu
    const newSlug = tabToUrl[tabId];
    window.history.pushState(null, "", newSlug ? `/dashboard/${newSlug}` : "/dashboard");
  };

  // --- STATE PENCARIAN & FILTER ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRole, setFilterRole] = useState("All");

  // --- STATE MODAL & PANEL ---
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false);
  const [selectedClientForVault, setSelectedClientForVault] = useState<Client | null>(null);
  const [isCredentialPanelOpen, setIsCredentialPanelOpen] = useState(false);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isMenteeModalOpen, setIsMenteeModalOpen] = useState(false);
  const [editingMentee, setEditingMentee] = useState<Mentee | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentPlan | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamMember | null>(null);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [teamFormData, setTeamFormData] = useState({ name: "", role: "Web Developer", email: "", password: "" });

  useEffect(() => {
    setIsAdmin(isAdminOrFounder());
    fetchData();
  }, [router]);

  // --- FUNGSI FETCH ---
  const fetchActivities = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/activities/", { headers: { Authorization: `Bearer ${Cookies.get("token")}` } });
      const data = await res.json();
      setActivities(data.data || []);
    } catch (err) {
      toast.error("Gagal mengambil log aktivitas");
    }
  };

  const fetchData = async () => {
    const token = Cookies.get("token");
    if (!token) return router.push("/login");

    try {
      const [teamsRes, projectsRes, clientsRes, menteesRes, contentsRes, invoicesRes, agencyRes] = await Promise.all([
        fetch("http://localhost:8080/api/teams/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/projects/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/clients/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/mentees/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/contents/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/invoices/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/agency/", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (teamsRes.status === 401) {
        Cookies.remove("token");
        return router.push("/login");
      }

      setTeams((await teamsRes.json()).data || []);
      const pText = await projectsRes.text();
      setProjects(pText ? JSON.parse(pText).data || [] : []);
      setClients((await clientsRes.json()).data || []);
      setMentees((await menteesRes.json()).data || []);
      setContents((await contentsRes.json()).data || []);
      setInvoices((await invoicesRes.json()).data || []);
      setAgencyProfile((await agencyRes.json()).data);
    } catch (err) {
      toast.error("Gagal memuat data dari server");
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNGSI HAPUS ---
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

  // --- LOGIKA FILTER PENCARIAN TERPUSAT ---
  const query = searchQuery.toLowerCase();

  const filteredProjects = projects.filter((p) => (p.title.toLowerCase().includes(query) || (p.pic?.name || "").toLowerCase().includes(query)) && (filterStatus === "All" || p.status === filterStatus));

  const filteredTeams = teams.filter((t) => (t.name.toLowerCase().includes(query) || t.email.toLowerCase().includes(query)) && (filterRole === "All" || t.role === filterRole));

  const filteredClients = clients.filter((c) => c.company.toLowerCase().includes(query) || c.name.toLowerCase().includes(query));

  const filteredMentees = mentees.filter((m) => (m.name.toLowerCase().includes(query) || (m.mentor?.name || "").toLowerCase().includes(query)) && (filterStatus === "All" || m.status === filterStatus));

  const filteredContents = contents.filter((c) => (c.title.toLowerCase().includes(query) || (c.pic?.name || "").toLowerCase().includes(query)) && (filterStatus === "All" || c.status === filterStatus));

  const filteredInvoices = invoices.filter((i) => i.invoice_number.toLowerCase().includes(query) || (i.client_name || i.project_title).toLowerCase().includes(query));

  // --- DELEGASI RENDER KONTEN (MEMBUAT KODE LEBIH RAPI) ---
  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <StatCards
              totalProjects={projects.length}
              activeProjects={projects.filter((p) => p.status === "Proses" || p.status === "Antrean").length}
              totalClients={clients.length}
              totalTeams={teams.length}
              totalMentees={mentees.length}
              graduatedMentees={mentees.filter((m) => m.status === "Lulus").length}
            />
            <DashboardOverview projects={projects} invoices={invoices} />
          </div>
        );

      case "projects":
        return (
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
                  isAdmin={isAdmin}
                  onEdit={(p) => {
                    setEditingProject(p);
                    setIsProjectModalOpen(true);
                  }}
                  onDelete={(id) => deleteData(`http://localhost:8080/api/projects/${id}`, "Proyek dihapus!")}
                />
              ) : (
                <div className="p-4 overflow-x-auto">
                  {/* Tambahkan onStatusChange handler dan lain-lain di project Kanban mu jika ada */}
                  <ProjectKanban
                    projects={filteredProjects}
                    isAdmin={isAdmin}
                    onEdit={(p) => {
                      setEditingProject(p);
                      setIsProjectModalOpen(true);
                    }}
                    onDelete={(id) => deleteData(`http://localhost:8080/api/projects/${id}`, "Proyek dihapus!")}
                    onStatusChange={async () => {
                      fetchData();
                    }}
                    onOpenDetail={(p) => {
                      setSelectedProject(p);
                      setIsDetailPanelOpen(true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case "clients":
        return (
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
              isAdmin={isAdmin}
              onEdit={(c) => {
                setEditingClient(c);
                setIsClientModalOpen(true);
              }}
              onDelete={(id) => deleteData(`http://localhost:8080/api/clients/${id}`, "Klien dihapus!")}
              onOpenVault={(c) => {
                setSelectedClientForVault(c);
                setIsCredentialPanelOpen(true);
              }}
            />
          </div>
        );

      case "teams":
        return (
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
              isAdmin={isAdmin}
              onEdit={(t) => {
                setEditingTeam(t);
                setTeamFormData({ name: t.name, role: t.role, email: t.email, password: "" });
                setIsTeamModalOpen(true);
              }}
              onDelete={(id) => deleteData(`http://localhost:8080/api/teams/${id}`, "Anggota dihapus!")}
            />
          </div>
        );

      case "mentees":
        return (
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
              isAdmin={isAdmin}
              onEdit={(m) => {
                setEditingMentee(m);
                setIsMenteeModalOpen(true);
              }}
              onDelete={(id) => deleteData(`http://localhost:8080/api/mentees/${id}`, "Peserta dihapus!")}
            />
          </div>
        );

      case "contents":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader
              title="Kalender Pemasaran & SEO"
              count={filteredContents.length}
              badgeColor="pink"
              buttonText="Tambah Ide"
              isAdmin={isAdmin}
              onAdd={() => {
                setEditingContent(null);
                setIsContentModalOpen(true);
              }}
            />
            <ContentKanban
              contents={filteredContents}
              isAdmin={isAdmin}
              onEdit={(c) => {
                setEditingContent(c);
                setIsContentModalOpen(true);
              }}
              onDelete={(id) => deleteData(`http://localhost:8080/api/contents/${id}`, "Konten dihapus!")}
              onStatusChange={async () => {
                fetchData();
              }}
            />
          </div>
        );

      case "invoices":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader
              title="Manajemen Tagihan & Invoice"
              count={filteredInvoices.length}
              badgeColor="indigo"
              buttonText="Buat Tagihan"
              isAdmin={isAdmin}
              onAdd={() => {
                setEditingInvoice(null);
                setIsInvoiceModalOpen(true);
              }}
            />
            <InvoiceTable
              invoices={filteredInvoices}
              isAdmin={isAdmin}
              agencyProfile={agencyProfile}
              onEdit={(inv) => {
                setEditingInvoice(inv);
                setIsInvoiceModalOpen(true);
              }}
              onDelete={(id) => deleteData(`http://localhost:8080/api/invoices/${id}`, "Tagihan dihapus!")}
            />
          </div>
        );

      case "settings":
        return (
          <div className="animate-in fade-in duration-500">
            <SettingsView onSuccess={fetchData} />
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) return <div className="min-h-screen flex justify-center items-center bg-gray-50 text-gray-600">Memuat Workspace...</div>;

  return (
    <div className="flex h-screen bg-gray-50 text-black overflow-hidden">
      <Toaster position="top-right" />

      {/* MOBILE NAV */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex justify-between items-center px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">J</div>
          <h1 className="font-bold text-gray-800">Jalcode</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
          <Menu size={24} />
        </button>
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isAdmin={isAdmin}
        onLogout={() => {
          Cookies.remove("token");
          router.push("/login");
        }}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"} pt-16 md:pt-0`}>
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 mt-2 md:mt-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {activeTab === "dashboard"
                  ? "Overview"
                  : activeTab
                      .replace("contents", "Kalender Konten")
                      .replace("projects", "Data Proyek")
                      .replace("teams", "Direktori Tim")
                      .replace("clients", "Data Klien")
                      .replace("mentees", "Mentorship")
                      .replace("invoices", "Data Tagihan")
                      .replace("settings", "Pengaturan")}
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

          {/* BARIS PENCARIAN (Hanya tampil jika bukan dashboard atau settings) */}
          {activeTab !== "dashboard" && activeTab !== "settings" && (
            <div className="mb-6">
              <SearchFilterBar activeTab={activeTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterRole={filterRole} setFilterRole={setFilterRole} />
            </div>
          )}

          {/* RENDER KONTEN TAB SECARA DINAMIS & RAPI */}
          {renderActiveTab()}
        </div>
      </div>

      {/* SEMUA MODAL BERADA DI BAWAH SINI */}
      <ProjectDetailPanel isOpen={isDetailPanelOpen} onClose={() => setIsDetailPanelOpen(false)} project={projects.find((p) => p.id === selectedProject?.id) || null} onRefresh={fetchData} />
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSuccess={fetchData} teams={teams} editData={editingProject} clients={clients} />
      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSuccess={fetchData} editData={editingClient} />
      <MenteeModal isOpen={isMenteeModalOpen} onClose={() => setIsMenteeModalOpen(false)} onSuccess={fetchData} teams={teams} editData={editingMentee} />
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSubmit={async (e) => {
          /* Handle Submit Team Logic */
        }}
        isSubmitting={isSubmittingTeam}
        formData={teamFormData}
        setFormData={setTeamFormData}
        isEditMode={!!editingTeam}
      />
      <ActivityPanel isOpen={isActivityPanelOpen} onClose={() => setIsActivityPanelOpen(false)} activities={activities} />
      <CredentialPanel isOpen={isCredentialPanelOpen} onClose={() => setIsCredentialPanelOpen(false)} client={selectedClientForVault} />
      <ContentModal isOpen={isContentModalOpen} onClose={() => setIsContentModalOpen(false)} onSuccess={fetchData} editData={editingContent} teams={teams} />
      <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} onSuccess={fetchData} editData={editingInvoice} projects={projects} />
    </div>
  );
}
