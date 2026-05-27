import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = "Konfirmasi Hapus", message = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.", isLoading = false }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden text-black animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>

          <div className="flex gap-3">
            <button onClick={onClose} disabled={isLoading} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition disabled:opacity-50">
              Batal
            </button>
            <button onClick={onConfirm} disabled={isLoading} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200 disabled:opacity-50">
              {isLoading ? "Menghapus..." : "Ya, Hapus!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
