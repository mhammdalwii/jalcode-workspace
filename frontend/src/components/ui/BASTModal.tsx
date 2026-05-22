import { useState, useRef } from "react";
import { X, Printer, ShieldCheck } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import BASTDocument from "@/components/pdf/BASTDocument";
import { Project } from "@/types";

interface BASTModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  clientSignature: string | null;
}

export default function BASTModal({ isOpen, onClose, project, clientSignature }: BASTModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `BAST_Jalcode_${project?.title?.replace(/\s+/g, "_")}`,
  });

  const [bastData, setBastData] = useState({
    spkNumber: `SPK/JC/${new Date().getFullYear()}/...`,
    spkDate: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    warrantyMonths: 3,
    assets: ["Akses Akun Administrator (Dashboard)", "File Source Code (via Repository/ZIP)", "Dokumentasi / Panduan Penggunaan Sistem", "Akses Hosting & Domain"],
  });

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-black">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-emerald-50">
          <h3 className="font-bold flex items-center gap-2 text-emerald-800">
            <ShieldCheck /> Serah Terima Aset (BAST)
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-emerald-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nomor SPK Terkait</label>
              <input value={bastData.spkNumber} onChange={(e) => setBastData({ ...bastData, spkNumber: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tanggal SPK</label>
              <input value={bastData.spkDate} onChange={(e) => setBastData({ ...bastData, spkDate: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Masa Garansi (Bulan)</label>
            <input type="number" value={bastData.warrantyMonths} onChange={(e) => setBastData({ ...bastData, warrantyMonths: Number(e.target.value) })} className="w-full border rounded-lg p-2 text-sm" />
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase italic">* Aset yang diserahkan akan mengikuti standar SOP Jalcode.</p>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium">
            Batal
          </button>
          <button onClick={handlePrint} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 transition shadow-lg">
            <Printer size={18} /> Cetak BAST PDF
          </button>
        </div>

        <div className="hidden">
          <BASTDocument ref={printRef} project={project} clientSignature={clientSignature} bastData={bastData} />
        </div>
      </div>
    </div>
  );
}
