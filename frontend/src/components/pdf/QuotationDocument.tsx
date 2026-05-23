import React, { forwardRef } from "react";
import { Project } from "@/types";
import Letterhead from "./Letterhead";

interface QuotationItem {
  description: string;
  features: string;
  duration: string;
  cost: number;
}

interface QuotationProps {
  project: Project;
  items: QuotationItem[];
  scope: {
    service: string;
    description: string;
    tech: string;
    maintenance: number;
  };
}

const QuotationDocument = forwardRef<HTMLDivElement, QuotationProps>(({ project, items, scope }, ref) => {
  const totalInvestasi = items.reduce((acc, curr) => acc + curr.cost, 0);
  const totalWaktu = items.reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);

  const todayDate = new Date();
  const tanggal = todayDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const tahun = todayDate.getFullYear();

  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  return (
    <div ref={ref} className="bg-white text-black px-12 py-10 print:p-0 w-[210mm] min-h-[297mm] mx-auto text-[13px] leading-relaxed font-serif box-border relative">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm 20mm; /* Jarak Atas-Bawah & Kiri-Kanan 20 milimeter */
          }
        }
      `}</style>

      <Letterhead />

      {/* JUDUL SURAT & INFO */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold underline underline-offset-4 uppercase tracking-wider">QUOTATION / SURAT PENAWARAN</h2>
        <div className="flex justify-center items-center gap-4 text-xs mt-1 text-gray-700 font-sans">
          <p>
            No: QO/JC/{tahun}/{project.id.toString().padStart(4, "0")}
          </p>
          <span className="text-gray-300">|</span>
          <p>Tanggal: {tanggal}</p>
        </div>
      </div>

      {/* KEPADA YTH & PARAGRAF PEMBUKA */}
      <div className="mb-6">
        <p className="font-bold text-gray-800 text-xs uppercase mb-1">Kepada Yth,</p>
        <p className="text-md font-bold text-gray-900">{project.client?.name || "................................"}</p>
        <p className="text-sm text-gray-700">{project.client?.company || "Instansi / Perusahaan"}</p>
        <p className="text-xs text-gray-600 mt-2">
          <strong>Perihal:</strong> Penawaran Pengembangan {project.title}
        </p>
      </div>

      <p className="mb-6 text-justify">
        Menindaklanjuti diskusi kita sebelumnya, Jalcode siap membantu mendigitalisasi dan meningkatkan efisiensi operasional <strong>{project.client?.company || "perusahaan Anda"}</strong>. Berikut adalah rincian penawaran pengembangan
        sistem yang telah disesuaikan dengan kebutuhan Anda:
      </p>

      <div className="mb-8">
        <h3 className="font-bold bg-blue-50 px-2 py-1 border-l-4 border-blue-600 mb-3 text-sm uppercase tracking-wider">1. Rincian Pekerjaan & Investasi</h3>
        <table className="w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2.5 border border-gray-300 w-32">Pekerjaan</th>
              <th className="p-2.5 border border-gray-300">Spesifikasi Fitur</th>
              <th className="p-2.5 border border-gray-300 text-center w-16">Waktu</th>
              <th className="p-2.5 border border-gray-300 text-right w-28">Biaya (IDR)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="break-inside-avoid">
                <td className="p-2.5 border border-gray-300 font-bold align-top">{item.description}</td>
                <td className="p-2.5 border border-gray-300 text-justify align-top whitespace-pre-line leading-relaxed">{item.features || "-"}</td>
                <td className="p-2.5 border border-gray-300 text-center align-top whitespace-nowrap">{item.duration} Hari</td>
                <td className="p-2.5 border border-gray-300 text-right font-mono align-top font-semibold">{formatRupiah(item.cost)}</td>
              </tr>
            ))}
            <tr className="bg-blue-600 text-white font-bold break-inside-avoid">
              <td colSpan={2} className="p-2.5 border border-blue-700 text-right uppercase tracking-wider">
                TOTAL ESTIMASI
              </td>
              <td className="p-2.5 border border-blue-700 text-center">{totalWaktu} Hari</td>
              <td className="p-2.5 border border-blue-700 text-right">{formatRupiah(totalInvestasi)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-xs text-gray-500 italic">* Biaya di atas sudah termasuk biaya sewa domain & server untuk tahun pertama</p>
      </div>

      {/* 2. FASILITAS TAMBAHAN */}
      <div className="mb-8 break-inside-avoid">
        <h3 className="font-bold bg-blue-50 px-2 py-1 border-l-4 border-blue-600 mb-3 text-sm uppercase tracking-wider">2. Fasilitas Tambahan (Termasuk Biaya)</h3>
        <ul className="list-disc ml-6 space-y-1.5 text-sm">
          <li>
            Penyerahan <strong>Source Code</strong> penuh setelah pelunasan.
          </li>
          <li>
            Garansi pemeliharaan (maintenance) dan perbaikan bug selama <strong>{scope.maintenance} bulan</strong>.
          </li>
          <li>Panduan penggunaan sistem (User Manual).</li>
        </ul>
      </div>

      {/* 3. KETENTUAN PEMBAYARAN */}
      <div className="mb-8 break-inside-avoid">
        <h3 className="font-bold bg-blue-50 px-2 py-1 border-l-4 border-blue-600 mb-3 text-sm uppercase tracking-wider">3. Ketentuan Pembayaran</h3>
        <ul className="list-disc ml-6 space-y-1.5 text-sm">
          <li>
            <strong>Termin I (DP 40%):</strong> Untuk memulai pekerjaan desain (Setelah SPK ditandatangani).
          </li>
          <li>
            <strong>Termin II (40%):</strong> Dibayarkan saat sistem selesai 80% dan siap diuji coba (UAT/Demo).
          </li>
          <li>
            <strong>Termin III (20%):</strong> Pelunasan sebelum sistem diluncurkan (Go-Live).
          </li>
        </ul>
        <p className="mt-3 text-sm font-semibold">Rekening Pembayaran: Bank BNI a/n Muhammad Alwi (1851048968).</p>
      </div>

      {/* PENUTUP & TTD */}
      <div className="break-inside-avoid mt-8">
        <p className="mb-8 text-justify text-sm">
          Penawaran ini berlaku selama <strong>14 hari</strong>. Jika rincian di atas sudah sesuai, kita dapat melangkah ke tahap penandatanganan Surat Perjanjian Kerja (SPK). Terima kasih atas kepercayaannya terhadap tim Jalcode.
        </p>

        <div className="flex justify-end pr-12">
          <div className="text-center">
            <p className="mb-20">Hormat kami,</p>
            <div className="relative inline-block">
              <p className="font-bold text-md underline uppercase">MUHAMMAD ALWI</p>
              <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">Founder, Jalcode</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

QuotationDocument.displayName = "QuotationDocument";
export default QuotationDocument;
