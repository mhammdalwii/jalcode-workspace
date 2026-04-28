import { Edit, Trash2, Clock, CheckCircle, AlertCircle, PlayCircle, Building2, User } from "lucide-react";
import { Project } from "@/types";

interface ProjectKanbanProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  onStatusChange: (projectId: number, newStatus: string) => void;
  onOpenDetail: (project: Project) => void;
  isAdmin?: boolean;
}

const COLUMNS = [
  { id: "Antrean", label: "Antrean", icon: <Clock size={16} className="text-gray-500" />, bg: "bg-gray-100", border: "border-gray-200" },
  { id: "Proses", label: "Proses", icon: <PlayCircle size={16} className="text-blue-500" />, bg: "bg-blue-50", border: "border-blue-200" },
  { id: "Revisi", label: "Revisi", icon: <AlertCircle size={16} className="text-yellow-500" />, bg: "bg-yellow-50", border: "border-yellow-200" },
  { id: "Selesai", label: "Selesai", icon: <CheckCircle size={16} className="text-green-500" />, bg: "bg-green-50", border: "border-green-200" },
];

export default function ProjectKanban({ projects, onEdit, onDelete, onStatusChange, onOpenDetail, isAdmin }: ProjectKanbanProps) {
  // Fungsi saat kartu mulai ditarik
  const handleDragStart = (e: React.DragEvent, projectId: number) => {
    e.dataTransfer.setData("projectId", projectId.toString());
  };

  // Fungsi agar kolom mengizinkan kartu dijatuhkan
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Fungsi saat kartu dilepas di kolom baru
  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("projectId");
    if (projectId) {
      onStatusChange(Number(projectId), newStatus);
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 items-start min-h-150">
      {COLUMNS.map((col) => {
        // Filter proyek berdasarkan status kolom ini
        const columnProjects = projects.filter((p) => p.status === col.id);

        return (
          <div key={col.id} className={`flex-none w-80 rounded-xl border ${col.border} ${col.bg} p-4 flex flex-col`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
            {/* Header Kolom */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 font-semibold text-gray-700">
                {col.icon} {col.label}
              </div>
              <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-gray-500 shadow-sm">{columnProjects.length}</span>
            </div>

            {/* Daftar Kartu */}
            <div className="flex flex-col gap-3 min-h-37.5">
              {columnProjects.map((p) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, p.id)}
                  onClick={() => onOpenDetail(p)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition group"
                >
                  {/* Kategori & Tombol Aksi */}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">{p.category}</span>
                    {isAdmin && (
                      <div className="opacity-0 group-hover:opacity-100 transition flex gap-2">
                        <button onClick={() => onEdit(p)} className="text-gray-400 hover:text-blue-600">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => onDelete(p.id)} className="text-gray-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Judul Proyek */}
                  <h4 className="font-semibold text-gray-900 mb-2 leading-tight">{p.title}</h4>

                  {/* Klien & PIC */}
                  <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Building2 size={12} className="text-gray-400" />
                      <span className="truncate">{p.client?.company || "Proyek Internal"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <User size={12} className="text-gray-400" />
                      <span className="truncate">{p.pics?.map((pic) => pic.name).join(", ") || "Belum ada PIC"}</span>
                    </div>
                  </div>
                </div>
              ))}

              {columnProjects.length === 0 && <div className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center text-sm text-gray-400">Tarik proyek ke sini</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
