import { useRef, useState } from "react";
import { Edit, Trash2, Printer, ReceiptText, Calendar, FileDown, Calculator } from "lucide-react"; // 🚀 Mengganti icon Download menjadi Printer
import { Invoice } from "@/types";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print"; // 🚀 IMPORT REACT-TO-PRINT
import InvoiceTemplate from "@/components/ui/InvoiceTemplate";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface InvoiceTableProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: number) => void;
  isAdmin: boolean;
  onCalculateFee?: (invoice: Invoice) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agencyProfile: any;
}

export default function InvoiceTable({ invoices, onEdit, onDelete, isAdmin, agencyProfile, onCalculateFee }: InvoiceTableProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [printingId, setPrintingId] = useState<number | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // STATE UNTUK KONTROL MODAL HAPUS
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  // --- FUNGSI EXPORT KE CSV (EXCEL) ---
  const handleExportCSV = () => {
    try {
      const headers = ["No Invoice", "Nama Klien/Proyek", "Layanan", "Tenggat Waktu", "Nominal (Rp)", "Status"];
      const csvRows = invoices.map((inv) => {
        const clientName = inv.client_name || inv.project_title;
        return `"${inv.invoice_number}","${clientName.replace(/"/g, '""')}","${inv.service_type}","${formatDate(inv.due_date)}","${inv.amount}","${inv.status}"`;
      });
      const csvString = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Laporan_Tagihan_Jalcode_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Data berhasil diekspor ke Excel/CSV!");
    } catch (error) {
      console.error("Gagal export CSV:", error);
      toast.error("Gagal mengekspor data");
    }
  };

  // 🚀 FUNGSI PEMICU PRINT / PREVIEW BROWSER
  const handlePrintTrigger = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedInvoiceForPrint ? `Invoice_Jalcode_${selectedInvoiceForPrint.invoice_number}` : "Invoice_Jalcode",
  });

  // 🚀 LOGIKA BARU: Masukkan data ke state, tunggu 300ms agar render selesai, lalu buka Preview!
  const handlePreviewPDF = (invoice: Invoice) => {
    setPrintingId(invoice.id);
    setSelectedInvoiceForPrint(invoice);

    setTimeout(() => {
      handlePrintTrigger();
      setPrintingId(null);
    }, 300);
  };

  if (!invoices || invoices.length === 0) {
    return <div className="p-8 text-center text-gray-500">Belum ada tagihan yang diterbitkan.</div>;
  }

  return (
    <>
      {isAdmin && (
        <div className="px-4 py-3 border-b border-gray-100 flex justify-end bg-gray-50/50">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition shadow-sm">
            <FileDown size={16} /> Export ke Excel (CSV)
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b">
              <th className="p-4 font-medium">No. Invoice & Klien</th>
              <th className="p-4 font-medium">Layanan</th>
              <th className="p-4 font-medium">Tenggat Waktu</th>
              <th className="p-4 font-medium text-right">Nominal</th>
              <th className="p-4 font-medium text-center">Status</th>
              {isAdmin && <th className="p-4 font-medium text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition border-b last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <ReceiptText size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{inv.invoice_number}</p>
                      <p className="text-xs text-gray-500">{inv.client_name || inv.project_title}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm font-medium text-gray-700">{inv.service_type}</td>
                <td className="p-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" /> {formatDate(inv.due_date)}
                  </div>
                </td>
                <td className="p-4 text-right font-bold text-gray-900">{formatRupiah(inv.amount)}</td>
                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(inv.status)}`}>{inv.status}</span>
                </td>

                {isAdmin && (
                  <td className="p-4 text-right flex justify-end gap-3">
                    {onCalculateFee && (
                      <button onClick={() => onCalculateFee(inv)} className="text-emerald-600 hover:text-emerald-800" title="Hitung Profit Sharing">
                        <Calculator size={18} />
                      </button>
                    )}

                    <button onClick={() => onEdit(inv)} className="text-blue-600 hover:text-blue-800" title="Edit">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => setDeleteModalId(inv.id)} className="text-red-600 hover:text-red-800" title="Hapus">
                      <Trash2 size={18} />
                    </button>
                    {/* 🚀 TOMBOL CETAK / PREVIEW BARU */}
                    <button
                      onClick={() => handlePreviewPDF(inv)}
                      disabled={printingId === inv.id}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold text-white transition ${printingId === inv.id ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"}`}
                    >
                      <Printer size={14} /> {printingId === inv.id ? "Memuat..." : "Cetak"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InvoiceTemplate ref={printRef} invoice={selectedInvoiceForPrint} agency={agencyProfile} />

      <ConfirmModal
        isOpen={deleteModalId !== null}
        title="Hapus Tagihan?"
        message="Apakah kamu yakin ingin menghapus tagihan (invoice) ini?"
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
