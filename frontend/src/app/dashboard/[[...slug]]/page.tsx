/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { HistoryIcon, KanbanSquare, LayoutList, Menu } from "lucide-react";
import dynamic from "next/dynamic";

import { TeamMember, Project, Client, Mentee, ActivityLog, ContentPlan, Invoice, Pricelist, Category, MeetingNote } from "@/types";
import { isAdminOrFounder } from "@/utils/auth";
import { fetchWithAuth } from "@/utils/fetchApi";

import Sidebar from "@/components/ui/Sidebar";
import useSWR from "swr";

const FeatureLoading = () => <div className="p-8 text-center text-gray-500">Memuat fitur...</div>;
const EMPTY_ARRAY: never[] = [];

const ProjectTable = dynamic(() => import("@/components/tables/ProjectTable"), { loading: FeatureLoading });
const TeamTable = dynamic(() => import("@/components/tables/TeamTable"), { loading: FeatureLoading });
const ClientTable = dynamic(() => import("@/components/tables/ClientTable"), { loading: FeatureLoading });
const MenteeTable = dynamic(() => import("@/components/tables/MenteeTable"), { loading: FeatureLoading });
const ProjectKanban = dynamic(() => import("@/components/tables/ProjectKanban"), { loading: FeatureLoading });
const InvoiceTable = dynamic(() => import("@/components/tables/InvoiceTable"), { loading: FeatureLoading });
const PricelistTable = dynamic(() => import("@/components/tables/PricelistTable"), { loading: FeatureLoading });
const ContentListTable = dynamic(() => import("@/components/tables/ContentListTable"), { loading: FeatureLoading });
const MeetingTable = dynamic(() => import("@/components/tables/MeetingTable"), { loading: FeatureLoading });
const StatCards = dynamic(() => import("@/components/dashboard/StatCards"), { loading: FeatureLoading });
const SearchFilterBar = dynamic(() => import("@/components/dashboard/SearchFilterBar"));
const SectionHeader = dynamic(() => import("@/components/dashboard/SectionHeader"));
const DashboardOverview = dynamic(() => import("@/components/dashboard/DashboardOverview"), { loading: FeatureLoading });
const SettingsView = dynamic(() => import("@/components/dashboard/SettingsView"), { loading: FeatureLoading });
const ProjectModal = dynamic(() => import("@/components/ui/ProjectModal"), { ssr: false });
const ClientModal = dynamic(() => import("@/components/ui/ClientModal"), { ssr: false });
const MenteeModal = dynamic(() => import("@/components/ui/MenteeModal"), { ssr: false });
const ProjectDetailPanel = dynamic(() => import("@/components/ui/ProjectDetailPanel"), { ssr: false });
const ActivityPanel = dynamic(() => import("@/components/ui/ActivityPanel"), { ssr: false });
const CredentialPanel = dynamic(() => import("@/components/ui/CredentialPanel"), { ssr: false });
const ContentModal = dynamic(() => import("@/components/ui/ContentModal"), { ssr: false });
const InvoiceModal = dynamic(() => import("@/components/ui/InvoiceModal"), { ssr: false });
const TeamModal = dynamic(() => import("@/components/ui/TeamModal"), { ssr: false });
const FeeCalculatorModal = dynamic(() => import("@/components/ui/FeeCalculatorModal"), { ssr: false });
const PricelistModal = dynamic(() => import("@/components/ui/PricelistModal"), { ssr: false });
const ConfirmModal = dynamic(() => import("@/components/ui/ConfirmModal"), { ssr: false });
const MeetingModal = dynamic(() => import("@/components/ui/MeetingModal"), { ssr: false });

const fetcher = async (url: string) => {
  const res = await fetchWithAuth(url);
  const text = await res.text();
  return text ? JSON.parse(text) : { data: [] };
};

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug?.[0];

  const {
    data: dashboardRes,
    mutate: mutateDashboard,
    isLoading: isDashboardLoading,
  } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard-utama`, fetcher, {
    shouldRetryOnError: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    revalidateOnFocus: false,
  });

  // --- STATE UTAMA ---
  const teams: TeamMember[] = dashboardRes?.data?.teams || EMPTY_ARRAY;
  const projects: Project[] = dashboardRes?.data?.projects || EMPTY_ARRAY;
  const clients: Client[] = dashboardRes?.data?.clients || EMPTY_ARRAY;
  const mentees: Mentee[] = dashboardRes?.data?.mentees || EMPTY_ARRAY;
  const contents: ContentPlan[] = dashboardRes?.data?.contents || EMPTY_ARRAY;
  const invoices: Invoice[] = dashboardRes?.data?.invoices || EMPTY_ARRAY;
  const agencyProfile = dashboardRes?.data?.agency || null;
  const pricelists: Pricelist[] = dashboardRes?.data?.pricelists || EMPTY_ARRAY;
  const categories: Category[] = dashboardRes?.data?.categories || EMPTY_ARRAY;

  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const isLoading = isDashboardLoading && !dashboardRes;
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFounder, setIsFounder] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [selectedInvoiceForFee, setSelectedInvoiceForFee] = useState<Invoice | null>(null);

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
    "katalog-harga": "pricelist",
    "jurnal-rapat": "meetings",
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
    pricelist: "katalog-harga",
    meetings: "jurnal-rapat",
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

  // --- STATE MODAL PRICELIST ---
  const [isPricelistModalOpen, setIsPricelistModalOpen] = useState(false);
  const [editingPricelist, setEditingPricelist] = useState<Pricelist | null>(null);

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

  // state meeting
  const [meetings, setMeetings] = useState<MeetingNote[]>([]);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingNote | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    url: string;
    successMsg: string;
    onRefresh: () => void;
  } | null>(null);
  const [isDeletingData, setIsDeletingData] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminOrFounder());
    setIsFounder(Cookies.get("role") === "Founder");
  }, [router]);

  // --- FUNGSI FETCH ---
  const fetchActivities = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/`);
      const data = await res.json();
      setActivities(data.data || []);
    } catch (err) {
      toast.error("Gagal mengambil log aktivitas");
    }
  };

  // --- FUNGSI HAPUS ---
  const deleteData = async (url: string, successMsg: string, updateLocalState: () => void, skipConfirm: boolean = false) => {
    if (!skipConfirm) {
      if (!confirm(`Yakin ingin menghapus data ini?`)) return;
    }

    try {
      const res = await fetchWithAuth(url, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus data");
      }
      toast.success(successMsg);
      updateLocalState();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const executeDeleteGlobal = async () => {
    if (!deleteConfirm) return;
    setIsDeletingData(true);
    try {
      const res = await fetchWithAuth(deleteConfirm.url, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus data");
      }
      toast.success(deleteConfirm.successMsg);
      deleteConfirm.onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeletingData(false);
      setDeleteConfirm(null);
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/meetings/`);
      const data = await res.json();
      setMeetings(data.data || []);
    } catch (err) {
      toast.error("Gagal mengambil data jurnal rapat");
    }
  };

  useEffect(() => {
    if (activeTab === "meetings") {
      fetchMeetings();
    }
  }, [activeTab]);

  // --- LOGIKA FILTER PENCARIAN TERPUSAT ---
  const query = searchQuery.toLowerCase();

  const filteredProjects = useMemo(() => projects.filter((p) => (p.title.toLowerCase().includes(query) || (p.pic?.name || "").toLowerCase().includes(query)) && (filterStatus === "All" || p.status === filterStatus)), [projects, query, filterStatus]);

  const filteredTeams = useMemo(() => teams.filter((t) => (t.name.toLowerCase().includes(query) || t.email.toLowerCase().includes(query)) && (filterRole === "All" || t.role === filterRole)), [teams, query, filterRole]);

  const filteredClients = useMemo(() => clients.filter((c) => c.company.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)), [clients, query]);

  const filteredMentees = useMemo(() => mentees.filter((m) => (m.name.toLowerCase().includes(query) || (m.mentor?.name || "").toLowerCase().includes(query)) && (filterStatus === "All" || m.status === filterStatus)), [mentees, query, filterStatus]);

  const filteredContents = useMemo(() => contents.filter((c) => (c.title.toLowerCase().includes(query) || (c.pics && c.pics.some((p) => p.name.toLowerCase().includes(query)))) && (filterStatus === "All" || c.status === filterStatus)), [contents, query, filterStatus]);

  const filteredInvoices = useMemo(() => invoices.filter((i) => i.invoice_number.toLowerCase().includes(query) || (i.client_name || i.project_title).toLowerCase().includes(query)), [invoices, query]);

  const filteredPricelists = useMemo(() => pricelists.filter((p) => p.service_name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)), [pricelists, query]);

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
                  onDelete={(id) => deleteData(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, "Proyek dihapus!", mutateDashboard, true)}
                />
              ) : (
                <div className="p-4 overflow-x-auto">
                  <ProjectKanban
                    projects={filteredProjects}
                    isAdmin={isAdmin}
                    onEdit={(p) => {
                      setEditingProject(p);
                      setIsProjectModalOpen(true);
                    }}
                    onDelete={(id) => deleteData(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, "Proyek dihapus!", mutateDashboard, true)}
                    onStatusChange={async () => {
                      mutateDashboard(); // 🚀 Refaktor SWR
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
              onDelete={(id) => deleteData(`${process.env.NEXT_PUBLIC_API_URL}/api/clients/${id}`, "Klien dihapus!", mutateDashboard, true)}
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
              onDelete={(id) => deleteData(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/${id}`, "Anggota dihapus!", mutateDashboard, true)}
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
              onDelete={(id) => deleteData(`${process.env.NEXT_PUBLIC_API_URL}/api/mentees/${id}`, "Peserta dihapus!", mutateDashboard, true)}
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
              isAdmin={true}
              onAdd={() => {
                setEditingContent(null);
                setIsContentModalOpen(true);
              }}
            />
            <ContentListTable
              contents={filteredContents}
              isAdmin={isAdmin}
              isFounder={isFounder}
              onEdit={(c) => {
                setEditingContent(c);
                setIsContentModalOpen(true);
              }}
              onDelete={(id) => deleteData(`${process.env.NEXT_PUBLIC_API_URL}/api/contents/${id}`, "Konten dihapus!", mutateDashboard, true)}
              onStatusChange={async (id, newStatus, reason) => {
                try {
                  const payload: any = { status: newStatus };
                  if (reason) payload.reason = reason;

                  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/contents/${id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  if (!res.ok) throw new Error("Gagal mengubah status");

                  toast.success(`Status dipindah ke ${newStatus}`);
                  mutateDashboard();
                } catch (err) {
                  toast.error("Terjadi kesalahan saat memindah status");
                }
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
              onDelete={(id) => deleteData(`${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`, "Tagihan dihapus!", mutateDashboard, true)}
              onCalculateFee={(inv) => {
                setSelectedInvoiceForFee(inv);
                setIsFeeModalOpen(true);
              }}
            />
          </div>
        );

      case "pricelist":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader
              title="Katalog Standar Harga Layanan"
              count={filteredPricelists.length}
              badgeColor="blue"
              buttonText="Tambah Item Harga"
              isAdmin={isAdmin}
              onAdd={() => {
                setEditingPricelist(null);
                setIsPricelistModalOpen(true);
              }}
            />
            <PricelistTable
              pricelists={filteredPricelists}
              isAdmin={isAdmin}
              onEdit={(item) => {
                setEditingPricelist(item);
                setIsPricelistModalOpen(true);
              }}
              onDelete={(id) => deleteData(`${process.env.NEXT_PUBLIC_API_URL}/api/pricelists/${id}`, "Item harga dihapus!", mutateDashboard, true)}
            />
          </div>
        );

      case "meetings":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader
              title="Jurnal Rapat & Penugasan Tim"
              count={meetings.length}
              badgeColor="blue"
              buttonText="Buat Jurnal Baru"
              isAdmin={isAdmin}
              onAdd={() => {
                setEditingMeeting(null);
                setIsMeetingModalOpen(true);
              }}
            />
            <MeetingTable
              meetings={meetings.filter((m) => m.title.toLowerCase().includes(query) || (m.notes || "").toLowerCase().includes(query))}
              isAdmin={isAdmin}
              onEdit={(meeting) => {
                setEditingMeeting(meeting);
                setIsMeetingModalOpen(true);
              }}
              onDelete={(id) => deleteData(`${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${id}`, "Jurnal rapat dihapus!", fetchMeetings, true)}
              onToggleAction={async (actionId) => {
                try {
                  await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/meetings/actions/${actionId}/status`, { method: "PATCH" });
                  fetchMeetings();
                } catch (err) {
                  toast.error("Gagal mengubah status tugas");
                }
              }}
            />
          </div>
        );

      case "settings":
        return (
          <div className="animate-in fade-in duration-500">
            <SettingsView onSuccess={mutateDashboard} />
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
          Cookies.remove("role");
          Cookies.remove("refresh_token");
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
      {isDetailPanelOpen && <ProjectDetailPanel isOpen onClose={() => setIsDetailPanelOpen(false)} project={projects.find((p) => p.id === selectedProject?.id) || null} onRefresh={mutateDashboard} />}
      {isProjectModalOpen && <ProjectModal isOpen onClose={() => setIsProjectModalOpen(false)} onSuccess={mutateDashboard} teams={teams} editData={editingProject} clients={clients} categories={categories} />}
      {isClientModalOpen && <ClientModal isOpen onClose={() => setIsClientModalOpen(false)} onSuccess={mutateDashboard} editData={editingClient} />}
      {isMenteeModalOpen && <MenteeModal isOpen onClose={() => setIsMenteeModalOpen(false)} onSuccess={mutateDashboard} teams={teams} editData={editingMentee} />}
      {isTeamModalOpen && <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmittingTeam(true);

          try {
            const url = editingTeam ? `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${editingTeam.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/teams/`;
            const method = editingTeam ? "PUT" : "POST";

            const res = await fetchWithAuth(url, {
              method,
              body: JSON.stringify(teamFormData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal menyimpan data tim");

            toast.success(editingTeam ? "Data anggota diperbarui!" : "Anggota baru ditambahkan!");
            mutateDashboard(); // 🚀 Refaktor SWR

            setIsTeamModalOpen(false);
          } catch (err: any) {
            toast.error(err.message);
          } finally {
            setIsSubmittingTeam(false);
          }
        }}
        isSubmitting={isSubmittingTeam}
        formData={teamFormData}
        setFormData={setTeamFormData}
        isEditMode={!!editingTeam}
      />}
      {isActivityPanelOpen && <ActivityPanel isOpen onClose={() => setIsActivityPanelOpen(false)} activities={activities} />}
      {isCredentialPanelOpen && <CredentialPanel isOpen onClose={() => setIsCredentialPanelOpen(false)} client={selectedClientForVault} />}
      {isContentModalOpen && <ContentModal isOpen onClose={() => setIsContentModalOpen(false)} onSuccess={mutateDashboard} editData={editingContent} teams={teams} />}
      {isInvoiceModalOpen && <InvoiceModal isOpen onClose={() => setIsInvoiceModalOpen(false)} onSuccess={mutateDashboard} editData={editingInvoice} projects={projects} />}
      {isFeeModalOpen && <FeeCalculatorModal isOpen onClose={() => setIsFeeModalOpen(false)} invoice={selectedInvoiceForFee} project={projects.find((p) => p.id === selectedInvoiceForFee?.project_id)} />}
      {isPricelistModalOpen && <PricelistModal isOpen onClose={() => setIsPricelistModalOpen(false)} onSuccess={mutateDashboard} editData={editingPricelist} categories={categories} />}
      {deleteConfirm !== null && <ConfirmModal isOpen onClose={() => setDeleteConfirm(null)} onConfirm={executeDeleteGlobal} isLoading={isDeletingData} title={""} message={""} />}
      {isMeetingModalOpen && <MeetingModal isOpen onClose={() => setIsMeetingModalOpen(false)} project={null} teams={teams} onRefresh={fetchMeetings} editData={editingMeeting} />}
    </div>
  );
}
