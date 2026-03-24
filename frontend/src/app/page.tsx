/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { LogOut, Plus, Trash2, Edit } from "lucide-react";

import { TeamMember, Project } from "@/types";
import ProjectModal from "@/components/ProjectModal";
// Catatan: Modal Tim juga bisa dipisah ke file komponen seperti ProjectModal nanti.

export default function DashboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const fetchData = async () => {
    const token = Cookies.get("token");
    if (!token) return router.push("/login");

    try {
      const [teamsRes, projectsRes] = await Promise.all([
        fetch("http://localhost:8080/api/teams/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/projects/", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const teamsData = await teamsRes.json();
      const projectsText = await projectsRes.text();

      setTeams(teamsData.data || []);
      setProjects(projectsText ? JSON.parse(projectsText).data || [] : []);
    } catch (err) {
      toast.error("Gagal memuat data dari server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Yakin ingin menghapus proyek ini?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus proyek");
      toast.success("Proyek berhasil dihapus!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  if (isLoading) return <div className="min-h-screen flex justify-center items-center">Memuat Workspace...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <Toaster position="top-right" /> {/* Wadah untuk notifikasi elegan */}
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jalcode Workspace</h1>
            <p className="text-gray-500 mt-1">Manajemen Tim Internal & Operasional</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition">
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* PROYEK SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Daftar Proyek Klien</h2>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">{projects?.length || 0} Aktif</span>
            </div>
            <button
              onClick={() => {
                setEditingProject(null);
                setIsProjectModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <Plus size={18} /> Tambah Proyek
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-4 border-b font-medium">Nama Proyek</th>
                  <th className="p-4 border-b font-medium">Kategori</th>
                  <th className="p-4 border-b font-medium">Status</th>
                  <th className="p-4 border-b font-medium">PIC</th>
                  <th className="p-4 border-b font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition border-b last:border-0">
                    <td className="p-4 font-medium text-gray-900">{p.title}</td>
                    <td className="p-4 text-gray-600">{p.category}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.status === "Selesai" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span>
                    </td>
                    <td className="p-4 text-gray-600">{p.pic?.name || "-"}</td>
                    <td className="p-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditingProject(p);
                          setIsProjectModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDeleteProject(p.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* MODAL COMPONENTS */}
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSuccess={fetchData} teams={teams} editData={editingProject} />
    </div>
  );
}
