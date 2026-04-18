import { useRef, useState } from "react";
import { Edit, Trash2, Download, ReceiptText, Calendar } from "lucide-react";
import { Invoice } from "@/types";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import InvoiceTemplate from "@/components/ui/InvoiceTemplate";
import { toPng } from "html-to-image";

interface InvoiceTableProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: number) => void;
  isAdmin: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agencyProfile: any;
}

export default function InvoiceTable({ invoices, onEdit, onDelete, isAdmin, agencyProfile }: InvoiceTableProps) {
  // Referensi untuk menunjuk area HTML yang akan dijadikan PDF
  const printRef = useRef<HTMLDivElement>(null);
  const [printingId, setPrintingId] = useState<number | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700"; // Unpaid
    }
  };

  // --- FUNGSI SAKTI: 1-CLICK BILLING (html-to-image -> PDF) ---
  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      setPrintingId(invoice.id);
      setSelectedInvoiceForPrint(invoice);

      // Jeda waktu agar React selesai memuat komponen
      await new Promise((resolve) => setTimeout(resolve, 300));

      const element = printRef.current;
      if (!element) throw new Error("Template PDF belum siap di layar.");

      // Menggunakan html-to-image (Tahan banting terhadap warna modern Tailwind)
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Ambil dimensi elemen asli untuk proporsi PDF
      const elemWidth = element.offsetWidth;
      const elemHeight = element.offsetHeight;

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      // Hitung tinggi proporsional PDF
      const pdfHeight = (elemHeight * pdfWidth) / elemWidth;

      // Tempelkan gambar ke PDF dan unduh
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoice_number}_Jalcode.pdf`);

      toast.success("PDF berhasil diunduh dengan sempurna!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error Cetak PDF:", err);
      toast.error(err.message || "Gagal mencetak dokumen");
    } finally {
      setPrintingId(null);
    }
  };

  if (!invoices || invoices.length === 0) {
    return <div className="p-8 text-center text-gray-500">Belum ada tagihan yang diterbitkan.</div>;
  }

  return (
    <>
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
                <td className="p-4 text-right">
                  {isAdmin && (
                    <div className="flex justify-end gap-2 items-center">
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        disabled={printingId === inv.id}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold text-white transition ${printingId === inv.id ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"}`}
                      >
                        <Download size={14} /> {printingId === inv.id ? "Mencetak..." : "PDF"}
                      </button>
                      <button onClick={() => onEdit(inv)} className="p-1.5 text-slate-400 hover:text-blue-600 transition">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => onDelete(inv.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Komponen Hidden untuk Render PDF */}
      <InvoiceTemplate ref={printRef} invoice={selectedInvoiceForPrint} agency={agencyProfile} />
    </>
  );
}
