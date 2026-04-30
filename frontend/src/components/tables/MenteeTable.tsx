import { useState } from "react";
import { Edit, Trash2, GraduationCap, User, BookOpen } from "lucide-react";
import { Mentee } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface MenteeTableProps {
  mentees: Mentee[];
  onEdit: (mentee: Mentee) => void;
  onDelete: (id: number) => void;
  isAdmin?: boolean;
}

export default function MenteeTable({ mentees, onEdit, onDelete, isAdmin }: MenteeTableProps) {
  // 🚀 STATE UNTUK KONTROL MODAL HAPUS
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);

  if (!mentees || mentees.length === 0) {
    return <div className="p-8 text-center text-gray-500">Belum ada data peserta didik.</div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="p-4 border-b font-medium">Nama Peserta</th>
              <th className="p-4 border-b font-medium">Program Studi</th>
              <th className="p-4 border-b font-medium">Status</th>
              <th className="p-4 border-b font-medium">Mentor</th>
              {isAdmin && <th className="p-4 border-b font-medium text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {mentees.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition border-b last:border-0">
                <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  {m.name}
                </td>
                <td className="p-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-400" />
                    {m.program}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${m.status === "Lulus" ? "bg-green-100 text-green-700" : m.status === "Drop Out" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{m.status}</span>
                </td>
                <td className="p-4 text-gray-600 flex items-center gap-2">
                  <GraduationCap size={16} className="text-gray-400" />
                  {m.mentor?.name || "-"}
                </td>
                <td className="p-4 text-right">
                  {isAdmin && (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => onEdit(m)} className="text-blue-600 hover:text-blue-800">
                        <Edit size={18} />
                      </button>

                      <button onClick={() => setDeleteModalId(m.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deleteModalId !== null}
        title="Hapus Peserta Didik?"
        message="Apakah kamu yakin ingin menghapus data peserta ini?"
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
