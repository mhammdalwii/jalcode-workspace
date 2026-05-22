import { useRef } from "react";
import { X, Eraser, Check } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureBase64: string) => void;
  clientName?: string;
}

export default function SignatureModal({ isOpen, onClose, onSave, clientName }: SignatureModalProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  if (!isOpen) return null;

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  const handleSave = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("Tanda tangan masih kosong!");
      return;
    }
    // Mengambil gambar tanda tangan dalam format Base64 (PNG transparan)
    const dataURL = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    if (dataURL) {
      onSave(dataURL);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-800">Tanda Tangan Digital</h3>
            <p className="text-xs text-gray-500">Klien: {clientName || "PIHAK PERTAMA"}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* KANVAS TANDA TANGAN */}
        <div className="p-6 bg-gray-100 flex justify-center items-center">
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl shadow-inner w-full h-64 cursor-crosshair">
            <SignatureCanvas ref={sigCanvas} penColor="black" canvasProps={{ className: "w-full h-full rounded-xl" }} />
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <button onClick={handleClear} className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition">
            <Eraser size={16} /> Ulangi
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">
              Batal
            </button>
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-md">
              <Check size={18} /> Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
