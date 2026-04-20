import { Edit, Trash2, Key } from "lucide-react";
import { TeamMember } from "@/types";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface TeamTableProps {
  teams: TeamMember[];
  onEdit: (team: TeamMember) => void;
  onDelete: (id: number) => void;
  isAdmin: boolean;
}

export default function TeamTable({ teams, onEdit, onDelete, isAdmin }: TeamTableProps) {
  // Fungsi Khusus Reset Password
  const handleResetPassword = async (id: number, name: string) => {
    if (!window.confirm(`Yakin ingin mereset password untuk ${name}? Password barunya akan menjadi: jalcode123`)) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/${id}/reset-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal mereset password");

      toast.success(`Berhasil! Password ${name} sekarang adalah: jalcode123`, { duration: 5000 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!teams || teams.length === 0) {
    return <div className="p-8 text-center text-gray-500">Belum ada anggota tim yang ditambahkan.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-sm border-b">
            <th className="p-4 font-medium">Nama Anggota</th>
            <th className="p-4 font-medium">Peran / Posisi</th>
            <th className="p-4 font-medium">Email Address</th>
            {isAdmin && <th className="p-4 font-medium text-right">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50 transition border-b last:border-0">
              <td className="p-4 font-semibold text-gray-900">{t.name}</td>
              <td className="p-4 text-sm text-gray-600">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">{t.role}</span>
              </td>
              <td className="p-4 text-sm text-gray-600">{t.email}</td>

              <td className="p-4 text-right">
                {isAdmin && (
                  <div className="flex justify-end gap-2 items-center">
                    {/* TOMBOL RESET PASSWORD */}
                    <button onClick={() => handleResetPassword(t.id, t.name)} title="Reset Password ke Default" className="p-1.5 text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-md transition">
                      <Key size={16} />
                    </button>

                    {/* TOMBOL EDIT */}
                    <button onClick={() => onEdit(t)} className="p-1.5 text-slate-400 hover:text-blue-600 transition">
                      <Edit size={16} />
                    </button>

                    {/* TOMBOL HAPUS */}
                    <button onClick={() => onDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
