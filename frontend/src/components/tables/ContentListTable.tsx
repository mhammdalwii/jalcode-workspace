import { useState, useEffect } from "react";
import { Edit, Trash2, Calendar, MessageSquare, Globe, AtSign, CheckCircle2, XCircle, AlertTriangle, MoreHorizontal, ExternalLink, Tag } from "lucide-react";
import { ContentPlan } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination"; // 🚀 IMPOR KOMPONEN PAGINATION BARU

interface ContentListTableProps {
  contents: ContentPlan[];
  onEdit: (content: ContentPlan) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: string, reason?: string) => void;
  isAdmin: boolean;
  isFounder: boolean;
}

const STATUS_OPTIONS = [
  { id: "Ide", label: "💡 Ideation", color: "bg-slate-100 text-slate-700" },
  { id: "Drafting", label: "✍️ Drafting", color: "bg-amber-100 text-amber-700" },
  { id: "Review", label: "👀 Review", color: "bg-blue-100 text-blue-700" },
  { id: "Terjadwal", label: "⏳ Terjadwal", color: "bg-purple-100 text-purple-700" },
  { id: "Publish", label: "✅ Published", color: "bg-emerald-100 text-emerald-700" },
  { id: "Ditolak", label: "❌ Ditolak", color: "bg-red-100 text-red-700" },
];

export default function ContentListTable({ contents, onEdit, onDelete, onStatusChange, isAdmin, isFounder }: ContentListTableProps) {
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [rejectModalId, setRejectModalId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // 🚀 STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [contents.length]);

  const totalPages = Math.ceil(contents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentContents = contents.slice(startIndex, endIndex);

  const getPlatformStyle = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return { icon: <AtSign size={12} />, color: "text-pink-600 bg-pink-50 border-pink-200" };
      case "blog seo":
        return { icon: <Globe size={12} />, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
      default:
        return { icon: <MessageSquare size={12} />, color: "text-blue-600 bg-blue-50 border-blue-200" };
    }
  };

  const getStatusBadge = (status: string) => {
    const found = STATUS_OPTIONS.find((s) => s.id === status);
    return found ? (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${found.color}`}>{found.label}</span>
    ) : (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-700">{status}</span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "tinggi":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700 border border-red-200 shadow-sm shrink-0">🔴 Tinggi</span>;
      case "sedang":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-700 border border-amber-200 shadow-sm shrink-0">🟡 Sedang</span>;
      case "rendah":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm shrink-0">🟢 Rendah</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="overflow-x-auto pb-6">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-[28%] font-semibold tracking-wider">Judul & Aset Konten</th>
              <th className="px-6 py-4 font-semibold tracking-wider w-40">Platform & Pilar</th>
              <th className="px-6 py-4 font-semibold tracking-wider w-36">Status</th>
              <th className="px-6 py-4 font-semibold tracking-wider w-40">Timeline Pengerjaan</th>
              <th className="px-6 py-4 font-semibold tracking-wider">PIC Tim</th>
              {isAdmin && <th className="px-6 py-4 font-semibold tracking-wider text-center w-24">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {contents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar size={32} className="text-gray-300" />
                    <p>Belum ada rencana konten.</p>
                  </div>
                </td>
              </tr>
            ) : (
              // 🚀 GUNAKAN currentContents DARI SLICE
              currentContents.map((content) => {
                const isWaitingApproval = content.status === "Ide" && !isFounder;
                const isRejected = content.status === "Ditolak";
                const platforms = Array.isArray(content.platform) ? content.platform : [content.platform];

                return (
                  <tr key={content.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-2 mb-2">
                        <p className="font-bold text-slate-900 leading-snug">{content.title}</p>
                        {getPriorityBadge(content.priority)}
                      </div>

                      {content.asset_url && (
                        <a
                          href={content.asset_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-sm text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-200 transition-all w-max"
                          title="Buka File Aset/Draft Konten"
                        >
                          <ExternalLink size={12} /> Buka Aset Konten
                        </a>
                      )}

                      {content.notes && (
                        <div className={`p-2 rounded-lg text-[11px] border leading-relaxed ${isRejected ? "bg-red-50 border-red-100 text-red-700" : "bg-slate-50 border-slate-100 text-slate-500"}`}>
                          <div className={`flex items-center gap-1 mb-0.5 font-bold uppercase tracking-wider ${isRejected ? "text-red-500" : "text-slate-400"}`}>
                            {isRejected ? <AlertTriangle size={12} /> : <MoreHorizontal size={12} />}
                            {isRejected ? "Catatan Penolakan" : "Catatan"}
                          </div>
                          <div className="max-h-24 overflow-y-auto whitespace-pre-line pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">{content.notes}</div>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-2 items-start">
                        <div className="flex flex-wrap gap-1.5 items-start">
                          {platforms.map((plat, idx) => {
                            const pStyle = getPlatformStyle(plat);
                            return (
                              <span key={idx} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${pStyle.color}`}>
                                {pStyle.icon} {plat}
                              </span>
                            );
                          })}
                        </div>
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          <Tag size={12} className="text-slate-400" /> {content.pillar || "Umum"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-2 items-start">
                        {isWaitingApproval ? (
                          <span className="px-2.5 py-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-md whitespace-nowrap">⏳ Menunggu Founder</span>
                        ) : isAdmin ? (
                          <select
                            value={content.status}
                            onChange={(e) => onStatusChange(content.id, e.target.value)}
                            className="px-2 py-1 text-xs font-semibold rounded-md border border-gray-200 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.id} value={opt.id} disabled={opt.id === "Ide" && content.status !== "Ide"}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          getStatusBadge(content.status)
                        )}

                        {isFounder && content.status === "Ide" && (
                          <div className="flex gap-1.5 mt-1">
                            <button
                              onClick={() => {
                                setRejectReason("");
                                setRejectModalId(content.id);
                              }}
                              className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded border border-red-200 hover:bg-red-100 transition"
                              title="Tolak Ide"
                            >
                              <XCircle size={12} /> Tolak
                            </button>
                            <button
                              onClick={() => onStatusChange(content.id, "Drafting")}
                              className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded border border-emerald-200 hover:bg-emerald-100 transition"
                              title="Setujui Ide"
                            >
                              <CheckCircle2 size={12} /> Setujui
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      {content.start_date || content.publish_date ? (
                        <div className="flex flex-col gap-1.5 text-[11px] font-medium text-slate-600">
                          {content.start_date && (
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100 w-max">
                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Mulai:</span>
                              <span className="text-slate-700">{new Date(content.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                            </div>
                          )}
                          {content.publish_date && (
                            <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 w-max">
                              <span className="text-emerald-500 font-bold uppercase tracking-wider text-[9px]">Deadline:</span>
                              <span className="text-emerald-700 font-bold">{new Date(content.publish_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic px-2 py-1 bg-gray-50 rounded border border-dashed border-gray-200">Belum dijadwalkan</span>
                      )}
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {content.pics && content.pics.length > 0 ? (
                          content.pics.map((p, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-semibold rounded-md border border-gray-200 whitespace-nowrap">
                              {p.name.split(" ")[0]}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">-</span>
                        )}
                      </div>
                    </td>

                    {isAdmin && (
                      <td className="px-6 py-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEdit(content)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Konten">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => setDeleteModalId(content.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus Konten">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 🚀 PANGGIL KOMPONEN PAGINATION DENGAN SANGAT ELEGAN */}
      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={contents.length} startIndex={startIndex} endIndex={endIndex} onPageChange={setCurrentPage} />

      {/* MODAL PENOLAKAN IDE KONTEN */}
      {rejectModalId !== null && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-red-50/50">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="text-red-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Tolak Ide Konten</h3>
            </div>
            <div className="p-6">
              <textarea
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none bg-gray-50"
                rows={4}
                placeholder="Alasan penolakan..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setRejectModalId(null)} className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition">
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
                className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition ${rejectReason.trim() === "" ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-200"}`}
              >
                Kirim Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS KONTEN */}
      <ConfirmModal
        isOpen={deleteModalId !== null}
        title="Hapus Rencana Konten?"
        message="Yakin ingin menghapus secara permanen?"
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
