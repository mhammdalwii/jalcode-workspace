import React, { forwardRef } from "react";
import { Project } from "@/types";
import Letterhead from "./Letterhead";

interface SPKProps {
  project: Project;
  clientSignature?: string | null;
  spkData: {
    duration: string;
    cost: number;
    dpPercent: number;
    t2Percent: number;
    revisions: number;
    maintenance: number;
  };
}

const SPKDocument = forwardRef<HTMLDivElement, SPKProps>(({ project, clientSignature, spkData }, ref) => {
  const todayDate = new Date();
  const hari = todayDate.toLocaleDateString("id-ID", { weekday: "long" });
  const tanggal = todayDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  return (
    // 🚀 px-12 (Kiri-Kanan Rapi), py-8 (Atas-Bawah Padat)
    <div ref={ref} className="bg-white text-black px-12 py-8 w-[210mm] min-h-[297mm] mx-auto text-[13px] leading-relaxed font-serif">
      {/* KOP SURAT */}
      <Letterhead />

      {/* JUDUL SURAT */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold underline underline-offset-4">SURAT PERJANJIAN KERJA (SPK)</h2>
        <p className="text-gray-600 mt-1 text-xs">
          Nomor: SPK/JC/{todayDate.getFullYear()}/{project.id.toString().padStart(4, "0")}
        </p>
      </div>

      {/* PARAGRAF PEMBUKA */}
      <p className="mb-6 text-justify">
        Pada hari ini, <strong>{hari}</strong>, tanggal <strong>{tanggal}</strong>, kami yang bertanda tangan di bawah ini:
      </p>

      {/* PIHAK 1 & 2 */}
      <div className="mb-8 space-y-4 ml-2">
        <div className="flex items-start gap-4">
          <p className="font-semibold w-4">1.</p>
          <p className="text-justify">
            <strong>{project.client?.name || "................................"}</strong>, bertindak untuk dan atas nama <strong>{project.client?.company || "................................"}</strong>, beralamat di{" "}
            {project.client?.address || "................................................................"}, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <p className="font-semibold w-4">2.</p>
          <p className="text-justify">
            <strong>{project.team_members?.[0]?.name || "Muhammad Alwi"}</strong>, bertindak untuk dan atas nama <strong>Jalcode</strong>, beralamat di Makassar, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
          </p>
        </div>
      </div>

      <p className="mb-6 text-justify">Kedua belah pihak sepakat untuk melakukan kerjasama pengembangan sistem dengan ketentuan sebagai berikut:</p>

      {/* PASAL - PASAL */}
      <div className="mb-10 space-y-3 ml-2">
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-[70px]">Pasal 1</p>
          <p className="text-justify">
            <strong>(Lingkup Kerja):</strong> PIHAK KEDUA akan melaksanakan pekerjaan <strong>{project.title}</strong> sesuai dengan spesifikasi di lampiran teknis (Quotation).
          </p>
        </div>
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-[70px]">Pasal 2</p>
          <p className="text-justify">
            <strong>(Waktu):</strong> Pekerjaan dilaksanakan selama <strong>{spkData.duration} hari kerja</strong> sejak Down Payment (DP) diterima.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-[70px]">Pasal 3</p>
          <p className="text-justify">
            <strong>(Biaya):</strong> Total nilai proyek sebesar <strong>{formatRupiah(spkData.cost)}</strong>.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-[70px]">Pasal 4</p>
          <div className="text-justify">
            <strong>(Pembayaran):</strong>
            <ul className="list-disc ml-6 mt-1 space-y-1">
              <li>
                DP (Termin 1) sebesar <strong>{spkData.dpPercent}%</strong> dibayar di awal.
              </li>
              <li>
                Termin 2 sebesar <strong>{spkData.t2Percent}%</strong> dibayar saat progres mencapai 80%.
              </li>
              <li>Pelunasan (Termin 3) dibayar sebelum sistem rilis (Go-Live).</li>
            </ul>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-[70px]">Pasal 5</p>
          <p className="text-justify">
            <strong>(Revisi & Maintenance):</strong> PIHAK KEDUA memberikan <strong>{spkData.revisions}x</strong> revisi minor dan garansi pemeliharaan (maintenance) selama <strong>{spkData.maintenance} bulan</strong>.
          </p>
        </div>
      </div>

      {/* TANDA TANGAN */}
      <div className="mt-12 break-inside-avoid">
        <p className="text-right mb-6">Makassar, {tanggal}</p>
        <div className="flex justify-between px-8">
          <div className="text-center w-1/2">
            <p className="mb-2 font-bold">PIHAK PERTAMA</p>
            {clientSignature ? <img src={clientSignature} alt="Tanda Tangan Klien" className="h-16 mx-auto mb-1 mix-blend-multiply" /> : <div className="h-16 mb-1"></div>}
            <p className="font-bold underline">{project.client?.name || "................................"}</p>
            <p className="text-xs text-gray-500">{project.client?.company || "Klien / Representatif"}</p>
          </div>
          <div className="text-center w-1/2">
            <p className="mb-2 font-bold">PIHAK KEDUA</p>
            <div className="h-16 mb-1 flex items-center justify-center"></div>
            <p className="font-bold underline">{project.team_members?.[0]?.name || "Muhammad Alwi"}</p>
            <p className="text-xs text-gray-500">Jalcode Agency</p>
          </div>
        </div>
      </div>
    </div>
  );
});

SPKDocument.displayName = "SPKDocument";
export default SPKDocument;
