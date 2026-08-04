import { useState } from "react";
import { Trash2, CalendarDays, CheckSquare, Square, FileText, Users } from "lucide-react";
import { MeetingNote } from "@/types";
import Pagination from "@/components/ui/Pagination";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface MeetingTableProps {
  meetings: MeetingNote[];
  onDelete: (id: number) => void;
  onToggleAction: (actionId: number) => void;
  isAdmin: boolean;
}

export default function MeetingTable({ meetings, onDelete, onToggleAction, isAdmin }: MeetingTableProps) {
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Logika Pagination
  const totalPages = Math.ceil(meetings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMeetings = meetings.slice(startIndex, endIndex);

  return (
    <>
      <div className="overflow-x-auto pb-6">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider w-[25%]">Topik & Tanggal</th>
              <th className="px-6 py-4 font-semibold tracking-wider w-[35%]">Catatan Rapat</th>
              <th className="px-6 py-4 font-semibold tracking-wider w-[30%]">Action Items (Tugas)</th>
              {isAdmin && <th className="px-6 py-4 font-semibold tracking-wider text-center w-[10%]">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {meetings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Users size={32} className="text-gray-300" />
                    <p>Belum ada catatan rapat.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentMeetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-slate-50/50 transition-colors group align-top">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-base mb-1 leading-tight">{meeting.title}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
                      <CalendarDays size={14} className="text-teal-600" />
                      {new Date(meeting.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    {meeting.project_id ? (
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-100">Rapat Proyek Klien</span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase rounded border border-purple-100">Rapat Internal</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {meeting.notes ? (
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {meeting.notes}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">- Tidak ada catatan -</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {meeting.action_items && meeting.action_items.length > 0 ? (
                        meeting.action_items.map((item) => (
                          <div key={item.id} className="flex items-start gap-2 group/item">
                            <button
                              onClick={() => onToggleAction(item.id!)}
                              className={`mt-0.5 shrink-0 transition-colors ${item.is_done ? "text-emerald-500 hover:text-emerald-600" : "text-gray-300 hover:text-teal-500"}`}
                              disabled={!isAdmin} // Hapus atribut ini jika anggota tim biasa boleh mencentang
                            >
                              {item.is_done ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                            <div className="flex flex-col">
                              <span className={`text-xs font-medium leading-tight ${item.is_done ? "line-through text-gray-400" : "text-gray-700"}`}>{item.task}</span>
                              <span className="text-[10px] font-bold text-teal-600 mt-0.5">PIC: {item.pic?.name || "Tim"}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400 italic text-xs">- Tidak ada tugas turunan -</span>
                      )}
                    </div>
                  </td>

                  {isAdmin && (
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => setDeleteModalId(meeting.id!)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100" title="Hapus Rapat">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={meetings.length} startIndex={startIndex} endIndex={endIndex} onPageChange={setCurrentPage} />

      <ConfirmModal
        isOpen={deleteModalId !== null}
        title="Hapus Jurnal Rapat?"
        message="Yakin ingin menghapus catatan rapat ini beserta seluruh tugas turunannya secara permanen?"
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
