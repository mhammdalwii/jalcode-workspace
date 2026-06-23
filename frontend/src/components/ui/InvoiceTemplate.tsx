import { forwardRef } from "react";
import { Invoice } from "@/types";
import Letterhead from "../pdf/Letterhead";

interface Props {
  invoice: Invoice | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agency: any;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, Props>(({ invoice, agency }, ref) => {
  // Gunakan data dari props database, jika kosong gunakan default
  const profile = agency || {
    company: "Jalcode",
    name: "Muhammad Alwi",
    logo: "/logo/logoRemove.png",
    email: "hello@jalcode.com",
    phone: "0852-1333-3166",
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="absolute top-0 -left-[3000px] -z-50 bg-white">
      {/* 🚀 RAHASIA 1: print:p-0, py-10, relative, box-border */}
      <div ref={ref} className="bg-white text-black px-12 py-10 print:p-0 w-[210mm] min-h-[297mm] mx-auto text-[13px] leading-relaxed font-serif box-border relative">
        {/* 🚀 RAHASIA 2: Kunci paksa margin printer ke 20mm */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 20mm 20mm;
            }
          }
        `}</style>

        {invoice && (
          <>
            {/* KOP SURAT */}
            <Letterhead />

            {/* JUDUL DOKUMEN (Spasi bawah dipadatkan dari mb-8 ke mb-6) */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold underline underline-offset-4 uppercase tracking-widest">INVOICE / TAGIHAN</h2>
              <p className="text-gray-600 mt-1 text-xs font-sans font-medium">Nomor: {invoice.invoice_number}</p>
            </div>

            {/* INFO KLIEN & TANGGAL (Spasi bawah dipadatkan dari mb-8 ke mb-6) */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-1/2">
                <p className="font-bold text-gray-800 text-xs uppercase mb-1">Kepada Yth:</p>
                <p className="text-lg font-bold">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(invoice as any).project?.client?.name || invoice.client_name || "Klien Internal"} / {(invoice as any).project?.client?.company || "-"}
                </p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <p className="text-gray-600">{(invoice as any).project?.client?.address || "Makassar"}</p>
              </div>

              <div className="w-1/2 flex justify-end">
                <table className="text-sm text-left">
                  <tbody>
                    <tr>
                      <td className="py-1 pr-4 text-gray-500 font-medium">Tanggal Terbit</td>
                      <td className="py-1 font-bold text-gray-900">: {formatDate(invoice.issue_date)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4 text-gray-500 font-medium">Jatuh Tempo</td>
                      <td className="py-1 font-bold text-red-600">: {formatDate(invoice.due_date)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABEL RINCIAN TAGIHAN (Spasi bawah dipadatkan dari mb-10 ke mb-6) */}
            <div className="mb-6">
              <h3 className="font-bold bg-blue-50 px-2 py-1 border-l-4 border-blue-600 mb-3 uppercase tracking-wider text-xs">Rincian Tagihan</h3>
              <table className="w-full border-collapse border border-gray-300 text-[13px]">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2.5 border border-gray-300">Deskripsi Pekerjaan</th>
                    <th className="p-2.5 border border-gray-300 text-center w-20">Kuantitas</th>
                    <th className="p-2.5 border border-gray-300 text-right w-36">Harga Satuan</th>
                    <th className="p-2.5 border border-gray-300 text-right w-36">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* LOOPING ITEM DINAMIS DARI DATABASE */}
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, idx) => (
                      <tr key={idx} className="break-inside-avoid">
                        <td className="p-2.5 border border-gray-300 text-justify">
                          <p className="font-bold text-gray-900 leading-tight">{item.description}</p>
                        </td>
                        <td className="p-2.5 border border-gray-300 text-center">{item.quantity}</td>
                        <td className="p-2.5 border border-gray-300 text-right font-mono">{formatRupiah(item.price)}</td>
                        <td className="p-2.5 border border-gray-300 text-right font-mono font-bold">{formatRupiah(item.total)}</td>
                      </tr>
                    ))
                  ) : (
                    // Fallback jika data item lama
                    <tr className="break-inside-avoid">
                      <td className="p-2.5 border border-gray-300 font-bold">{invoice.service_type}</td>
                      <td className="p-2.5 border border-gray-300 text-center">1</td>
                      <td className="p-2.5 border border-gray-300 text-right font-mono">{formatRupiah(invoice.amount)}</td>
                      <td className="p-2.5 border border-gray-300 text-right font-mono font-bold">{formatRupiah(invoice.amount)}</td>
                    </tr>
                  )}

                  {/* BARIS TOTAL */}
                  <tr className="bg-blue-600 text-white font-bold text-sm break-inside-avoid">
                    <td colSpan={3} className="p-3 border border-blue-700 text-right uppercase tracking-wider">
                      TOTAL TAGIHAN
                    </td>
                    <td className="p-3 border border-blue-700 text-right">{formatRupiah(invoice.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* INSTRUKSI PEMBAYARAN & TTD (Dorongan atas dipotong dari mt-12 ke mt-6) */}
            <div className="flex justify-between items-start break-inside-avoid mt-6">
              <div className="w-3/5 pr-8">
                <h3 className="font-bold bg-blue-50 px-2 py-1 border-l-4 border-blue-600 mb-3 uppercase tracking-wider text-xs">Instruksi Pembayaran</h3>
                <p className="mb-2 text-gray-800">Mohon melakukan transfer ke rekening resmi kami:</p>
                <ul className="space-y-1 mb-4 font-bold text-gray-900">
                  <li>Bank: Bank Central Asia (BCA)</li>
                  <li>Nomor Rekening: 1234567890</li>
                  <li>Atas Nama: {profile.name}</li>
                </ul>

                <div className="text-[11px] text-gray-500 italic p-3 bg-gray-50 border-l-2 border-gray-300 space-y-1">
                  <p className="font-bold text-gray-600 not-italic mb-1">Catatan:</p>
                  <p>- Mohon kirimkan bukti transfer ke WhatsApp atau Email Jalcode.</p>
                  <p>- Tagihan ini merupakan dokumen resmi yang sah secara hukum.</p>
                </div>
              </div>

              <div className="w-2/5 text-center pt-4">
                {/* Spasi ttd dipangkas aman dari mb-20 ke mb-16 */}
                <p className="mb-16 text-gray-800">Hormat Kami,</p>
                <div className="relative inline-block">
                  <p className="font-bold text-md underline uppercase">{profile.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Finance & Management</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = "InvoiceTemplate";
export default InvoiceTemplate;
