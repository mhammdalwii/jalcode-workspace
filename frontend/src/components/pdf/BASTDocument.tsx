import React, { forwardRef } from "react";
import { Project } from "@/types";
import Letterhead from "./Letterhead";

interface BASTProps {
  project: Project;
  clientSignature?: string | null;
  bastData: {
    spkNumber: string;
    spkDate: string;
    warrantyMonths: number;
    assets: string[];
  };
}

const BASTDocument = forwardRef<HTMLDivElement, BASTProps>(({ project, clientSignature, bastData }, ref) => {
  const todayDate = new Date();
  const hari = todayDate.toLocaleDateString("id-ID", { weekday: "long" });
  const tanggal = todayDate.toLocaleDateString("id-ID", { day: "numeric" });
  const bulan = todayDate.toLocaleDateString("id-ID", { month: "long" });
  const tahun = todayDate.getFullYear();

  // Hitung tanggal akhir garansi
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + bastData.warrantyMonths);
  const tanggalAkhirGaransi = endDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div ref={ref} className="bg-white text-black px-12 py-8 w-[210mm] min-h-[297mm] mx-auto text-[13px] leading-relaxed font-serif">
      {/* KOP SURAT */}
      <Letterhead />

      {/* JUDUL */}
      <div className="text-center mb-8">
        <h2 className="text-lg font-bold underline underline-offset-4 uppercase">Berita Acara Serah Terima (BAST)</h2>
        <p className="text-gray-600 mt-1 text-xs font-sans">
          Nomor: BAST/JC/{tahun}/{project.id.toString().padStart(4, "0")}
        </p>
      </div>

      <p className="mb-6 text-justify">
        Pada hari ini, <strong>{hari}</strong>, tanggal <strong>{tanggal}</strong> bulan <strong>{bulan}</strong> tahun <strong>{tahun}</strong>, bertempat di Makassar, kami yang bertanda tangan di bawah ini:
      </p>

      {/* PIHAK 1 & 2 */}
      <div className="mb-8 space-y-4 ml-2">
        <div className="flex items-start gap-4">
          <p className="font-semibold w-4">1.</p>
          <div>
            <p>
              <strong>Muhammad Alwi</strong>
            </p>
            <p className="text-xs text-gray-500">Jabatan: CEO & Founder Jalcode</p>
            <p>
              Selanjutnya disebut sebagai <strong>PIHAK KESATU (Pelaksana)</strong>.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <p className="font-semibold w-4">2.</p>
          <div>
            <p>
              <strong>{project.client?.name || "................................"}</strong>
            </p>
            <p className="text-xs text-gray-500">Jabatan: {project.client?.company ? `Representatif ${project.client?.company}` : "Klien"}</p>
            <p>
              Selanjutnya disebut sebagai <strong>PIHAK KEDUA (Klien)</strong>.
            </p>
          </div>
        </div>
      </div>

      <p className="mb-4 font-bold">Dengan ini menyatakan bahwa:</p>

      <div className="space-y-4 ml-2">
        <div className="flex items-start gap-3">
          <div className="min-w-[10px] mt-1.5 h-1.5 w-1.5 rounded-full bg-black"></div>
          <p className="text-justify">
            <strong>Penyelesaian Pekerjaan:</strong> PIHAK KESATU telah menyelesaikan seluruh pekerjaan pengembangan sistem <strong>{project.title}</strong> sesuai dengan Surat Perjanjian Kerja (SPK) Nomor: {bastData.spkNumber} tertanggal{" "}
            {bastData.spkDate}.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="min-w-[10px] mt-1.5 h-1.5 w-1.5 rounded-full bg-black"></div>
          <p className="text-justify">
            <strong>Hasil Pengujian (UAT):</strong> PIHAK KEDUA telah melakukan pemeriksaan, pengujian, dan menerima hasil pekerjaan tersebut dengan baik dan menyatakan bahwa fungsi-fungsi sistem telah berjalan sesuai kesepakatan.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="min-w-[10px] mt-1.5 h-1.5 w-1.5 rounded-full bg-black"></div>
          <div>
            <p>
              <strong>Penyerahan Aset:</strong> PIHAK KESATU telah menyerahkan aset digital kepada PIHAK KEDUA berupa:
            </p>
            <ul className="list-disc ml-6 mt-1 text-xs italic">
              {bastData.assets.map((asset, i) => (
                <li key={i}>{asset}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="min-w-[10px] mt-1.5 h-1.5 w-1.5 rounded-full bg-black"></div>
          <p className="text-justify">
            <strong>Masa Garansi & Pemeliharaan:</strong> Dengan ditandatanganinya berita acara ini, maka masa garansi resmi selama <strong>{bastData.warrantyMonths} bulan</strong> dimulai sejak hari ini hingga tanggal{" "}
            <strong>{tanggalAkhirGaransi}</strong>.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="min-w-[10px] mt-1.5 h-1.5 w-1.5 rounded-full bg-black"></div>
          <p className="text-justify italic text-gray-700">
            <strong>Pernyataan Selesai:</strong> Dengan ditandatanganinya dokumen ini, maka kewajiban PIHAK KESATU untuk pengerjaan proyek dinyatakan <strong>Selesai 100%</strong>. Perubahan di luar kesepakatan awal akan dianggap sebagai
            biaya baru.
          </p>
        </div>
      </div>

      {/* TANDA TANGAN */}
      <div className="mt-12 break-inside-avoid">
        <p className="text-right mb-8">
          Makassar, {tanggal} {bulan} {tahun}
        </p>
        <div className="flex justify-between px-8">
          <div className="text-center w-1/2">
            <p className="mb-4 font-bold">PIHAK KESATU</p>
            <div className="h-16 mb-2"></div>
            <p className="font-bold underline">MUHAMMAD ALWI</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">CEO & Founder Jalcode</p>
          </div>
          <div className="text-center w-1/2">
            <p className="mb-4 font-bold">PIHAK KEDUA</p>
            {clientSignature ? <img src={clientSignature} alt="Tanda Tangan Klien" className="h-16 mx-auto mb-1 mix-blend-multiply" /> : <div className="h-16 mb-1"></div>}
            <p className="font-bold underline">{project.client?.name || "................................"}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Pihak Klien</p>
          </div>
        </div>
      </div>
    </div>
  );
});

BASTDocument.displayName = "BASTDocument";
export default BASTDocument;
