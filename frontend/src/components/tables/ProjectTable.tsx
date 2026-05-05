import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Project } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface ProjectTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  isAdmin?: boolean;
}

export default function ProjectTable({ projects, onEdit, onDelete, isAdmin }: ProjectTableProps) {
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);

  // Jika hasil filter kosong
  if (!projects || projects.length === 0) {
    return <div className="p-8 text-center text-gray-500">Belum ada proyek yang sesuai dengan pencarian.</div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="p-4 border-b font-medium">Nama Proyek</th>
              <th className="p-4 border-b font-medium">Kategori</th>
              <th className="p-4 border-b font-medium">Status</th>
              <th className="p-4 border-b font-medium">PIC</th>
              {isAdmin && <th className="p-4 border-b font-medium text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition border-b last:border-0">
                <td className="p-4 font-medium text-gray-900">{p.title}</td>
                <td className="p-4 text-gray-600">{p.category}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.status === "Selesai" ? "bg-green-100 text-green-700" : p.status === "Proses" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{p.team_members?.map((member) => member.name).join(", ") || "-"}</td>
                {isAdmin && (
                  <td className="p-4 text-right flex justify-end gap-3">
                    <button onClick={() => onEdit(p)} className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => setDeleteModalId(p.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🚀 MODAL KONFIRMASI HAPUS PROYEK */}
      <ConfirmModal
        isOpen={deleteModalId !== null}
        title="Hapus Proyek?"
        message="Apakah kamu yakin ingin menghapus proyek ini? Semua data terkait seperti tugas dan lampiran di dalamnya juga akan ikut terhapus secara permanen."
        onClose={() => setDeleteModalId(null)}
        onConfirm={() => {
          if (deleteModalId !== null) {
            onDelete(deleteModalId);
            setDeleteModalId(null);
          }
        }}
      />
    </>
  );
}
