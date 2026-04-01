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
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      <div className="relative w-full sm:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={`Cari nama ${activeTab === "projects" ? "proyek atau PIC" : "anggota atau email"}...`}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Filter size={18} className="text-gray-500" />
        {activeTab === "projects" ? (
          <select className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">Semua Status</option>
            <option value="Antrean">Antrean</option>
            <option value="Proses">Proses</option>
            <option value="Revisi">Revisi</option>
            <option value="Selesai">Selesai</option>
          </select>
        ) : (
          <select className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="All">Semua Divisi</option>
            <option value="Web Developer">Web Developer</option>
            <option value="Mobile Developer">Mobile Developer</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
            <option value="IoT Engineer">IoT Engineer</option>
            <option value="Tech Mentor">Tech Mentor</option>
          </select>
        )}
      </div>
    </div>
  );
}
