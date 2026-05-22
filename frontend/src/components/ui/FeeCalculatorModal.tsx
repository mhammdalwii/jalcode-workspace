import { useState, useEffect } from "react";
import { X, Calculator, PieChart, Wallet, Users, AlertTriangle } from "lucide-react";
import { Invoice, Project } from "@/types";

interface FeeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  project: Project | undefined;
}

export default function FeeCalculatorModal({ isOpen, onClose, invoice, project }: FeeCalculatorModalProps) {
  // Setup persentase default: Agensi 30%, Tim 70%
  const [agencyPct, setAgencyPct] = useState(30);

  // State untuk menyimpan persentase spesifik per anggota tim
  const [memberPcts, setMemberPcts] = useState<Record<number, number>>({});

  const teamMembers = project?.team_members || [];
  const memberCount = teamMembers.length;

  // Reset & Inisialisasi persentase setiap modal dibuka
  useEffect(() => {
    if (isOpen && invoice) {
      setAgencyPct(30); // Default potongan agensi

      // Bagi rata persentase tim sebagai nilai awal (Bisa diedit manual nanti)
      const initialPcts: Record<number, number> = {};
      if (memberCount > 0) {
        const evenSplit = Math.floor(100 / memberCount);
        teamMembers.forEach((m, index) => {
          // Anggota terakhir mendapatkan sisa pembagian agar pas 100%
          initialPcts[m.id] = index === memberCount - 1 ? 100 - evenSplit * (memberCount - 1) : evenSplit;
        });
      }
      setMemberPcts(initialPcts);
    }
  }, [isOpen, invoice, memberCount, teamMembers]);

  if (!isOpen || !invoice) return null;

  // Format Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  const teamPct = 100 - agencyPct;
  const totalAmount = invoice.amount;
  const agencyCut = (totalAmount * agencyPct) / 100;
  const teamCut = (totalAmount * teamPct) / 100;

  // Hitung total persentase tim (Validasi harus 100%)
  const totalMemberPct = Object.values(memberPcts).reduce((acc, curr) => acc + (curr || 0), 0);

  const handleMemberPctChange = (id: number, value: number) => {
    setMemberPcts((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-0 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* HEADER */}
        <div className="bg-linear-to-r from-green-600 to-emerald-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <Calculator size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Kalkulator Profit Sharing</h3>
              <p className="text-green-100 text-xs">Invoice: {invoice.invoice_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 text-gray-800 space-y-6">
          {/* TOTAL INVOICE */}
          <div className="text-center">
            <p className="text-sm text-gray-500 font-medium mb-1">Total Nilai Proyek ({project?.title})</p>
            <p className="text-4xl font-extrabold text-gray-900">{formatRupiah(totalAmount)}</p>
            <span className={`inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full ${invoice.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>Status: {invoice.status}</span>
          </div>

          {/* SLIDER PENGATURAN KAS AGENSI */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold flex items-center gap-1">
                <PieChart size={16} className="text-blue-600" /> Potongan Agensi ({agencyPct}%)
              </span>
              <span className="text-sm font-semibold flex items-center gap-1">
                <Users size={16} className="text-indigo-600" /> Jatah Tim ({teamPct}%)
              </span>
            </div>
            <input type="range" min="0" max="100" step="5" value={agencyPct} onChange={(e) => setAgencyPct(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>

          {/* DISTRIBUSI KAS UTAMA */}
          <div className="flex gap-4">
            <div className="flex-1 bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Masuk Kas Agensi</p>
              <p className="text-xl font-bold text-blue-900">{formatRupiah(agencyCut)}</p>
            </div>
            <div className="flex-1 bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Dibagikan Ke Tim</p>
              <p className="text-xl font-bold text-indigo-900">{formatRupiah(teamCut)}</p>
            </div>
          </div>

          {/* RINCIAN PER ANGGOTA TIM (DINAMIS) */}
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <Wallet size={18} /> Rincian Transfer Tim
              </h4>
              {totalMemberPct !== 100 && memberCount > 0 && (
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded flex items-center gap-1">
                  <AlertTriangle size={12} /> Total: {totalMemberPct}% (Harus 100%)
                </span>
              )}
            </div>

            {memberCount === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4 italic">Proyek ini belum memiliki anggota tim (PIC).</p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {teamMembers.map((member) => {
                  const mPct = memberPcts[member.id] || 0;
                  const mCut = (teamCut * mPct) / 100;

                  return (
                    <div key={member.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 shadow-sm rounded-lg hover:border-gray-200 transition">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{member.role}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* 🚀 INPUT PERSENTASE INDIVIDUAL */}
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-2 py-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={mPct}
                            onChange={(e) => handleMemberPctChange(member.id, Number(e.target.value))}
                            className="w-10 text-center bg-transparent text-sm font-bold text-gray-700 focus:outline-none"
                          />
                          <span className="text-gray-500 text-sm font-bold">%</span>
                        </div>

                        <p className="font-bold text-green-600 w-24 text-right">{formatRupiah(mCut)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
