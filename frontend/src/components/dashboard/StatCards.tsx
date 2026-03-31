import { Users, FolderOpen, Clock, CheckCircle } from "lucide-react";

interface StatCardsProps {
  totalTeams: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
}

export default function StatCards({ totalTeams, totalProjects, activeProjects, completedProjects }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Total Pasukan</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {totalTeams} <span className="text-sm font-normal text-gray-500">Orang</span>
          </h3>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <FolderOpen size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Total Proyek</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {totalProjects} <span className="text-sm font-normal text-gray-500">Klien</span>
          </h3>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Sedang Berjalan</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {activeProjects} <span className="text-sm font-normal text-gray-500">Proyek</span>
          </h3>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
          <CheckCircle size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Selesai</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {completedProjects} <span className="text-sm font-normal text-gray-500">Proyek</span>
          </h3>
        </div>
      </div>
    </div>
  );
}
