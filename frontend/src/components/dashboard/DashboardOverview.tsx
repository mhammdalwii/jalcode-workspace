import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Project, Invoice } from "@/types";

interface DashboardOverviewProps {
  projects: Project[];
  invoices: Invoice[];
}

export default function DashboardOverview({ projects, invoices }: DashboardOverviewProps) {
  // OLAH DATA PROYEK (Untuk Donut Chart)
  const projectStats = [
    { name: "Selesai", value: projects.filter((p) => p.status === "Selesai" || p.status === "Publish").length, color: "#10b981" }, // Emerald
    { name: "Proses", value: projects.filter((p) => p.status === "Proses" || p.status === "Drafting").length, color: "#3b82f6" }, // Blue
    { name: "Antrean", value: projects.filter((p) => p.status === "Antrean" || p.status === "Ide").length, color: "#f59e0b" }, // Amber
    { name: "Revisi", value: projects.filter((p) => p.status === "Revisi" || p.status === "Review").length, color: "#ef4444" }, // Red
  ].filter((d) => d.value > 0); // Hanya tampilkan yang ada datanya

  // OLAH DATA KEUANGAN (Untuk Bar Chart)
  const revenueStats = [
    { name: "Lunas (Paid)", total: invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + i.amount, 0), fill: "#10b981" },
    { name: "Belum Bayar", total: invoices.filter((i) => i.status === "Unpaid").reduce((sum, i) => sum + i.amount, 0), fill: "#f59e0b" },
    { name: "Jatuh Tempo", total: invoices.filter((i) => i.status === "Overdue").reduce((sum, i) => sum + i.amount, 0), fill: "#ef4444" },
  ];

  // Fungsi format Rupiah untuk Tooltip Grafik
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* KOTAK 1: GRAFIK PENDAPATAN (REVENUE) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800">Arus Kas & Penagihan</h3>
          <p className="text-sm text-gray-500">Status pembayaran tagihan klien</p>
        </div>
        <div className="h-75 w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueStats} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
              <YAxis tickFormatter={(value) => `Rp ${value / 1000000}Jt`} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value: any) => [formatRupiah(Number(value)), "Total"]} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
              <Bar dataKey="total" radius={[6, 6, 6, 6]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KOTAK 2: DISTRIBUSI PROYEK */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-gray-800">Distribusi Status Proyek</h3>
          <p className="text-sm text-gray-500">Rasio penyelesaian pekerjaan tim</p>
        </div>
        <div className="h-75 w-full">
          {projectStats.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">Belum ada data proyek</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={projectStats} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                  {projectStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value: any) => [formatRupiah(Number(value)), "Total"]} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
