import { Search, Filter } from "lucide-react";

interface SearchFilterBarProps {
  activeTab: "projects" | "teams" | "clients" | "mentees";
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterRole: string;
  setFilterRole: (val: string) => void;
}

export default function SearchFilterBar({ activeTab, searchQuery, setSearchQuery, filterStatus, setFilterStatus, filterRole, setFilterRole }: SearchFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      {/* Search Bar (Muncul di Semua Tab) */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Cari nama, perusahaan, atau email..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* FILTER KHUSUS PROYEK */}
      {activeTab === "projects" && (
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">Semua Status</option>
            <option value="Antrean">Antrean</option>
            <option value="Proses">Proses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      )}

      {/* FILTER KHUSUS TIM */}
      {activeTab === "teams" && (
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="All">Semua Role</option>
            <option value="Web Developer">Web Developer</option>
            <option value="Mobile Developer">Mobile Developer</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
      )}

      {/* FILTER KHUSUS MENTEE */}
      {activeTab === "mentees" && (
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Lulus">Lulus</option>
            <option value="Drop Out">Drop Out</option>
          </select>
        </div>
      )}
    </div>
  );
}
