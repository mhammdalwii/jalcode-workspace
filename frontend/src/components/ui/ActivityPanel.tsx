import { X, Activity, Clock } from "lucide-react";
import { ActivityLog } from "@/types";

interface ActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityLog[];
}

export default function ActivityPanel({ isOpen, onClose, activities }: ActivityPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />

      {/* Slide-Over Panel */}
      <div className="fixed inset-y-0 right-0 w-full md:w-100 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Log Aktivitas</h2>
              <p className="text-xs text-gray-500">Rekam jejak operasional tim</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 bg-white rounded-full shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* TIMELINE KONTEN */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative border-l border-gray-200 ml-3 space-y-8">
            {activities.map((log) => (
              <div key={log.id} className="relative pl-6">
                {/* Titik Timeline */}
                <div className="absolute -left-1.5 top-1 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-white" />

                {/* Konten Log */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                  <p className="text-sm text-gray-800">
                    <span className="font-bold text-blue-600">{log.user?.name || "Sistem"}</span> {log.action}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{log.target}</p>

                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <Clock size={12} />
                    {new Date(log.created_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {activities.length === 0 && <p className="text-sm text-gray-400 ml-4">Belum ada aktivitas yang tercatat.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
