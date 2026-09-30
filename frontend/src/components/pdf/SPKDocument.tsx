import React, { forwardRef } from "react";
import { Project } from "@/types";
import Letterhead from "./Letterhead";
import Image from "next/image";

interface SPKProps {
  project: Project;
  clientSignature?: string | null;
  spkData: {
    duration: string;
    cost: number;
    dpPercent: number;
    t2Percent: number;
    revisions: number;
    revisionScope?: "per_milestone" | "total_project"; // TAMBAHAN: default "per_milestone"
    maintenance: number;
    latePaymentPenaltyPercent?: number; // TAMBAHAN: denda keterlambatan pembayaran per hari, default 0.5
    lateDeliveryGraceDays?: number; // TAMBAHAN: toleransi keterlambatan pengerjaan, default 7
    jurisdiction?: string; // TAMBAHAN: kota pengadilan, default "Makassar"
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pj: any;
}

const SPKDocument = forwardRef<HTMLDivElement, SPKProps>(({ project, clientSignature, spkData, pj }, ref) => {
  const todayDate = new Date();
  const hari = todayDate.toLocaleDateString("id-ID", { weekday: "long" });
  const tanggal = todayDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const pihakKeduaName = pj ? pj.name : "Muhammad Alwi";
  const pihakKeduaRole = pj ? pj.role : "Founder";

  // TAMBAHAN: nilai default supaya SPK lama yang belum mengisi field baru tetap tampil wajar
  const revisionScope = spkData.revisionScope ?? "per_milestone";
  const latePenalty = spkData.latePaymentPenaltyPercent ?? 0.5;
  const graceDays = spkData.lateDeliveryGraceDays ?? 7;
  const jurisdiction = spkData.jurisdiction ?? "Makassar";

  return (
    <div ref={ref} className="bg-white text-black px-12 py-10 print:p-0 w-[210mm] min-h-[297mm] mx-auto text-[13px] leading-relaxed font-serif box-border relative">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm 20mm;
          }
        }
      `}</style>

      {/* KOP SURAT */}
      <Letterhead />

      {/* JUDUL SURAT */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold underline underline-offset-4">SURAT PERJANJIAN KERJA (SPK)</h2>
        <p className="text-gray-600 mt-1 text-xs font-sans">
          Nomor: SPK/JC/{todayDate.getFullYear()}/{project.id.toString().padStart(4, "0")}
        </p>
      </div>

      {/* PARAGRAF PEMBUKA */}
      <p className="mb-4 text-justify">
        Pada hari ini, <strong>{hari}</strong>, tanggal <strong>{tanggal}</strong>, kami yang bertanda tangan di bawah ini:
      </p>

      {/* PIHAK 1 & 2 */}
      <div className="mb-5 space-y-2.5 ml-2">
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
            <strong>{pihakKeduaName}</strong>, bertindak untuk dan atas nama <strong>Jalcode</strong>, beralamat di Makassar, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
          </p>
        </div>
      </div>

      <p className="mb-4 text-justify">Kedua belah pihak sepakat untuk melakukan kerjasama pengembangan sistem dengan ketentuan sebagai berikut:</p>

      {/* PASAL - PASAL */}
      <div className="mb-6 space-y-2.5 ml-2">
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-17.5">Pasal 1</p>
          <p className="text-justify">
            <strong>(Lingkup Kerja):</strong> PIHAK KEDUA akan melaksanakan pekerjaan <strong>{project.title}</strong> sesuai dengan spesifikasi di lampiran teknis (Quotation).
          </p>
        </div>
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-17.5">Pasal 2</p>
          <p className="text-justify">
            <strong>(Waktu):</strong> Pekerjaan dilaksanakan selama <strong>{spkData.duration} hari kerja</strong> sejak Down Payment (DP) diterima.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-17.5">Pasal 3</p>
          <p className="text-justify">
            <strong>(Biaya):</strong> Total nilai proyek sebesar <strong>{formatRupiah(spkData.cost)}</strong>.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-17.5">Pasal 4</p>
          <div className="text-justify">
            <strong>(Pembayaran):</strong>
            <ul className="list-disc ml-6 mt-0.5 space-y-0.5">
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
          <p className="font-bold min-w-17.5">Pasal 5</p>
          <p className="text-justify">
            <strong>(Revisi & Maintenance):</strong> PIHAK KEDUA memberikan <strong>{spkData.revisions}x</strong> revisi minor {/* TAMBAHAN: memperjelas cakupan jatah revisi */}
            <strong>{revisionScope === "per_milestone" ? "untuk setiap tahap/milestone pekerjaan" : "untuk keseluruhan proyek"}</strong>, dan garansi pemeliharaan (maintenance) selama <strong>{spkData.maintenance} bulan</strong>. Revisi di
            luar jatah tersebut, atau perubahan yang mengubah lingkup kerja sebagaimana dimaksud pada Pasal 1, akan dihitung sebagai pekerjaan tambahan dan dikenakan biaya sesuai kesepakatan baru antara kedua belah pihak.
          </p>
        </div>

        {/* TAMBAHAN: Pasal 6 — Kepemilikan Aset */}
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-17.5">Pasal 6</p>
          <p className="text-justify">
            <strong>(Kepemilikan Aset):</strong> Kode sumber (source code), desain, dan aset digital lain yang dihasilkan dari pekerjaan ini sepenuhnya menjadi hak milik PIHAK PERTAMA setelah PIHAK PERTAMA menyelesaikan pelunasan (Termin 3)
            secara penuh. Sebelum pelunasan diterima, hak kepemilikan dan hak pakai penuh tetap berada pada PIHAK KEDUA.
          </p>
        </div>

        {/* TAMBAHAN: Pasal 7 — Keterlambatan */}
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-17.5">Pasal 7</p>
          <div className="text-justify">
            <strong>(Keterlambatan):</strong>
            <ul className="list-disc ml-6 mt-0.5 space-y-0.5">
              <li>
                Apabila PIHAK PERTAMA terlambat membayar termin yang telah jatuh tempo, PIHAK KEDUA berhak menghentikan sementara pengerjaan sampai pembayaran diterima, tanpa mengubah total waktu pengerjaan yang telah disepakati pada Pasal
                2.
              </li>
              <li>
                Apabila PIHAK KEDUA terlambat menyelesaikan pekerjaan melebihi <strong>{graceDays} hari kerja</strong> dari waktu yang disepakati tanpa alasan yang dapat diterima (force majeure atau keterlambatan input dari PIHAK PERTAMA),
                PIHAK KEDUA memberikan potongan sebesar <strong>{latePenalty}%</strong> dari nilai termin yang sedang berjalan untuk setiap 7 hari keterlambatan, dengan potongan maksimal 20% dari nilai termin tersebut.
              </li>
            </ul>
          </div>
        </div>

        {/* TAMBAHAN: Pasal 8 — Kerahasiaan */}
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-17.5">Pasal 8</p>
          <p className="text-justify">
            <strong>(Kerahasiaan):</strong> Kedua belah pihak sepakat untuk menjaga kerahasiaan data, dokumen, dan informasi bisnis yang diperoleh selama proses kerjasama ini, dan tidak akan mengungkapkannya kepada pihak ketiga tanpa
            persetujuan tertulis dari pihak yang bersangkutan, kecuali diwajibkan oleh peraturan perundang-undangan yang berlaku.
          </p>
        </div>

        {/* TAMBAHAN: Pasal 9 — Force Majeure */}
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-17.5">Pasal 9</p>
          <p className="text-justify">
            <strong>(Force Majeure):</strong> Kedua belah pihak dibebaskan dari tanggung jawab atas keterlambatan atau kegagalan pelaksanaan kewajiban dalam perjanjian ini apabila disebabkan oleh keadaan di luar kendali wajar kedua belah
            pihak, termasuk namun tidak terbatas pada bencana alam, gangguan infrastruktur nasional, atau kebijakan pemerintah.
          </p>
        </div>

        {/* TAMBAHAN: Pasal 10 — Penyelesaian Perselisihan */}
        <div className="flex items-start gap-3">
          <p className="font-bold min-w-17.5">Pasal 10</p>
          <p className="text-justify">
            <strong>(Penyelesaian Perselisihan):</strong> Segala perselisihan yang timbul dari perjanjian ini akan diselesaikan terlebih dahulu secara musyawarah untuk mufakat. Apabila tidak tercapai kesepakatan, kedua belah pihak sepakat
            menyelesaikannya melalui Pengadilan Negeri <strong>{jurisdiction}</strong>.
          </p>
        </div>
      </div>

      {/* TANDA TANGAN */}
      <div className="mt-6 break-inside-avoid">
        <p className="text-right mb-4">Makassar, {tanggal}</p>
        <div className="flex justify-between px-8">
          <div className="text-center w-1/2">
            <p className="mb-2 font-bold">PIHAK PERTAMA</p>
            {clientSignature ? (
              <Image src={clientSignature} alt="Tanda Tangan Klien" width={160} height={64} className="mx-auto mb-1 h-16 w-auto object-contain mix-blend-multiply" unoptimized={clientSignature.startsWith("data:")} />
            ) : (
              <div className="mb-1 h-16"></div>
            )}
            <p className="font-bold underline">{project.client?.name || "................................"}</p>
            <p className="text-xs text-gray-500">{project.client?.company || "Klien / Representatif"}</p>
          </div>
          <div className="text-center w-1/2">
            <p className="mb-2 font-bold">PIHAK KEDUA</p>
            <div className="h-16 mb-1 flex items-center justify-center"></div>
            <p className="font-bold">{pihakKeduaName}</p>
            <p className="text-xs text-gray-500">{pihakKeduaRole}, Jalcode</p>
          </div>
        </div>
      </div>
    </div>
  );
});

SPKDocument.displayName = "SPKDocument";
export default SPKDocument;
