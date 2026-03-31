import { Edit, Trash2, Building2, User, Phone, Mail } from "lucide-react";
import { Client } from "@/types";

interface ClientTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
}

export default function ClientTable({ clients, onEdit, onDelete }: ClientTableProps) {
  if (!clients || clients.length === 0) {
    return <div className="p-8 text-center text-gray-500">Belum ada data klien yang tersimpan.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-sm">
            <th className="p-4 border-b font-medium">Perusahaan</th>
            <th className="p-4 border-b font-medium">PIC (Kontak)</th>
            <th className="p-4 border-b font-medium">Email & Telepon</th>
            <th className="p-4 border-b font-medium text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50 transition border-b last:border-0">
              <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                <Building2 size={16} className="text-gray-400" />
                {c.company}
              </td>
              <td className="p-4 text-gray-700 flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                {c.name}
              </td>
              <td className="p-4 text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={14} className="text-gray-400" />
                  {c.email || "-"}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  {c.phone || "-"}
                </div>
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-3">
                  <button onClick={() => onEdit(c)} className="text-blue-600 hover:text-blue-800">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => onDelete(c.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
