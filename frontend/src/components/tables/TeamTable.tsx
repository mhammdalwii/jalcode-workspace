import { Edit, Trash2 } from "lucide-react";
import { TeamMember } from "@/types";

interface TeamTableProps {
  teams: TeamMember[];
  onEdit: (team: TeamMember) => void;
  onDelete: (id: number) => void;
  isAdmin?: boolean;
}

export default function TeamTable({ teams, onEdit, onDelete, isAdmin }: TeamTableProps) {
  if (!teams || teams.length === 0) {
    return <div className="p-8 text-center text-gray-500">Belum ada anggota tim yang sesuai dengan pencarian.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-sm">
            <th className="p-4 border-b font-medium">Nama</th>
            <th className="p-4 border-b font-medium">Role</th>
            <th className="p-4 border-b font-medium">Email</th>
            {isAdmin && <th className="p-4 border-b font-medium text-right">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50 transition border-b last:border-0">
              <td className="p-4 font-medium text-gray-900">{t.name}</td>
              <td className="p-4 text-gray-600">{t.role}</td>
              <td className="p-4 text-gray-600">{t.email}</td>
              {isAdmin && (
                <td className="p-4 text-right flex justify-end gap-3">
                  <button onClick={() => onEdit(t)} className="text-blue-600 hover:text-blue-800">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => onDelete(t.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
