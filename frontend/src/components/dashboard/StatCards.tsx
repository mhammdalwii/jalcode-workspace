import { Briefcase, Users, Building2, GraduationCap, TrendingUp, CheckCircle } from "lucide-react";

interface StatCardsProps {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  totalTeams: number;
  totalMentees: number;
  graduatedMentees: number;
}

export default function StatCards({ totalProjects, activeProjects, totalClients, totalTeams, totalMentees, graduatedMentees }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Kartu 1: Proyek Aktif */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
          <Briefcase size={28} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Total Proyek</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{totalProjects}</h3>
            <span className="text-xs font-medium text-blue-600 mb-1 flex items-center gap-1">
              <TrendingUp size={12} /> {activeProjects} Berjalan
            </span>
          </div>
        </div>
      </div>

      {/* Kartu 2: Klien Terdaftar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
          <Building2 size={28} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Mitra & Klien</p>
          <h3 className="text-2xl font-bold text-gray-900">{totalClients}</h3>
          <p className="text-xs text-gray-400 mt-1">Perusahaan terdaftar</p>
        </div>
      </div>

      {/* Kartu 3: Anggota Tim */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="p-4 bg-orange-50 text-orange-600 rounded-full">
          <Users size={28} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Anggota Tim</p>
          <h3 className="text-2xl font-bold text-gray-900">{totalTeams}</h3>
          <p className="text-xs text-gray-400 mt-1">Developer & Desainer</p>
        </div>
      </div>

      {/* Kartu 4: Peserta Mentorship */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
          <GraduationCap size={28} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Mentorship</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{totalMentees}</h3>
            <span className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
              <CheckCircle size={12} /> {graduatedMentees} Lulus
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
