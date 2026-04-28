/* eslint-disable @next/next/no-img-element */
import { forwardRef } from "react";
import { Invoice } from "@/types";

interface Props {
  invoice: Invoice | null;
  agency: any;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, Props>(({ invoice, agency }, ref) => {
  // Gunakan data dari props database, jika kosong gunakan default
  const profile = agency || {
    company: "Jalcode Agency",
    name: "Muhammad Alwi",
    logo: "/logo/logoRemove.png",
    email: "jalcodeid@gmail.com",
    phone: "08804207761",
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="absolute top-0 -left-2499.75 -z-50 bg-white">
      <div ref={ref} className="w-[210mm] min-h-[297mm] p-12 bg-white text-black font-sans box-border relative">
        {invoice && (
          <>
            {/* KOP SURAT JALCODE TER-SINKRONISASI */}
            <div className="flex justify-between items-start mb-12 border-b-4 border-black pb-6">
              <div className="flex items-center gap-4">
                <img src={profile.logo || "/logo/logoRemove.png"} alt="Logo Agensi" className="w-16 h-16 object-contain" crossOrigin="anonymous" />
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{profile.company}</h1>
                  <p className="text-blue-600 font-bold tracking-widest text-xs uppercase mt-1">Digital Solutions</p>
                </div>
              </div>
              <div className="text-right text-gray-500 text-sm leading-relaxed">
                <p className="font-bold text-gray-800">{profile.company}</p>
                <p>Makassar, Sulawesi Selatan, Indonesia</p>
                <p>
                  {profile.email} | {profile.phone}
                </p>
              </div>
            </div>

            {/* INFO INVOICE & CLIENT */}
            <div className="flex justify-between mb-12">
              <div>
                <h2 className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-2">Tagihan Kepada:</h2>
                <p className="text-xl font-bold text-gray-800">{invoice.client_name || "Klien Internal"}</p>
                <p className="text-gray-600 mt-1">
                  Proyek: <span className="font-semibold">{invoice.project_title}</span>
                </p>
              </div>
              <div className="text-right bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-62.5">
                <h2 className="text-3xl font-black text-blue-600 mb-1">INVOICE</h2>
                <p className="text-gray-800 font-bold text-lg mb-4">{invoice.invoice_number}</p>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Tanggal Terbit:</span> <span className="font-semibold">{formatDate(invoice.issue_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Jatuh Tempo:</span> <span className="font-semibold text-red-600">{formatDate(invoice.due_date)}</span>
                </div>
              </div>
            </div>

            {/* TABEL RINCIAN */}
            <table className="w-full mb-12 border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-left text-sm uppercase tracking-wider">
                  <th className="p-4 rounded-tl-xl font-medium w-1/2">Deskripsi Layanan</th>
                  <th className="p-4 font-medium text-center">Kategori</th>
                  <th className="p-4 rounded-tr-xl font-medium text-right">Total Biaya</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-200">
                  <td className="p-4 py-6 font-semibold text-gray-900">{invoice.notes || `Pembayaran untuk pengerjaan ${invoice.project_title}`}</td>
                  <td className="p-4 py-6 text-center">{invoice.service_type}</td>
                  <td className="p-4 py-6 text-right font-bold">{formatRupiah(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>

            {/* TOTAL & REKENING (QRIS) */}
            <div className="flex justify-between items-start">
              <div className="w-1/2 pr-8">
                <h3 className="font-bold text-gray-800 mb-2 border-b pb-2">Informasi Pembayaran</h3>
                <div className="w-40 h-40 p-2 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                  <img src="/logo/qris.jpeg" alt="QRIS Pembayaran Jalcode" className="max-w-full max-h-full object-contain" crossOrigin="anonymous" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Atas Nama: <span className="font-bold text-gray-800">{profile.company}</span>
                </p>
              </div>

              <div className="w-1/2 bg-blue-50 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-semibold">Subtotal</span>
                  <span className="text-gray-800 font-bold">{formatRupiah(invoice.amount)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-semibold">Pajak (0%)</span>
                  <span className="text-gray-800 font-bold">Rp 0</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-blue-200">
                  <span className="text-lg font-black text-gray-900">Total Tagihan</span>
                  <span className="text-2xl font-black text-blue-600">{formatRupiah(invoice.amount)}</span>
                </div>
              </div>
            </div>

            {/* TANDA TANGAN DINAMIS */}
            <div className="absolute bottom-16 right-12 text-center">
              <p className="text-gray-500 mb-16">Hormat Kami,</p>
              <p className="font-bold text-gray-900 border-b border-gray-400 pb-1 inline-block px-4">{profile.name}</p>
              <p className="text-sm text-gray-500 mt-1">Founder {profile.company}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = "InvoiceTemplate";
export default InvoiceTemplate;
