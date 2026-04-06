import { Plus } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  count: number;
  countLabel?: string;
  badgeColor?: "green" | "purple" | "blue" | "indigo";
  buttonText: string;
  onAdd: () => void;
  isAdmin: boolean;
  // Khusus untuk Proyek yang punya tombol Toggle List/Kanban
  children?: React.ReactNode;
}

export default function SectionHeader({ title, count, countLabel = "Ditemukan", badgeColor = "blue", buttonText, onAdd, isAdmin, children }: SectionHeaderProps) {
  // Mapping warna badge
  const colors = {
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[badgeColor]}`}>
          {count} {countLabel}
        </span>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Tempat untuk menyisipkan tombol tambahan (seperti toggle Kanban) */}
        {children}

        {/* Tombol Tambah hanya muncul untuk Admin */}
        {isAdmin && (
          <button onClick={onAdd} className="flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            <Plus size={18} /> {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
