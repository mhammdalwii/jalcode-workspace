import { useState, useRef } from "react";
import { X, Plus, Trash2, Printer, FileText } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import QuotationDocument from "@/components/pdf/QuotationDocument";
import CurrencyInput from "@/components/ui/CurrencyInput"; // 🚀 IMPORT KOMPONEN BARU
import { Project } from "@/types";

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export default function QuotationModal({ isOpen, onClose, project }: QuotationModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Quotation_Jalcode_${project?.title}`,
  });

  const [scope, setScope] = useState({
    service: "Web Development",
    description: "",
    tech: "Next.js, Tailwind CSS, Golang",
    maintenance: 3,
  });

  const [items, setItems] = useState([
    { description: "Desain UI/UX & Prototyping", features: "Desain visual aplikasi, maks 3x revisi minor", duration: "7", cost: 2500000 },
    { description: "Pengembangan Sistem", features: "Koding sistem Frontend & Backend", duration: "14", cost: 5000000 },
  ]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold flex items-center gap-2 text-gray-800">
            <FileText className="text-blue-600" /> Draft Penawaran Proyek
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Layanan Utama</label>
              <input value={scope.service} onChange={(e) => setScope({ ...scope, service: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Teknologi</label>
              <input value={scope.tech} onChange={(e) => setScope({ ...scope, tech: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Deskripsi Pekerjaan</label>
              <textarea value={scope.description} onChange={(e) => setScope({ ...scope, description: e.target.value })} className="w-full border rounded-lg p-2 text-sm" rows={2}></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Masa Garansi (Bulan)</label>
              <input type="number" value={scope.maintenance} onChange={(e) => setScope({ ...scope, maintenance: Number(e.target.value) })} className="w-full border rounded-lg p-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Rincian Biaya & Spesifikasi</label>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex-1">
                    <input
                      placeholder="Pekerjaan"
                      className="w-full border-b border-slate-200 bg-transparent p-2 text-sm font-bold focus:outline-none mb-2"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].description = e.target.value;
                        setItems(newItems);
                      }}
                    />
                    <textarea
                      placeholder="Spesifikasi Fitur (Gunakan Enter untuk baris baru)"
                      rows={2}
                      className="w-full border rounded-lg p-2 text-sm mb-2"
                      value={item.features}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].features = e.target.value;
                        setItems(newItems);
                      }}
                    ></textarea>
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Durasi (Hari)</p>
                        <input
                          type="number"
                          className="w-full border rounded-lg p-2 text-sm"
                          value={item.duration}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[idx].duration = e.target.value;
                            setItems(newItems);
                          }}
                        />
                      </div>
                      <div className="w-1/2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Biaya (Rp)</p>
                        {/* 🚀 MENGGUNAKAN KOMPONEN CURRENCY INPUT */}
                        <CurrencyInput
                          placeholder="Biaya (Rp)"
                          className="w-full border rounded-lg p-2 text-sm font-mono font-bold text-blue-600 outline-blue-500"
                          value={item.cost}
                          onChange={(val) => {
                            const newItems = [...items];
                            newItems[idx].cost = val;
                            setItems(newItems);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 pt-2">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button onClick={() => setItems([...items, { description: "", features: "", duration: "0", cost: 0 }])} className="flex items-center gap-1 text-xs font-bold text-blue-600 px-2 mt-2">
                <Plus size={14} /> Tambah Item
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium">
            Batal
          </button>
          <button onClick={handlePrint} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md">
            <Printer size={18} /> Cetak PDF
          </button>
        </div>

        <div className="hidden">
          <QuotationDocument ref={printRef} project={project} items={items} scope={scope} />
        </div>
      </div>
    </div>
  );
}
