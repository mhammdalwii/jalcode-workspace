import { useState } from "react";
import { Edit, Trash2, Calendar, MessageSquare, Globe, AtSign, CheckCircle2, Clock, AlignLeft, XCircle, AlertTriangle } from "lucide-react";
import { ContentPlan } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface ContentKanbanProps {
  contents: ContentPlan[];
  onEdit: (content: ContentPlan) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: string, reason?: string) => void;
  isAdmin: boolean;
  isFounder: boolean;
}

const COLUMNS = [
  { id: "Ide", title: "💡 Ideation", color: "bg-slate-100 border-slate-200 text-slate-700" },
  { id: "Drafting", title: "✍️ Drafting", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { id: "Review", title: "👀 Review", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "Terjadwal", title: "⏳ Terjadwal", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { id: "Publish", title: "✅ Published", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { id: "Ditolak", title: "❌ Ditolak", color: "bg-red-50 border-red-200 text-red-700" },
];

export default function ContentKanban({ contents, onEdit, onDelete, onStatusChange, isAdmin, isFounder }: ContentKanbanProps) {
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);

  // 🚀 STATE UNTUK MODAL PENOLAKAN
  const [rejectModalId, setRejectModalId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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
          const columnContents = contents.filter((c) => c.status === col.id);

          return (
            <div key={col.id} className="min-w-75 w-75 shrink-0 flex flex-col bg-slate-50/50 rounded-xl border border-slate-200">
              <div className={`px-4 py-3 border-b rounded-t-xl font-bold flex justify-between items-center ${col.color}`}>
                <span>{col.title}</span>
                <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">{columnContents.length}</span>
              </div>

              <div className="p-3 flex flex-col gap-3 min-h-37.5">
                {columnContents.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">Belum ada konten</div>
                ) : (
                  columnContents.map((content) => {
                    const platformStyle = getPlatformStyle(content.platform);
                    const isWaitingApproval = content.status === "Ide" && !isFounder;
                    const isRejected = content.status === "Ditolak"; // 🚀 CEK APAKAH KARTU INI DITOLAK

                    return (
                      <div key={content.id} className={`bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition group ${isRejected ? "border-red-200" : "border-slate-200"}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${platformStyle.bg} ${platformStyle.text}`}>
                            {platformStyle.icon} {content.platform}
                          </span>

                          {(isAdmin || !isWaitingApproval) && (
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

                        <h4 className="font-bold text-slate-800 text-sm leading-snug mb-2">{content.title}</h4>

                        {/* 🚀 BLOK CATATAN KHUSUS (MERAH JIKA DITOLAK, BIASA JIKA TIDAK) */}
                        {content.notes && (
                          <div className={`mb-3 p-2.5 rounded-lg border text-xs ${isRejected ? "bg-red-50 border-red-100 text-red-700" : "bg-slate-50/80 border-slate-100 text-slate-600"}`}>
                            <div className={`flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-wide ${isRejected ? "text-red-500" : "text-slate-400"}`}>
                              {isRejected ? <AlertTriangle size={12} /> : <AlignLeft size={10} />}
                              {isRejected ? "Catatan Penolakan" : "Catatan"}
                            </div>
                            <p className="line-clamp-4 leading-relaxed whitespace-pre-line" title={content.notes}>
                              {content.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">PIC Tim</span>
                            <span className="text-xs font-medium text-slate-700">{content.pics && content.pics.length > 0 ? content.pics.map((p) => p.name).join(", ") : "Belum ada"}</span>
                          </div>

                          {content.publish_date && content.publish_date !== "0001-01-01T00:00:00Z" && (
                            <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
                              <Calendar size={12} />
                              {new Date(content.publish_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100">
                          {isWaitingApproval ? (
                            <div className="w-full text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded py-1.5 px-2 text-center flex items-center justify-center gap-1">
                              <Clock size={12} /> Menunggu Approval Founder
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <select
                                value={content.status}
                                onChange={(e) => onStatusChange(content.id, e.target.value)}
                                className={`text-xs bg-transparent border-none focus:ring-0 ${!isAdmin ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                                disabled={!isAdmin}
                              >
                                {COLUMNS.map((c) => (
                                  <option key={c.id} value={c.id} disabled={c.id === "Ide" && content.status !== "Ide"}>
                                    Pindah ke: {c.title.replace(/[^a-zA-Z ]/g, "")}
                                  </option>
                                ))}
                              </select>

                              {/* TOMBOL TOLAK DAN APPROVE KHUSUS FOUNDER */}
                              {isFounder && content.status === "Ide" && (
                                <div className="flex gap-1 ml-auto">
                                  <button
                                    onClick={() => {
                                      // 🚀 BUKA MODAL KUSTOM ALIH-ALIH WINDOW.PROMPT
                                      setRejectReason("");
                                      setRejectModalId(content.id);
                                    }}
                                    className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center transition"
                                    title="Tolak Ide Ini"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                  <button
                                    onClick={() => onStatusChange(content.id, "Drafting")}
                                    className="p-1.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 flex items-center justify-center transition"
                                    title="Approve Ide Ini"
                                  >
                                    <CheckCircle2 size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
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

      {/* 🚀 MODAL KUSTOM UNTUK ALASAN PENOLAKAN */}
      {rejectModalId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <XCircle className="text-red-500" size={20} />
              <h3 className="text-lg font-bold text-gray-900">Tolak Ide Konten</h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 mb-3">Berikan alasan mengapa ide konten ini ditolak agar tim dapat mengerti dan memperbaikinya.</p>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                rows={4}
                placeholder="Contoh: Kurang relevan dengan target audiens, silakan cari referensi lain..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setRejectModalId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  if (rejectReason.trim() !== "") {
                    onStatusChange(rejectModalId, "Ditolak", rejectReason);
                    setRejectModalId(null);
                  }
                }}
                disabled={rejectReason.trim() === ""}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${rejectReason.trim() === "" ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 shadow-sm"}`}
              >
                Tolak Ide Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS KONTEN (SUDAH ADA SEBELUMNYA) */}
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
