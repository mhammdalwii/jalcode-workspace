import { useState, useEffect } from "react";
import { X, Calculator, PieChart, Wallet, Users, AlertTriangle, Save, Loader2 } from "lucide-react"; // 🚀 Tambah Loader2
import { Invoice, Project } from "@/types";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface FeeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  project: Project | undefined;
}

export default function FeeCalculatorModal({ isOpen, onClose, invoice, project }: FeeCalculatorModalProps) {
  const [agencyPct, setAgencyPct] = useState(20);
  const [memberPcts, setMemberPcts] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 🚀 State loading baru

  const teamMembers = project?.team_members || [];
  const memberCount = teamMembers.length;

  useEffect(() => {
    if (isOpen && invoice) {
      setIsLoading(true);

      const fetchSavedData = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${invoice.id}/profit`, {
            headers: { Authorization: `Bearer ${Cookies.get("token")}` },
          });
          const json = await res.json();

          if (json.data && json.data.length > 0) {
            // 🚀 SKENARIO 1: DATA SUDAH PERNAH DISIMPAN SEBELUMNYA!
            const savedProfits = json.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const totalTeamCut = savedProfits.reduce((acc: number, curr: any) => acc + curr.amount, 0);
            const calcAgencyCut = invoice.amount - totalTeamCut;

            // Kembalikan nominal menjadi bentuk persentase
            setAgencyPct(Math.round((calcAgencyCut / invoice.amount) * 100));

            const loadedMemberPcts: Record<number, number> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            savedProfits.forEach((p: any) => {
              loadedMemberPcts[p.member_id] = Math.round((p.amount / totalTeamCut) * 100);
            });
            setMemberPcts(loadedMemberPcts);
          } else {
            // 🚀 SKENARIO 2: BELUM ADA DATA, PAKAI ATURAN TIERED OTOMATIS
            if (invoice.amount <= 500000) setAgencyPct(10);
            else setAgencyPct(20);

            const initialPcts: Record<number, number> = {};
            if (memberCount > 0) {
              const evenSplit = Math.floor(100 / memberCount);
              teamMembers.forEach((m, index) => {
                initialPcts[m.id] = index === memberCount - 1 ? 100 - evenSplit * (memberCount - 1) : evenSplit;
              });
            }
            setMemberPcts(initialPcts);
          }
        } catch (error) {
          console.error("Gagal menarik data profit", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSavedData();
    }
  }, [isOpen, invoice, memberCount, teamMembers]);

  if (!isOpen || !invoice) return null;

  // 🚀 Tampilan saat sedang menarik data dari database
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-2xl flex flex-col items-center shadow-2xl">
          <Loader2 className="animate-spin text-emerald-600 mb-3" size={40} />
          <p className="text-sm font-bold text-gray-700 animate-pulse">Menyelaraskan Brankas Data...</p>
        </div>
      </div>
    );
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  const teamPct = 100 - agencyPct;
  const totalAmount = invoice.amount;
  const agencyCut = (totalAmount * agencyPct) / 100;
  const teamCut = (totalAmount * teamPct) / 100;

  const totalMemberPct = Object.values(memberPcts).reduce((acc, curr) => acc + (curr || 0), 0);

  const handleMemberPctChange = (id: number, value: number) => {
    setMemberPcts((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveToDB = async () => {
    if (totalMemberPct !== 100) {
      return toast.error("Total persentase tim harus 100%!");
    }

    setIsSaving(true);
    const distributions = teamMembers.map((member) => ({
      member_id: member.id,
      amount: (teamCut * (memberPcts[member.id] || 0)) / 100,
    }));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${invoice.id}/profit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ distributions }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data profit sharing");

      toast.success("Catatan komisi berhasil dikunci di database!");
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
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

          {/* RINCIAN PER ANGGOTA TIM */}
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <Wallet size={18} /> Rincian Transfer Tim
              </h4>
              {totalMemberPct !== 100 && memberCount > 0 && (
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded flex items-center gap-1">
                  <AlertTriangle size={12} /> Total: {totalMemberPct}%
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

          <div className="pt-2">
            <button
              onClick={handleSaveToDB}
              disabled={isSaving || memberCount === 0}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition disabled:bg-slate-400"
            >
              <Save size={18} /> {isSaving ? "Menyimpan..." : "Kunci & Simpan Catatan Komisi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
