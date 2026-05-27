import React from "react";
import { Edit2, Trash2, Tag } from "lucide-react";
import { Pricelist } from "@/types";

interface PricelistTableProps {
  pricelists: Pricelist[];
  isAdmin: boolean;
  onEdit: (item: Pricelist) => void;
  onDelete: (id: number) => void;
}

export default function PricelistTable({ pricelists, isAdmin, onEdit, onDelete }: PricelistTableProps) {
  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  if (pricelists.length === 0) {
    return (
      <div className="p-8 text-center bg-white text-gray-400 flex flex-col items-center justify-center gap-2">
        <Tag size={40} className="text-gray-300 animate-pulse" />
        <p className="text-sm font-medium">Belum ada data katalog harga.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 w-12 text-center">No</th>
            <th className="px-6 py-4">Nama Layanan / Paket</th>
            <th className="px-6 py-4 w-40">Kategori</th>
            <th className="px-6 py-4">Deskripsi / Spesifikasi</th>
            <th className="px-6 py-4 text-right w-44">Harga Standar</th>
            {isAdmin && <th className="px-6 py-4 text-center w-28">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white text-gray-800">
          {pricelists.map((item, idx) => (
            <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
              <td className="px-6 py-4 text-center font-medium text-gray-400">{idx + 1}</td>
              <td className="px-6 py-4 font-bold text-gray-900">{item.service_name}</td>
              <td className="px-6 py-4">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold tracking-wide border border-blue-100">{item.category}</span>
              </td>
              <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={item.description}>
                {item.description || "-"}
              </td>
              <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 text-base">{formatRupiah(item.price)}</td>
              {isAdmin && (
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Harga">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
