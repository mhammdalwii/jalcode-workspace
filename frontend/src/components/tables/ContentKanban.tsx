import { useState } from "react";
import { Edit, Trash2, Calendar, MessageSquare, Globe, AtSign } from "lucide-react";
import { ContentPlan } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface ContentKanbanProps {
  contents: ContentPlan[];
  onEdit: (content: ContentPlan) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: string) => void;
  isAdmin: boolean;
}

const COLUMNS = [
  { id: "Ide", title: "💡 Ideation", color: "bg-slate-100 border-slate-200 text-slate-700" },
  { id: "Drafting", title: "✍️ Drafting", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { id: "Review", title: "👀 Review", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "Terjadwal", title: "⏳ Terjadwal", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { id: "Publish", title: "✅ Published", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
];

export default function ContentKanban({ contents, onEdit, onDelete, onStatusChange, isAdmin }: ContentKanbanProps) {
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);

  // Fungsi untuk mendapatkan ikon & warna Platform
  const getPlatformStyle = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return { icon: <AtSign size={12} />, bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500", text: "text-white" };
      case "blog seo":
        return { icon: <Globe size={12} />, bg: "bg-emerald-500", text: "text-white" };
      default:
        return { icon: <MessageSquare size={12} />, bg: "bg-slate-800", text: "text-white" };
    }
  };

  return (
    <>
      <div className="flex gap-4 p-4 overflow-x-auto min-h-150 items-start">
        {COLUMNS.map((col) => {
          // Filter konten berdasarkan status kolom ini
          const columnContents = contents.filter((c) => c.status === col.id);

          return (
            <div key={col.id} className="min-w-75 w-75 shrink-0 flex flex-col bg-slate-50/50 rounded-xl border border-slate-200">
              {/* Header Kolom */}
              <div className={`px-4 py-3 border-b rounded-t-xl font-bold flex justify-between items-center ${col.color}`}>
                <span>{col.title}</span>
                <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">{columnContents.length}</span>
              </div>

              {/* Area Kartu */}
              <div className="p-3 flex flex-col gap-3 min-h-37.5">
                {columnContents.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">Belum ada konten</div>
                ) : (
                  columnContents.map((content) => {
                    const platformStyle = getPlatformStyle(content.platform);

                    return (
                      <div key={content.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group">
                        {/* Badge Platform & Tombol Aksi */}
                        <div className="flex justify-between items-start mb-2">
                          <span className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${platformStyle.bg} ${platformStyle.text}`}>
                            {platformStyle.icon} {content.platform}
                          </span>

                          {isAdmin && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={() => onEdit(content)} className="p-1 text-slate-400 hover:text-blue-600">
                                <Edit size={14} />
                              </button>

                              <button onClick={() => setDeleteModalId(content.id)} className="p-1 text-slate-400 hover:text-red-600">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Judul Konten */}
                        <h4 className="font-bold text-slate-800 text-sm leading-snug mb-3">{content.title}</h4>

                        {/* Info Bawah (PIC & Tanggal) */}
                        <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">PIC</span>
                            <span className="text-xs font-medium text-slate-700">{content.pic?.name || "Belum ada"}</span>
                          </div>

                          {content.publish_date && content.publish_date !== "0001-01-01T00:00:00Z" && (
                            <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
                              <Calendar size={12} />
                              {new Date(content.publish_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </div>
                          )}
                        </div>

                        {/* Pindah Status (Dropdown Cepat) */}
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <select
                            value={content.status}
                            onChange={(e) => onStatusChange(content.id, e.target.value)}
                            className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded py-1 px-2 outline-none cursor-pointer hover:border-blue-300"
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                Pindah ke: {c.title.replace(/[^a-zA-Z ]/g, "")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🚀 MODAL KONFIRMASI HAPUS KONTEN */}
      <ConfirmModal
        isOpen={deleteModalId !== null}
        title="Hapus Rencana Konten?"
        message="Apakah kamu yakin ingin menghapus rencana konten ini secara permanen?"
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
