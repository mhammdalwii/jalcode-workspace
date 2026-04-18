import { Briefcase, Users, Building2, GraduationCap, CalendarRange, LayoutDashboard, LogOut, ChevronLeft, ChevronRight, X, Receipt, Settings } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setActiveTab: (tab: any) => void;
  isAdmin: boolean;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isAdmin, onLogout, isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const MENU_ITEMS = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "Data Proyek", icon: Briefcase },
    { id: "invoices", label: "Data Tagihan", icon: Receipt },
    { id: "teams", label: "Direktori Tim", icon: Users },
    { id: "clients", label: "Direktori Klien", icon: Building2 },
    { id: "mentees", label: "Mentorship", icon: GraduationCap },
    { id: "contents", label: "Kalender Konten", icon: CalendarRange },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <>
      {/* OVERLAY HITAM UNTUK MOBILE (Muncul jika sidebar HP terbuka) */}
      {isMobileOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />}

      {/* KOMPONEN SIDEBAR UTAMA */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-20" : "w-64"} 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* BRANDING LOGO & TOMBOL TUTUP (MOBILE) */}
        <div className={`h-20 flex items-center border-b border-slate-800 ${isCollapsed ? "justify-center px-0" : "px-6 justify-between"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-8 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">J</div>
            {!isCollapsed && (
              <div className="whitespace-nowrap transition-opacity duration-300">
                <h1 className="text-white font-bold text-lg leading-tight">Jalcode</h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Workspace</p>
              </div>
            )}
          </div>

          {/* Tombol Tutup Khusus HP */}
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-400 hover:text-white p-2">
            <X size={20} />
          </button>
        </div>

        {/* MENU NAVIGASI */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 overflow-x-hidden">
          {!isCollapsed && <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 whitespace-nowrap">Menu Utama</p>}

          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false); // Tutup otomatis di HP jika menu diklik
                }}
                title={isCollapsed ? item.label : ""} // Tooltip saat di-hover dalam mode menyusut
                className={`w-full flex items-center rounded-lg font-medium transition-all duration-200 group
                  ${isCollapsed ? "justify-center p-3" : "px-3 py-2.5 gap-3"}
                  ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"}
                `}
              >
                <Icon size={20} className={`shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* FOOTER: TOMBOL LOGOUT & TOGGLE COLLAPSE */}
        <div className="p-3 border-t border-slate-800 flex flex-col gap-2">
          <button
            onClick={onLogout}
            title={isCollapsed ? "Keluar" : ""}
            className={`w-full flex items-center rounded-lg font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors
              ${isCollapsed ? "justify-center p-3" : "px-3 py-2.5 gap-3"}
            `}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Keluar </span>}
          </button>

          {/* Tombol Panah (Collapse) - Hanya muncul di Desktop */}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex w-full items-center justify-center p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>
    </>
  );
}
