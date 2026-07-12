import { useState, useRef, useEffect } from "react"; // 🚀 Tambah useEffect
import { X, Printer, FileSignature } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import SPKDocument from "@/components/pdf/SPKDocument";
import { Project } from "@/types";
import CurrencyInput from "@/components/ui/CurrencyInput";

interface SPKModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  clientSignature: string | null;
}

export default function SPKModal({ isOpen, onClose, project, clientSignature }: SPKModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `SPK_Jalcode_${project?.title?.replace(/\s+/g, "_")}`,
  });

  // Data default untuk SPK
  const [spkData, setSpkData] = useState({
    duration: "14",
    cost: 5000000,
    dpPercent: 40,
    t2Percent: 40,
    revisions: 3,
    maintenance: 3,
  });

  // 🚀 STATE BARU: Menyimpan ID Anggota Tim yang dipilih sebagai Penanggung Jawab
  const [selectedPjId, setSelectedPjId] = useState<number>(0);

  const teamMembers = project?.team_members || [];

  // Sinkronisasi data saat modal dibuka atau proyek berganti
  useEffect(() => {
    if (isOpen && project) {
      // Set default PJ ke anggota pertama jika ada, jika tidak ada set 0 (nanti fallback ke Muhammad Alwi)
      if (project.team_members && project.team_members.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedPjId(project.team_members[0].id);
      } else {
        setSelectedPjId(0);
      }
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  // 🚀 Cari objek anggota tim yang terpilih untuk dikirim ke dokumen PDF
  const selectedPj = teamMembers.find((m) => m.id === selectedPjId) || null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh]">
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
          <h3 className="font-bold flex items-center gap-2 text-gray-800">
            <FileSignature className="text-gray-900" /> Draft Perjanjian Kerja (SPK)
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* BODY (FORM) */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* 🚀 DROPDOWN PILIH PENANGGUNG JAWAB (PIHAK KEDUA) */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-2">
            <label className="block text-xs font-bold text-blue-700 mb-1 tracking-wider uppercase">Penanggung Jawab Jalcode (Pihak Kedua)</label>
            <select
              value={selectedPjId}
              onChange={(e) => setSelectedPjId(Number(e.target.value))}
              className="w-full border border-blue-200 rounded-lg p-2 text-sm text-black bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value={0}>Muhammad Alwi (Founder - Default Fallback)</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-blue-600/80 mt-1 italic">* Nama yang dipilih akan tercantum di dokumen SPK sebagai PIHAK KEDUA yang bertanda tangan.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Biaya Total Proyek (Rp)</label>
              <CurrencyInput
                value={spkData.cost}
                onChange={(val) => setSpkData({ ...spkData, cost: val })}
                className="w-full border rounded-lg p-2 text-sm text-black outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Contoh: 5.000.000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Waktu Pengerjaan (Hari)</label>
              <input type="number" value={spkData.duration} onChange={(e) => setSpkData({ ...spkData, duration: e.target.value })} className="w-full border rounded-lg p-2 text-sm text-black outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">DP (Termin 1) %</label>
              <input
                type="number"
                value={spkData.dpPercent}
                onChange={(e) => setSpkData({ ...spkData, dpPercent: Number(e.target.value) })}
                className="w-full border rounded-lg p-2 text-sm text-black outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Termin 2 %</label>
              <input
                type="number"
                value={spkData.t2Percent}
                onChange={(e) => setSpkData({ ...spkData, t2Percent: Number(e.target.value) })}
                className="w-full border rounded-lg p-2 text-sm text-black outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Batas Revisi (Kali)</label>
              <input
                type="number"
                value={spkData.revisions}
                onChange={(e) => setSpkData({ ...spkData, revisions: Number(e.target.value) })}
                className="w-full border rounded-lg p-2 text-sm text-black outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Garansi Maintenance (Bulan)</label>
              <input
                type="number"
                value={spkData.maintenance}
                onChange={(e) => setSpkData({ ...spkData, maintenance: Number(e.target.value) })}
                className="w-full border rounded-lg p-2 text-sm text-black outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Batal
          </button>
          <button onClick={handlePrint} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition">
            <Printer size={18} /> Cetak SPK PDF
          </button>
        </div>

        {/* TEMPLATE TERSEMBUNYI UNTUK PRINT */}
        <div className="hidden">
          <SPKDocument ref={printRef} project={project} clientSignature={clientSignature} spkData={spkData} pj={selectedPj} />
        </div>
      </div>
    </div>
  );
}
